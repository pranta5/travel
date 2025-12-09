// src/controllers/enquiry.controller.ts
import { Request, Response } from "express";
import Enquiry from "../models/enquiry.model";
import { createEnquirySchema } from "../validators/enquiry.validator";
import redisClient from "../config/redis";
import logger from "../logger";

// Rate limit: max 5 enquiries per email/phone per hour
const ENQUIRY_RATE_LIMIT = 5;
const RATE_LIMIT_TTL = 3600; // 1 hour

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { error, value } = createEnquirySchema.validate(req.body, {
      abortEarly: false,
      convert: true, // convert types if possible
      stripUnknown: true, // remove unexpected properties
    });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details.map((d) => d.message).join(", "),
      });
    }

    const { email, phone } = value;

    // Rate limiting per email + phone
    const rateKey = `enquiry:limit:${email.toLowerCase()}:${phone}`;
    const attempts = await redisClient.get(rateKey);
    if (attempts && Number(attempts) >= ENQUIRY_RATE_LIMIT) {
      return res.status(429).json({
        success: false,
        error: "Too many enquiries. Please try again after 1 hour.",
      });
    }

    // Create enquiry
    const enquiry = await Enquiry.create({
      ...value,
      email: email.toLowerCase(),
      status: "pending",
    });

    // Increment rate limit
    if (attempts) {
      await redisClient.incr(rateKey);
    } else {
      await redisClient
        .multi()
        .incr(rateKey)
        .expire(rateKey, RATE_LIMIT_TTL)
        .exec();
    }

    logger.info(`New enquiry from ${email} - ${phone}`);

    return res.status(201).json({
      success: true,
      message: "Thank you! Our team will contact you soon.",
      data: enquiry,
    });
  } catch (err: any) {
    logger.error("Create Enquiry Error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// Admin: Get all enquiries with filters
export const getAllEnquiries = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      fromDate,
      toDate,
      search,
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `enquiries:admin:${JSON.stringify(req.query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const filter: any = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }
    if (search) {
      const regex = { $regex: search as string, $options: "i" };
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { message: regex },
      ];
    }

    const [result] = await Enquiry.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const enquiries = result.data;
    const total = result.total[0]?.count || 0;

    const response = {
      success: true,
      data: enquiries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    await redisClient.setex(cacheKey, 10, JSON.stringify(response));

    return res.json(response);
  } catch (err: any) {
    logger.error("Get Enquiries Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Admin: Update status/remark/followUp
export const updateEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remark, followUpDate, assignedTo } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status, remark, followUpDate, assignedTo },
      { new: true }
    );

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, error: "Enquiry not found" });
    }

    // Invalidate cache
    await redisClient.del("enquiries:admin:*");

    return res.json({
      success: true,
      message: "Enquiry updated",
      data: enquiry,
    });
  } catch (err: any) {
    logger.error("Update Enquiry Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
