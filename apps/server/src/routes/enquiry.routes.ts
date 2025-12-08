// src/routes/enquiry.routes.ts
import { Router } from "express";
import {
  createEnquiry,
  getAllEnquiries,
  updateEnquiry,
} from "../controllers/enquiry.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Public
router.post("/", createEnquiry);

// Admin only
router.get("/", requireAuth(["admin", "manager", "employee"]), getAllEnquiries);
router.patch(
  "/:id",
  requireAuth(["admin", "manager", "employee"]),
  updateEnquiry
);

export default router;
