// src/types/enquiry.types.ts
import { Document, Types } from "mongoose";

export type EnquiryStatus =
  | "pending"
  | "followup"
  | "confirmed"
  | "solved"
  | "rejected";

export interface IEnquiry extends Document {
  // Customer Info
  name: string;
  email: string;
  phone: string;
  noOfGuests: number;

  // Travel Dates
  checkInDate: Date;
  checkOutDate: Date;

  // Optional: Link to package (very useful!)
  package?: { type: Types.ObjectId; ref: "Package" };
  destination?: string;

  // Message
  message?: string;

  // Admin Side
  status: EnquiryStatus;
  remark?: string;
  followUpDate?: Date;
  assignedTo?: Types.ObjectId; // Admin/Agent who handles it
  source: "website" | "whatsapp" | "call" | "instagram" | "facebook";

  // Auto fields
  createdAt: Date;
  updatedAt: Date;
}
