import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Package from "../models/package.model";
import {
  createBookingSchema,
  updatePaymentStatusSchema,
  updateBookingStatusSchema,
} from "../validators/booking.validator";
import redisClient from "../config/redis";
import logger from "../logger";
import { Types, PipelineStage } from "mongoose";
// Helper: invalidate user-specific cache
const invalidateUserBookingsCache = async (userId: string) => {
  try {
    const keys = await redisClient.keys(`bookings:user:${userId}:*`);
    if (keys.length > 0) await redisClient.del(keys);
  } catch (err) {
    logger.warn("Failed to invalidate booking cache", err);
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const { error, value } = createBookingSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    const { package: packageId, totalTraveler, travelDate, category } = value;
    // Check if package exists and is active
    const pkg = await Package.findOne({ _id: value.package, isActive: true });
    if (!pkg)
      return res
        .status(404)
        .json({ success: false, error: "Package not found or inactive" });
    // Find price for selected category
    const priceEntry = pkg.categoryAndPrice.find(
      (item: any) => item.category.toLowerCase() === category.toLowerCase()
    );

    if (!priceEntry) {
      return res.status(400).json({
        success: false,
        error: `Category "${category}" not available for this package`,
      });
    }
    // Calculate totalAmount (you can customize pricing logic)
    const totalAmount = priceEntry.price * value.totalTraveler;

    const booking = await Booking.create({
      user: userId,
      package: packageId,
      totalTraveler,
      travelDate,
      category: category.toLowerCase(), // save normalized
      totalAmount,
      paidAmount: 0,
      walletUsedAmount: 0,
      paymentStatus: "pending",
      bookingStatus: "pending",
      bookingDate: new Date(),
    });

    await invalidateUserBookingsCache(userId);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...booking.toObject(),
        selectedCategory: category,
        pricePerPerson: priceEntry.price,
      },
    });
  } catch (err: any) {
    logger.error("Create Booking Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get my bookings (user)

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const cacheKey = `bookings:user:${userId}:p${page}:l${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, ...JSON.parse(cached) });
    }

    // ← Explicitly type the pipeline
    const pipeline: PipelineStage[] = [
      { $match: { user: new Types.ObjectId(userId) } },

      // Lookup package
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },

      // Clean up fields
      {
        $project: {
          __v: 0,
          "package.__v": 0,
          "package.createdAt": 0,
          "package.updatedAt": 0,
          "package.description": 0,
          "package.itinerary": 0,
          "package.inclusions": 0,
          "package.exclusions": 0,
        },
      },

      { $sort: { bookingDate: -1 } },

      // Facet for data + pagination metadata in ONE query
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          metadata: [
            { $count: "total" },
            {
              $addFields: {
                page,
                limit,
                pages: { $ceil: { $divide: ["$total", limit] } },
                hasNext: { $lt: [{ $multiply: [page, limit] }, "$total"] },
                hasPrev: { $gt: [page, 1] },
              },
            },
          ],
        },
      },
    ];

    // ← Now TypeScript is happy
    const [result] = await Booking.aggregate<{ data: any[]; metadata: any[] }>(
      pipeline
    );

    const data = result.data || [];
    const meta = result.metadata[0] || { total: 0, page, limit, pages: 0 };

    const response = {
      success: true,
      data,
      pagination: {
        page: meta.page ?? page,
        limit: meta.limit ?? limit,
        total: meta.total || 0,
        pages: meta.pages || 0,
        hasNext: meta.hasNext ?? false,
        hasPrev: meta.hasPrev ?? false,
      },
    };

    await redisClient.setex(cacheKey, 300, JSON.stringify(response));

    return res.json(response);
  } catch (err: any) {
    logger.error("Get My Bookings Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// All Bppking
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      fromDate,
      toDate,
      sort = "-bookingDate",
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `bookings:admin:${JSON.stringify({
      page: pageNum,
      limit: limitNum,
      status,
      paymentStatus,
      search,
      fromDate,
      toDate,
      sort,
    })}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info("Cache hit: admin bookings");
      return res.json(JSON.parse(cached));
    }

    // Base match
    const match: any = {};

    if (status) match.bookingStatus = status;
    if (paymentStatus) match.paymentStatus = paymentStatus;

    if (fromDate || toDate) {
      match.bookingDate = {};
      if (fromDate) match.bookingDate.$gte = new Date(fromDate as string);
      if (toDate) match.bookingDate.$lte = new Date(toDate as string);
    }

    // Search: user name/email OR package title
    if (search) {
      const regex = { $regex: search as string, $options: "i" };
      match.$or = [
        { "user.name": regex },
        { "user.email": regex },
        { "package.title": regex },
      ];
    }

    // Sort object
    const sortObj: any = {};
    const sortField = (sort as string).startsWith("-")
      ? (sort as string).slice(1)
      : (sort as string);
    const sortOrder = (sort as string).startsWith("-") ? -1 : 1;
    sortObj[sortField] = sortOrder;

    const pipeline = [
      { $match: match },

      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // Lookup package
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },

      // Final fields
      {
        $project: {
          __v: 0,
          "user.password": 0,
          "user.__v": 0,
          "user.createdAt": 0,
          "user.updatedAt": 0,
          "package.__v": 0,
          "package.description": 0,
          "package.itinerary": 0,
          "package.inclusions": 0,
          "package.exclusions": 0,
        },
      },

      { $sort: sortObj },

      // Pagination + total count in ONE query
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await Booking.aggregate(pipeline);

    const bookings = result.data || [];
    const total = result.totalCount[0]?.total || 0;

    const response = {
      success: true,
      data: bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    };

    await redisClient.setex(cacheKey, 120, JSON.stringify(response));

    return res.json(response);
  } catch (err: any) {
    logger.error("Get All Bookings Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// Admin only: update payment status (after payment gateway callback)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updatePaymentStatusSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });

    const booking = await Booking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });

    // Optional: only allow if current status is "pending"
    if (booking.paymentStatus !== "pending") {
      return res
        .status(400)
        .json({ success: false, error: "Payment already processed" });
    }

    booking.paymentStatus = value.paymentStatus;
    if (value.paymentStatus === "paid") {
      booking.paidAmount = booking.totalAmount;
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
    }

    await booking.save();
    await invalidateUserBookingsCache(booking.user.toString());

    res.json({ success: true, data: booking });
  } catch (err: any) {
    logger.error("Update Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error, value } = updateBookingStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const newStatus = value.bookingStatus;

    // Business rules
    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["reschedule", "complete", "cancelled"],
      reschedule: ["confirmed", "complete", "cancelled"],
      complete: [],
      cancelled: [],
    };

    if (!allowedTransitions[booking.bookingStatus].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from "${booking.bookingStatus}" to "${newStatus}"`,
      });
    }

    // Special rule: can only confirm if payment is paid
    if (newStatus === "confirmed" && booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Cannot confirm booking until payment is completed",
      });
    }

    booking.bookingStatus = newStatus;
    await booking.save();

    // Invalidate cache
    await invalidateUserBookingsCache(booking.user.toString());

    return res.json({
      success: true,
      message: `Booking ${newStatus} successfully`,
      data: booking,
    });
  } catch (err: any) {
    logger.error("Update Booking Status Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
