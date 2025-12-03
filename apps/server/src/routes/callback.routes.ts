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

// Admin only
router.get("/", requireAuth(["admin", "manager"]), getAllCallbacks);
router.patch("/:id", requireAuth(["admin", "manager"]), updateCallbackStatus);

export default router;
