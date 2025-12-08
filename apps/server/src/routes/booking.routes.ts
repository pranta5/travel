// src/routes/booking.routes.ts
import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
} from "../controllers/booking.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// USER ROUTES (logged-in user)
router.post("/", requireAuth(), createBooking);
router.get("/my", requireAuth(), getMyBookings);

// ADMIN / MANAGER ROUTES
router.get("/", requireAuth(["admin", "manager", "employee"]), getAllBookings);

router.patch(
  "/:id",
  requireAuth(["admin", "manager", "employee"]),
  updateBooking
);

export default router;
