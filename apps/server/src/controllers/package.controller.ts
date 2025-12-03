// src/controllers/package.controller.ts
import { Request, Response } from "express";
import Package from "../models/package.model";
import {
  createPackageSchema,
  updatePackageSchema,
} from "../validators/package.validator";
import {
  uploadSingleImage,
  uploadMultipleImagesCloudi,
  deleteFromCloudinary,
} from "../services/upload.service";
import redisClient from "../config/redis";
import logger from "../logger";
import generateUniqueSlug from "../utils/slugGenerator";

// Helper: Safely parse JSON strings from form-data
const parseJSON = (value: any, fieldName: string): any => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (err) {
      throw new Error(`Invalid JSON in "${fieldName}"`);
    }
  }
  return value;
};

// Cache keys
const getAllCacheKey = (query: string) => `packages:all:${query}`;
const getBySlugCacheKey = (slug: string) => `package:slug:${slug}`;

// Invalidate related caches
const invalidatePackageCaches = async (slug?: string) => {
  try {
    const keys = await redisClient.keys("packages:all:*");
    if (keys.length > 0) await redisClient.del(keys);
    if (slug) await redisClient.del(getBySlugCacheKey(slug));
    logger.info("Package caches invalidated");
  } catch (err) {
    logger.warn("Failed to invalidate Redis cache", err);
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    let body = req.body;

    // Auto-parse all JSON string fields from form-data
    body = {
      ...body,
      destination: parseJSON(body.destination, "destination"),
      categoryAndPrice: parseJSON(body.categoryAndPrice, "categoryAndPrice"),
      itinerary: parseJSON(body.itinerary, "itinerary"),
      activity: parseJSON(body.activity, "activity"),
    };

    const validated = createPackageSchema.validate(body, { abortEarly: false });
    if (validated.error)
      throw new Error(validated.error.details.map((d) => d.message).join(", "));

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload featured image
    if (!files?.featuredImage?.[0])
      throw new Error("featuredImage is required");
    validated.value.featuredImage = await uploadSingleImage(
      files.featuredImage[0].path
    );

    // Upload activity images
    if (validated.value.activity?.length > 0) {
      const activityFiles = files?.activityImages || [];
      if (activityFiles.length !== validated.value.activity.length) {
        throw new Error(
          "Number of activityImages must match number of activities"
        );
      }
      const urls = await uploadMultipleImagesCloudi(
        activityFiles.map((f) => f.path)
      );
      validated.value.activity = validated.value.activity.map(
        (act: any, i: number) => ({
          ...act,
          activityImage: urls[i],
        })
      );
    }

    // Auto slug
    validated.value.slug = await generateUniqueSlug(validated.value.title);

    const pkg = await Package.create(validated.value);

    // Invalidate cache
    await invalidatePackageCaches(pkg.slug);

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: pkg,
    });
  } catch (err: any) {
    logger.error("Create Package Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Helper: escape user string for safe regex
function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/packages
 * Query params: page, limit, destination (partial), category
 */
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, destination, category } = req.query;
    const pageNum = Math.max(1, Number(page || 1));
    const limitNum = Math.max(1, Number(limit || 10));
    const skip = (pageNum - 1) * limitNum;

    // Normalize query for cache key (avoid cache misses due to case/spacing)
    const normalizedQuery: any = { ...req.query };
    if (normalizedQuery.destination) {
      normalizedQuery.destination = String(normalizedQuery.destination)
        .trim()
        .toLowerCase();
    }
    if (normalizedQuery.category) {
      normalizedQuery.category = String(normalizedQuery.category)
        .trim()
        .toLowerCase();
    }
    const cacheKey = `packages:list:${JSON.stringify(normalizedQuery)}`;

    // Try redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info("Cache hit: packages list");
      return res.json({ success: true, ...JSON.parse(cached) });
    }

    // Build match stage base
    const baseMatch: any = { isActive: true };

    // If category provided — exact match on category field inside categoryAndPrice
    if (category) {
      baseMatch["categoryAndPrice.category"] = category as string;
    }

    // If no destination/search provided, use simple pipeline (no scoring)
    if (!destination) {
      const [result] = await Package.aggregate([
        { $match: baseMatch },
        {
          $lookup: {
            from: "hotels",
            localField: "hotel",
            foreignField: "_id",
            as: "hotel",
          },
        },
        { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limitNum },
              {
                $project: {
                  __v: 0,
                  "hotel.__v": 0,
                  "hotel.createdAt": 0,
                  "hotel.updatedAt": 0,
                },
              },
            ],
            totalCount: [{ $count: "total" }],
          },
        },
      ]);

      const packages = result.data;
      const total = result.totalCount[0]?.total || 0;
      const response = {
        data: packages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };

      await redisClient.setex(cacheKey, 300, JSON.stringify(response));
      return res.json({ success: true, ...response });
    }

    // ---------- Destination/search provided: build regex and scoring ----------
    const raw = String(destination).trim();
    const escaped = escapeRegex(raw);
    // substring (anywhere) case-insensitive. Use ^ for starts-with if desired.
    const regex = new RegExp(escaped, "i");

    // Aggregation pipeline with scoring:
    // score weights: title match = 5, destination match = 4, overview match = 2
    const pipeline: any[] = [
      { $match: baseMatch },

      // compute boolean matches and score
      {
        $addFields: {
          // title match boolean
          titleMatch: {
            $cond: [{ $regexMatch: { input: "$title", regex } }, 1, 0],
          },
          // overview match boolean
          overviewMatch: {
            $cond: [
              { $regexMatch: { input: { $ifNull: ["$overview", ""] }, regex } },
              1,
              0,
            ],
          },
          // destination match boolean: check any array element with regex
          destinationMatch: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$destination", []] },
                        as: "d",
                        cond: { $regexMatch: { input: "$$d", regex } },
                      },
                    },
                  },
                  0,
                ],
              },
              1,
              0,
            ],
          },
        },
      },

      // compute score using weights
      {
        $addFields: {
          searchScore: {
            $add: [
              { $multiply: ["$titleMatch", 5] },
              { $multiply: ["$destinationMatch", 4] },
              { $multiply: ["$overviewMatch", 2] },
            ],
          },
        },
      },

      // Only keep docs that matched at least one field (score > 0)
      { $match: { searchScore: { $gt: 0 } } },

      // lookup hotel and unwind
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },

      // sort by relevance (score desc), then newest
      { $sort: { searchScore: -1, createdAt: -1 } },

      // pagination + projection
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                titleMatch: 0,
                overviewMatch: 0,
                destinationMatch: 0,
                searchScore: 0,
                __v: 0,
                "hotel.__v": 0,
                "hotel.createdAt": 0,
                "hotel.updatedAt": 0,
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await Package.aggregate(pipeline);

    const packages = result.data || [];
    const total = result.totalCount[0]?.total || 0;

    const response = {
      data: packages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // Cache for 5 minutes
    await redisClient.setex(cacheKey, 300, JSON.stringify(response));

    res.json({ success: true, ...response });
  } catch (err: any) {
    logger.error("Get All Packages Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPackageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cacheKey = `package:slug:${slug}`;

    // Try Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info("Cache hit: package slug");
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const result = await Package.aggregate([
      { $match: { slug, isActive: true } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } }, // keep package even if no hotel
      {
        $project: {
          __v: 0,
          "hotel.__v": 0,
          "hotel.createdAt": 0,
          "hotel.updatedAt": 0,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    const pkg = result[0];

    // Cache for 10 minutes
    await redisClient.setex(cacheKey, 600, JSON.stringify(pkg));

    res.json({ success: true, data: pkg });
  } catch (err: any) {
    logger.error("Get Package By Slug Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let body = req.body;

    body = {
      ...body,
      destination: parseJSON(body.destination, "destination"),
      categoryAndPrice: parseJSON(body.categoryAndPrice, "categoryAndPrice"),
      itinerary: parseJSON(body.itinerary, "itinerary"),
      activity: parseJSON(body.activity, "activity"),
    };

    const validated = updatePackageSchema.validate(body, { abortEarly: false });
    if (validated.error)
      throw new Error(validated.error.details.map((d) => d.message).join(", "));

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.featuredImage?.[0]) {
      validated.value.featuredImage = await uploadSingleImage(
        files.featuredImage[0].path
      );
    }

    if (
      validated.value.activity?.length > 0 &&
      files?.activityImages?.length > 0
    ) {
      if (files.activityImages.length !== validated.value.activity.length) {
        throw new Error("activityImages count must match activities");
      }
      const urls = await uploadMultipleImagesCloudi(
        files.activityImages.map((f) => f.path)
      );
      validated.value.activity = validated.value.activity.map(
        (act: any, i: number) => ({
          ...act,
          activityImage: urls[i],
        })
      );
    }

    if (validated.value.title) {
      validated.value.slug = await generateUniqueSlug(validated.value.title);
    }

    const updated = await Package.findByIdAndUpdate(id, validated.value, {
      new: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });

    await invalidatePackageCaches(updated.slug);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

export const hardDeletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg)
      return res.status(404).json({ success: false, error: "Not found" });

    const images = [
      pkg.featuredImage,
      ...pkg.activity.map((a: any) => a.activityImage),
    ].filter(Boolean);
    if (images.length > 0) await deleteFromCloudinary(images);

    await Package.findByIdAndDelete(id);
    await invalidatePackageCaches(pkg.slug);

    res.json({ success: true, message: "Permanently deleted" });
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const softDeletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the package first (to get slug for cache invalidation)
    const pkg = await Package.findById(id).select("slug");
    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    // Soft delete → just set isActive = false
    const updated = await Package.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-__v");

    // Invalidate Redis cache
    const cacheKeysToDelete = [
      `packages:all:*`, // all list caches
      `package:slug:${pkg.slug}`, // individual package cache
    ];

    try {
      const keys = await redisClient.keys("packages:all:*");
      if (keys.length > 0) await redisClient.del(keys);
      await redisClient.del(`package:slug:${pkg.slug}`);
      logger.info(`Cache invalidated for package: ${pkg.slug}`);
    } catch (cacheErr) {
      logger.warn("Redis cache invalidation failed (non-critical)", cacheErr);
      // Don't fail the request if Redis is down
    }

    return res.json({
      success: true,
      message: "Package deactivated successfully",
      data: updated,
    });
  } catch (err: any) {
    logger.error("Soft Delete Package Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};
