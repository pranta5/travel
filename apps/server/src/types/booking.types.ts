import { Document, Types } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type category = "standard" | "deluxe" | "superdeluxe";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "reschedule"
  | "cancelled"
  | "complete";
export interface StripePaymentInfo {
  stripeSessionId: string;
  paymentIntentId?: string | null;
  amount_total?: number | null;
  currency?: string | null;
}
export interface IBooking extends Document {
  // Relations
  user: Types.ObjectId; // who booked
  package: Types.ObjectId; // which package
  bookingId: string;
  totalTraveler: number;
  // Payment
  totalAmount: number; // full price
  paidAmount: number; // amount paid so far
  walletUsedAmount: number; // amount deducted from wallet
  paymentStatus: PaymentStatus;
  category: category;
  // Booking flow
  bookingStatus: BookingStatus;

  // Dates
  travelDate: Date; // departure date
  bookingDate: Date; // when booking was made
  paymentInfo: StripePaymentInfo;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
