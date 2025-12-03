import { Document, Types } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "reschedule"
  | "cancelled"
  | "complete";

export interface IBooking extends Document {
  // Relations
  user: Types.ObjectId; // who booked
  package: Types.ObjectId; // which package

  totalTraveler: number;
  // Payment
  totalAmount: number; // full price
  paidAmount: number; // amount paid so far
  walletUsedAmount: number; // amount deducted from wallet
  paymentStatus: PaymentStatus;

  // Booking flow
  bookingStatus: BookingStatus;

  // Dates
  travelDate: Date; // departure date
  bookingDate: Date; // when booking was made

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
