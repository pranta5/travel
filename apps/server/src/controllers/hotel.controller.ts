// src/controllers/hotel.controller.ts
import { Request, Response } from "express";
import Hotel from "../models/hotel.model";
import {
  createHotelSchema,
  updateHotelSchema,
} from "../validators/hotel.validator";
import redisClient from "../config/redis";
import logger from "../logger";
import { deleteFromCloudinary } from "../services/upload.service";
import { uploadMultipleImagesCloudi } from "../services/upload.service";

const invalidateCache = async () => {
  try {
    const keys = await redisClient.keys("hotels:*");
    if (keys.length > 0) await redisClient.del(keys);
  } catch (err) {
    logger.warn("Hotel cache invalidation failed", err);
  }
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const { error, value } = createHotelSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const urls = await uploadMultipleImagesCloudi(files.map((f) => f.path));
      value.hotelImage = urls; // ← this fills the array!
    }
    const hotel = await Hotel.create(value);
    await invalidateCache();

    res.status(201).json({ success: true, data: hotel });
  } catch (err: any) {
    logger.error("Create Hotel Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const cacheKey = "hotels:all";
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const hotels = await Hotel.find().select("-__v").sort({ hotelName: 1 });
    await redisClient.setex(cacheKey, 3600, JSON.stringify(hotels));

    res.json({ success: true, data: hotels });
  } catch (err: any) {
    logger.error("Get Hotels Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateHotelSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const urls = await uploadMultipleImagesCloudi(files.map((f) => f.path));
      value.hotelImage = urls; // override or merge as needed
    }

    const hotel = await Hotel.findByIdAndUpdate(id, value, { new: true });
    if (!hotel)
      return res.status(404).json({ success: false, error: "Hotel not found" });

    await invalidateCache();
    res.json({ success: true, data: hotel });
  } catch (err: any) {
    logger.error("Update Hotel Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndDelete(id);
    if (!hotel)
      return res.status(404).json({ success: false, error: "Hotel not found" });
    // Delete all hotel images from Cloudinary
    if (hotel.hotelImage && hotel.hotelImage.length > 0) {
      await deleteFromCloudinary(hotel.hotelImage);
    }
    await invalidateCache();
    res.json({
      success: true,
      message: "Hotel and images deleted permanently",
    });
  } catch (err: any) {
    logger.error("Delete Hotel Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
