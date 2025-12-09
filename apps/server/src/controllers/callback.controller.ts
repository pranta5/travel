// src/controllers/callback.controller.ts
import { Request, Response } from "express";
import CallbackRequest from "../models/callback.model";
import { requestCallbackSchema } from "../validators/callback.validator";
import redisClient from "../config/redis";
import logger from "../logger";

// Rate limit: 3 requests per phone per 15 mins
const LIMIT = 3;
const TTL = 900; // 15 minutes

export const requestCallback = async (req: Request, res: Response) => {
  try {
    const ip = (
      req.ip ||
      req.headers["x-forwarded-for"] ||
      "unknown"
    ).toString();
    const userAgent = req.headers["user-agent"] || "unknown";

    const { error, value } = requestCallbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { phone } = value;

    // Rate limiting
    const key = `callback:limit:${phone}`;
    const count = await redisClient.get(key);

    if (count && Number(count) >= LIMIT) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again after 15 minutes.",
      });
    }

    // Create request
    const callback = await CallbackRequest.create({
      ...value,
      ipAddress: ip,
      userAgent,
      status: "pending",
    });

    // Increment counter
    if (count) {
      await redisClient.incr(key);
    } else {
      await redisClient.multi().incr(key).expire(key, TTL).exec();
    }

    logger.info(`New callback request from ${phone} (${value.name})`);

    return res.status(201).json({
      success: true,
      message: "We have received your request! Our team will call you shortly.",
    });
  } catch (err: any) {
    logger.error("Callback Request Error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// Get all callback requests with filters
export const getAllCallbacks = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      fromDate,
      toDate,
      search,
      sort = "-createdAt",
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `callbacks:admin:${JSON.stringify(req.query)}`;
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
        { phone: regex },
        { email: regex },
        { message: regex },
      ];
    }

    const sortObj: any = {};
    const field = (
      (sort as string).startsWith("-") ? (sort as string).slice(1) : sort
    ) as string;
    sortObj[field] = (sort as string).startsWith("-") ? -1 : 1;

    const [result] = await CallbackRequest.aggregate([
      { $match: filter },
      { $sort: sortObj },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          preferredTime: 1,
          message: 1,
          status: 1,
          destination: 1,
          remark: 1,
          calledAt: 1,
          source: 1,
          createdAt: 1,
          "package.title": 1,
          "package.slug": 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const callbacks = result.data || [];
    const total = result.total[0]?.count || 0;

    const response = {
      success: true,
      data: callbacks,
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
    logger.error("Get All Callbacks Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//  Update callback status
export const updateCallbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remark, assignedTo } = req.body;

    const validStatuses = [
      "pending",
      "called",
      "no-answer",
      "interested",
      "not-interested",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const updateData: any = {
      status,
      remark,
      assignedTo,
    };

    if (status === "called" || status === "no-answer") {
      updateData.calledAt = new Date();
    }

    const callback = await CallbackRequest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!callback) {
      return res
        .status(404)
        .json({ success: false, error: "Callback request not found" });
    }

    // Invalidate cache
    const keys = await redisClient.keys("callbacks:admin:*");
    if (keys.length) {
      await redisClient.del(keys);
    }

    return res.json({
      success: true,
      message: "Callback updated successfully",
      data: callback,
    });
  } catch (err: any) {
    logger.error("Update Callback Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
