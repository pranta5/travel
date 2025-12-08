// src/routes/callback.routes.ts
import { Router } from "express";
import {
  requestCallback,
  getAllCallbacks,
  updateCallbackStatus,
} from "../controllers/callback.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Public
router.post("/", requestCallback);

// private
router.get("/", requireAuth(["admin", "manager", "employee"]), getAllCallbacks);
router.patch(
  "/:id",
  requireAuth(["admin", "manager", "employee"]),
  updateCallbackStatus
);

export default router;
