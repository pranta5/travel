// src/types/callback.types.ts
import { Document, Types } from "mongoose";

export type CallbackStatus =
  | "pending"
  | "called"
  | "no-answer"
  | "interested"
  | "not-interested";

export interface ICallbackRequest extends Document {
  name: string;
  phone: string;
  preferredTime?: string; // e.g., "10AM - 12PM"
  message?: string;
  destination?: string;

  //manage
  status: CallbackStatus;
  remark?: string;
  calledAt?: Date;
  assignedTo?: Types.ObjectId | null; // Admin/Agent

  source: "website" | "popup" | "package-page" | "footer";
  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
  updatedAt: Date;
}
