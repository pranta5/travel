import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Package from "../models/package.model";
import { createBookingSchema } from "../validators/booking.validator";
import redisClient from "../config/redis";
import logger from "../logger";
import { Types, PipelineStage } from "mongoose";
import { generateBookingId } from "../utils/generateBookingId";

// Helper: invalidate user-specific cache
const invalidateUserBookingsCache = async (userId: string) => {
  try {
    const keys = await redisClient.keys(`bookings:user:${userId}:*`);
    if (keys.length > 0) await redisClient.del(keys);
  } catch (err) {
    logger.warn("Failed to invalidate booking cache", err);
  }
};

// helpers
const toDateKey = (d: Date | string): string => {
  return new Date(d).toISOString().slice(0, 10);
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    // Joi validation (convert: true so date strings become Date objects if you want)
    const { error, value } = createBookingSchema.validate(req.body, {
      convert: true,
    });
    if (error)
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });

    const {
      package: packageId,
      totalTraveler,
      travelDate,
      category,
      // optional fields from client
      paymentStatus: incomingPaymentStatus,
      paidAmount: incomingPaidAmount,
      bookingStatus: incomingBookingStatus,
    } = value;

    // Normalize and validate travelDate string -> date-key
    const requestedDateKey = toDateKey(travelDate);
    if (!requestedDateKey) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid travelDate format" });
    }

    // Load package and ensure active
    const pkg = await Package.findOne({
      _id: packageId,
      isActive: true,
    }).lean();
    if (!pkg) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found or inactive" });
    }

    // Validate category and find price
    const normalizedCategory = String(category).toLowerCase();
    const priceEntry = (pkg.categoryAndPrice || []).find(
      (p: any) => String(p.category).toLowerCase() === normalizedCategory
    );
    if (!priceEntry) {
      return res.status(400).json({
        success: false,
        error: `Category "${category}" not available for this package`,
      });
    }

    // Validate selected date exists in availableDates (date-only)
    const availableKeys = (pkg.availableDates || [])
      .map((d: Date) => toDateKey(d))
      .filter(Boolean) as string[];

    if (!availableKeys.includes(requestedDateKey)) {
      return res.status(400).json({
        success: false,
        error: `Selected date ${requestedDateKey} is not available for this package.`,
        availableDates: availableKeys,
      });
    }

    // Prevent booking past dates (defensive)
    const todayKey = toDateKey(new Date());
    if (requestedDateKey < todayKey) {
      return res.status(400).json({
        success: false,
        error: `Selected date ${requestedDateKey} is in the past.`,
      });
    }

    // Calculate total amount
    const totalAmount = Number(priceEntry.price) * Number(totalTraveler);

    // Defaults for payment/booking fields if client didn't send them
    const paymentStatus = incomingPaymentStatus ?? "pending"; // "paid" or "pending"
    const paidAmount = Number(incomingPaidAmount ?? 0);
    const bookingStatus = incomingBookingStatus ?? "pending";

    // Generate bookingId
    const bookingId = generateBookingId();

    // Normalize travelDate to midnight UTC
    const travelDateToSave = new Date(`${requestedDateKey}T00:00:00.000Z`);

    // Create booking
    const booking = await Booking.create({
      bookingId,
      user: userId,
      package: packageId,
      totalTraveler: Number(totalTraveler),
      travelDate: travelDateToSave,
      category: normalizedCategory,
      totalAmount,
      paymentStatus,
      paidAmount,
      bookingStatus,
      bookingDate: new Date(),
    });

    // Invalidate user booking cache (so "My Bookings" shows new booking)
    await invalidateUserBookingsCache(userId);

    // Respond with booking (and top-level bookingId for convenience)
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingId,
      data: {
        ...booking.toObject(),
        selectedCategory: category,
        pricePerPerson: priceEntry.price,
      },
    });
  } catch (err: any) {
    logger.error("Create Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
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
          "package.isActive": 0,
          "package.availableDates": 0,
          "package.activity": 0,
          "package.hotel": 0,
          "package.categoryAndPrice": 0,
          "package.slug": 0,
          "package.overview": 0,
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

    await redisClient.setex(cacheKey, 10, JSON.stringify(response));

    return res.json(response);
  } catch (err: any) {
    logger.error("Get My Bookings Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// All Booking
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
          "package.createdAt": 0,
          "package.updatedAt": 0,
          "package.description": 0,
          "package.itinerary": 0,
          "package.inclusions": 0,
          "package.exclusions": 0,
          "package.isActive": 0,
          "package.activity": 0,
          "package.hotel": 0,
          "package.categoryAndPrice": 0,
          "package.slug": 0,
          "package.overview": 0,
          "package.featuredImage": 0,
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

    await redisClient.setex(cacheKey, 10, JSON.stringify(response));

    return res.json(response);
  } catch (err: any) {
    logger.error("Get All Bookings Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// update

// Allowed categories
const ALLOWED_CATEGORIES = ["standard", "deluxe", "superdeluxe"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = (req.user as any)?.role ?? "user";

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // Only owner or admin
    if (String(booking.user) !== String(userId) && role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // Load package to validate category + travelDate
    const pkg = await Package.findById(booking.package).lean();
    if (!pkg) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found or inactive" });
    }

    const update: any = {};

    // ========== CATEGORY ==========
    if (req.body.category !== undefined) {
      const newCategoryStr = String(req.body.category).toLowerCase();

      if (!ALLOWED_CATEGORIES.includes(newCategoryStr as AllowedCategory)) {
        return res.status(400).json({
          success: false,
          error: `Category "${req.body.category}" is not valid`,
        });
      }

      update.category = newCategoryStr;

      // validate category exists in package
      const priceMatch = pkg.categoryAndPrice.find(
        (p) => p.category.toLowerCase() === newCategoryStr
      );

      if (!priceMatch) {
        return res.status(400).json({
          success: false,
          error: `Category "${newCategoryStr}" not available in this package`,
        });
      }
    }

    // ========== TRAVEL DATE ==========
    if (req.body.travelDate !== undefined) {
      const key = toDateKey(req.body.travelDate);

      const availableKeys = (pkg.availableDates || [])
        .map((d) => toDateKey(d))
        .filter(Boolean);

      if (!availableKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          error: `Selected date ${key} is not available`,
        });
      }

      update.travelDate = new Date(`${key}T00:00:00.000Z`);
    }

    // ========== TOTAL TRAVELERS ==========
    if (req.body.totalTraveler !== undefined) {
      const tt = Number(req.body.totalTraveler);
      if (!Number.isInteger(tt) || tt <= 0) {
        return res.status(400).json({
          success: false,
          error: "totalTraveler must be a positive integer",
        });
      }

      update.totalTraveler = tt;
    }

    // ========== OPTIONAL FIELDS ==========
    if (req.body.paymentStatus !== undefined)
      update.paymentStatus = req.body.paymentStatus;
    if (req.body.paidAmount !== undefined)
      update.paidAmount = req.body.paidAmount;
    if (req.body.bookingStatus !== undefined)
      update.bookingStatus = req.body.bookingStatus;

    // ========== RECALCULATE TOTAL AMOUNT ==========
    const finalCategory = update.category ?? booking.category;
    const finalTraveler = update.totalTraveler ?? booking.totalTraveler;

    const priceEntry = pkg.categoryAndPrice.find(
      (p) => p.category.toLowerCase() === finalCategory
    );

    if (!priceEntry) {
      return res.status(400).json({
        success: false,
        error: `Category "${finalCategory}" not available`,
      });
    }

    update.totalAmount = Number(priceEntry.price) * Number(finalTraveler);

    // Save update
    const updatedBooking = await Booking.findByIdAndUpdate(id, update, {
      new: true,
    });

    await invalidateUserBookingsCache(String(booking.user));

    return res.json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (err: any) {
    logger.error("Update Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
