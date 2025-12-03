// src/routes/hotel.routes.ts
import { Router } from "express";
import {
  createHotel,
  getAllHotels,
  updateHotel,
  deleteHotel,
} from "../controllers/hotel.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadHotelImages } from "../middlewares/upload";

const router = Router();

// Public
router.get("/", getAllHotels);

// Admin only
router.post("/", uploadHotelImages, requireAuth(["admin"]), createHotel);
router.patch("/:id", uploadHotelImages, requireAuth(["admin"]), updateHotel);
router.delete("/:id", requireAuth(["admin"]), deleteHotel);

export default router;
