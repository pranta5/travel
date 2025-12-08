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
import { Types } from "mongoose";

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
//create
export const createPackage = async (req: Request, res: Response) => {
  try {
    let body = req.body;

    // Auto-parse all JSON string fields from form-data
    body = {
      ...body,
      availableDates: parseJSON(body.availableDates, "availableDates"),
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
    if (!files?.featuredImage?.[0]) logger.error("featuredImage is required");
    validated.value.featuredImage = await uploadSingleImage(
      files.featuredImage[0].path
    );

    // Upload activity images
    if (validated.value.activity?.length > 0) {
      const activityFiles = files?.activityImages || [];
      if (activityFiles.length !== validated.value.activity.length) {
        logger.error(
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

// helpers
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//all
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      destination,
      category,
      sort,
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      destination?: string;
      category?: string;
      sort?: string;
    };

    const pageNum = Math.max(1, Number(page || 1));
    const limitNum = Math.max(1, Number(limit || 10));
    const skip = (pageNum - 1) * limitNum;

    // Normalize cache key
    const normalized: any = {
      page: pageNum,
      limit: limitNum,
      search: search ? String(search).trim().toLowerCase() : undefined,
      destination: destination
        ? String(destination).trim().toLowerCase()
        : undefined,
      category: category ? String(category).trim().toLowerCase() : undefined,
      sort: sort || undefined,
    };
    const cacheKey = `packages:list:${JSON.stringify(normalized)}`;

    // Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info("Cache hit: packages list");
      return res.json({ success: true, ...JSON.parse(cached) });
    }

    // Base match
    const match: any = { isActive: true };

    // category filter (case-insensitive on array element)
    if (category) {
      match["categoryAndPrice"] = {
        $elemMatch: {
          category: {
            $regex: `^${escapeRegex(String(category).trim())}$`,
            $options: "i",
          },
        },
      };
    }

    // If user passed destination but not search, treat destination as search term too
    const searchTerm =
      search ?? destination ? String(search ?? destination).trim() : "";

    // Start pipeline
    const pipeline: any[] = [{ $match: match }];

    if (searchTerm) {
      const r = new RegExp(escapeRegex(searchTerm), "i");

      pipeline.push({
        $addFields: {
          titleMatch: {
            $cond: [{ $regexMatch: { input: "$title", regex: r } }, 1, 0],
          },
          overviewMatch: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$overview", ""] },
                  regex: r,
                },
              },
              1,
              0,
            ],
          },
          destinationMatch: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$destination", []] },
                        as: "d",
                        cond: { $regexMatch: { input: "$$d", regex: r } },
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
      });

      pipeline.push({
        $addFields: {
          searchScore: {
            $add: [
              { $multiply: ["$titleMatch", 5] },
              { $multiply: ["$destinationMatch", 4] },
              { $multiply: ["$overviewMatch", 2] },
            ],
          },
        },
      });

      // only keep docs which matched something
      pipeline.push({ $match: { searchScore: { $gt: 0 } } });
    }

    // Compute helper fields: minPrice (for price sorting) and primaryCategory (for category sorting)
    pipeline.push({
      $addFields: {
        minPrice: { $min: { $ifNull: ["$categoryAndPrice.price", []] } },
        primaryCategory: {
          $toLower: {
            $ifNull: [{ $arrayElemAt: ["$categoryAndPrice.category", 0] }, ""],
          },
        },
      },
    });

    // Lookup hotel and unwind (optional; keep data enriched)
    pipeline.push(
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } }
    );

    // Sorting
    const hasSearch = Boolean(searchTerm);
    let sortStage: any = {};
    if (sort === "category") {
      sortStage = { primaryCategory: 1, createdAt: -1 };
    } else if (sort === "price_asc") {
      sortStage = { minPrice: 1, createdAt: -1 };
    } else if (sort === "price_desc") {
      sortStage = { minPrice: -1, createdAt: -1 };
    } else if (hasSearch && (sort === "relevance" || !sort)) {
      sortStage = { searchScore: -1, createdAt: -1 };
    } else {
      sortStage = { createdAt: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Pagination + projection
    pipeline.push({
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
              minPrice: 0,
              primaryCategory: 0,
              __v: 0,
              "hotel.__v": 0,
              "hotel.createdAt": 0,
              "hotel.updatedAt": 0,
            },
          },
        ],
        totalCount: [{ $count: "total" }],
      },
    });

    const [result] = await Package.aggregate(pipeline);

    const packages = result?.data || [];
    const total = result?.totalCount?.[0]?.total || 0;

    const response = {
      data: packages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // cache for 5 minutes
    await redisClient.setex(cacheKey, 300, JSON.stringify(response));

    return res.json({ success: true, ...response });
  } catch (err: any) {
    logger.error("Get All Packages Error:", err);
    return res.status(500).json({ success: false, error: err.message });
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
//byid

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // validate id early
    if (!Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid package id" });
    }
    const oid = new Types.ObjectId(id);

    const cacheKey = `package:id:${id}`;

    // Try Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info("Cache hit: package id");
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const result = await Package.aggregate([
      { $match: { _id: oid, isActive: true } },
    ]);

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    const pkg = result[0];

    // Cache for 10 minutes
    await redisClient.setex(cacheKey, 600, JSON.stringify(pkg));

    return res.json({ success: true, data: pkg });
  } catch (err: any) {
    logger.error("Get Package By id Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let body = req.body;

    body = {
      ...body,
      availableDates: parseJSON(body.availableDates, "availableDates"),
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

export const updatePackageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.query; // "true" | "false"

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing 'active' query param (true/false)",
      });
    }

    const checkIsActive = active === "true";

    const pkg = await Package.findById(id).select("slug");
    if (!pkg) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    const updated = await Package.findByIdAndUpdate(
      id,
      { isActive: checkIsActive },
      { new: true }
    ).select("-__v");

    // 🔄 Invalidate cache
    try {
      const keys = await redisClient.keys("packages:all:*");
      if (keys.length > 0) await redisClient.del(keys);
      await redisClient.del(`package:slug:${pkg.slug}`);
    } catch (err) {
      logger.warn("Redis cache invalidation failed", err);
    }

    return res.json({
      success: true,
      message: checkIsActive ? "Package activated" : "Package deactivated",
      data: updated,
    });
  } catch (err: any) {
    logger.error("Update Package Status Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
