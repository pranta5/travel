// src/middlewares/rateLimit.ts
import rateLimit from "express-rate-limit";

// Login / Register / Forgot-password limiter
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // max 10 requests
  message: {
    error: "Too many attempts, please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// General API limiter (optional – use if you want)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: { error: "Too many requests, calm down!" },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
