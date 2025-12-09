// src/models/callback.model.ts
import { Schema, model } from "mongoose";
import { ICallbackRequest, CallbackStatus } from "@/types/callback.types";

const callbackSchema = new Schema<ICallbackRequest>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },

    preferredTime: { type: String },
    message: { type: String, maxlength: 500 },
    destination: { type: String },

    status: {
      type: String,
      enum: ["pending", "called", "no-answer", "interested", "not-interested"],
      default: "pending",
    },
    remark: String,
    calledAt: Date,
    source: {
      type: String,
      enum: ["website", "facebook", "instagram", "others"],
      default: "website",
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Indexes
callbackSchema.index({ status: 1, createdAt: -1 });
callbackSchema.index({ phone: 1, createdAt: -1 });
callbackSchema.index({ package: 1 });

export default model<ICallbackRequest>("CallbackRequest", callbackSchema);
