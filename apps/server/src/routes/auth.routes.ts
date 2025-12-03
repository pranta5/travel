// src/routes/auth.routes.ts
import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller";

import {
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller";

import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Refresh token
router.post("/refresh", refresh);

// Resend email verification
router.post("/resend-verify", resendVerification);

// Email verification (user clicks link)
router.get("/verify-email", verifyEmail);

router.post("/logout", logout);
// Authenticated Routes
router.get("/me", requireAuth(), me);

export default router;
