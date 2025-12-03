// src/routes/booking.routes.ts
import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  updatePaymentStatus,
  updateBookingStatus,
  getAllBookings,
} from "../controllers/booking.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// ───────────────────────────────
// USER ROUTES (logged-in user)
// ───────────────────────────────
router.post("/", requireAuth(), createBooking); // Create booking
router.get("/my", requireAuth(), getMyBookings); // My bookings

// ───────────────────────────────
// ADMIN / MANAGER ROUTES
// ───────────────────────────────
router.get("/", requireAuth(["admin", "manager"]), getAllBookings);

router.patch(
  "/:id/payment",
  requireAuth(["admin", "manager"]),
  updatePaymentStatus
);

router.patch(
  "/:id/status",
  requireAuth(["admin", "manager"]),
  updateBookingStatus
);

export default router;
