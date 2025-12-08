// src/routes/enquiry.routes.ts
import express from "express";

import {
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/payment.controller";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.post(
  "/payments/create-checkout-session",
  requireAuth(),
  createCheckoutSession
);
router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  requireAuth(),
  stripeWebhook
);

export default router;
