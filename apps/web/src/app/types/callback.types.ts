// src/types/callback.types.ts

export type CallbackStatus =
  | "pending"
  | "called"
  | "no-answer"
  | "interested"
  | "not-interested";

export interface ICallbackRequest {
  name: string;
  phone: string;
  preferredTime?: string; // e.g., "10AM - 12PM"
  message?: string;
  destination?: string;

  //manage
  status: CallbackStatus;
  remark?: string;
  calledAt?: Date;

  source?: "website" | "facebook" | "instagram" | "others";
  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
  updatedAt: Date;
}
