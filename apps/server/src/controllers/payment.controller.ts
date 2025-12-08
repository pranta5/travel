import Stripe from "stripe";
import { Request, Response } from "express";
import Package from "../models/package.model";
import { generateBookingId } from "../utils/generateBookingId";
import Booking from "../models/booking.model";
import env from "../config/env";
import { JwtUserPayload } from "../types/auth.types";
import logger from "../logger";
import MailService from "../services/mail.service";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Extend Request with optional user (adjust shape to match your auth)
interface AuthRequest extends Request {
  user?: JwtUserPayload;
}
const toDateKey = (d: Date | string): string => {
  return new Date(d).toISOString().slice(0, 10);
};
// POST /payments/create-checkout-session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    // === 0. Auth: ensure req.user exists (auth middleware must populate req.user) ===
    const userId = (req as any).user?.userId;
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    // === 1. Validate payload (do your Joi validation before this or use createBookingSchema) ===
    const { packageId, totalTraveler, travelDate, category } = req.body;
    if (!packageId || !totalTraveler || !travelDate || !category) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Normalize inputs
    const normalizedCategory = String(category).toLowerCase();
    const requestedDateKey = toDateKey(travelDate);
    if (!requestedDateKey)
      return res
        .status(400)
        .json({ success: false, error: "Invalid travel date" });

    // === 2. Fetch package & validate ===
    const pkg = await Package.findOne({
      _id: packageId,
      isActive: true,
    }).lean();
    if (!pkg)
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });

    const priceEntry = (pkg.categoryAndPrice || []).find(
      (p: any) => String(p.category).toLowerCase() === normalizedCategory
    );
    if (!priceEntry)
      return res
        .status(400)
        .json({ success: false, error: "Invalid category" });

    // check availableDates
    const dates = (pkg.availableDates || []).map((d: any) => toDateKey(d));
    if (!dates.includes(requestedDateKey))
      return res
        .status(400)
        .json({ success: false, error: "Date not available" });

    // total amount (DB currency assumed INR)
    const unitPrice = Number(priceEntry.price);
    const totalAmount = unitPrice * Number(totalTraveler); // in INR
    const amountInPaisa = Math.round(totalAmount * 100); // smallest currency unit

    // === 3. Create Stripe session ===
    const bookingId = generateBookingId(); // pre-generate so we can save booking
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${env.FRONTEND_BASE_URL}/booking-success/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_BASE_URL}/booking/${packageId}`,
      metadata: {
        bookingId,
        packageId: String(packageId),
        userId: String(userId),
        travelDate: requestedDateKey,
        category: normalizedCategory,
        totalTraveler: String(totalTraveler),
      },
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${pkg.title} - ${normalizedCategory}`,
              description: pkg.overview || undefined,
            },
            unit_amount: Math.round(unitPrice * 100), // per person in paisa
          },
          quantity: Number(totalTraveler),
        },
      ],
    });

    // === 4. Create provisional booking (must satisfy schema) ===
    // Build a safe paymentInfo object (don't pass undefined fields)
    const paymentInfo: any = {
      stripeSessionId: session.id ?? null,
      paymentIntentId: (session.payment_intent as string) ?? null,
      amount_total: session.amount_total ?? amountInPaisa,
      currency: session.currency ?? "inr",
    };

    await Booking.create({
      bookingId,
      user: userId,
      package: packageId,
      totalTraveler: Number(totalTraveler),
      travelDate: new Date(`${requestedDateKey}T00:00:00.000Z`),
      category: normalizedCategory,
      totalAmount,
      paidAmount: totalAmount,
      walletUsedAmount: 0,
      paymentStatus: "paid",
      bookingStatus: "pending",
      paymentInfo,
    });

    //send mail

    try {
      const userEmail = (req as any).user?.email;
      const userName = (req as any).user?.name || "Traveler";

      if (userEmail) {
        const subject = `${
          process.env.APP_NAME || "hikesike"
        } — Booking created (${bookingId})`;
        const html = `
          <p>Hi ${userName},</p>
          <p>Thanks for starting a booking with ${"hikesike"}.</p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Package:</strong> ${pkg.title}</p>
          <p><strong>Travel Date:</strong> ${requestedDateKey}</p>
          <p><strong>Category:</strong> ${normalizedCategory}</p>
          <p><strong>Total Travelers:</strong> ${totalTraveler}</p>
          <p><strong>Total (INR):</strong> ₹${totalAmount.toFixed(2)}</p>
          <hr/>
          <p>If you didn't request this, please contact support.</p>
        `;
        const text = `Hi ${userName},\n\nBooking created (${bookingId})\nPackage: ${
          pkg.title
        }\nTravel Date: ${requestedDateKey}\nCategory: ${normalizedCategory}\nTotal Travelers: ${totalTraveler}\nTotal: ₹${totalAmount.toFixed(
          2
        )}\n\nComplete payment: ${session.url}`;

        // Await so we can log result — but don't fail the request if mail fails
        await MailService.sendMail(userEmail, subject, html, text);
      } else {
        console.warn(
          "createCheckoutSession: user email not available in req.user — skipping provisional email"
        );
      }
    } catch (mailErr) {
      // Log the mail error — don't block the response
      console.error(
        "createCheckoutSession: failed to send booking email",
        mailErr
      );
    }

    // return session URL to client
    return res
      .status(200)
      .json({ success: true, url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("createCheckoutSession error:", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Server error" });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const rawBody = (req as any).rawBody ?? req.body; // prefer explicit rawBody if set by middleware

  if (!sig) {
    logger.warn("Stripe webhook missing signature header");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    // IMPORTANT: pass the raw Buffer/string that express.raw provided
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    logger.error("Webhook signature verification failed.", err?.message ?? err);
    return res
      .status(400)
      .send(`Webhook Error: ${err?.message ?? "invalid signature"}`);
  }

  try {
    logger.info("Stripe webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId as string | undefined;
      logger.info(
        "checkout.session.completed for bookingId:",
        bookingId,
        "sessionId:",
        session.id
      );

      if (bookingId) {
        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
          logger.warn(
            "Provisional booking not found for bookingId:",
            bookingId
          );
        } else {
          booking.paymentStatus = "paid";
          booking.bookingStatus = "confirmed";
          booking.paymentInfo = {
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent as string | null,
            amount_total: session.amount_total ?? undefined,
            currency: session.currency ?? undefined,
          };
          await booking.save();
          logger.info("Booking updated to paid/confirmed:", bookingId);

          // Optional: invalidate caches, send confirmation email, update availability, etc.
        }
      } else {
        logger.warn(
          "No bookingId metadata present on the session:",
          session.id
        );
      }
    } else {
      logger.info("Unhandled event type:", event.type);
    }

    // Respond quickly
    res.status(200).json({ received: true });
  } catch (err: any) {
    logger.error("Webhook processing error:", err);
    // return 500 to indicate failure (Stripe will retry)
    return res.status(500).send("Webhook handler error");
  }
};
