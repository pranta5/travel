// src/models/booking.model.ts
import { Schema, model } from "mongoose";
import { IBooking, PaymentStatus, BookingStatus } from "@/types/booking.types";

const bookingSchema = new Schema<IBooking>(
  {
    // Relations
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // fast lookup by user
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true, // fast lookup by package
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },

    totalTraveler: {
      type: Number,
      required: true,
      min: [1, "At least 1 traveler required"],
    },

    // Payment
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    walletUsedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"] as PaymentStatus[],
      default: "pending",
    },

    // Booking flow
    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "reschedule",
        "complete",
        "cancelled",
      ] as BookingStatus[],
      default: "pending",
      index: true, // important for admin dashboard filters
    },

    // Dates
    travelDate: {
      type: Date,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    // ─── Stripe Payment Info ─────────────
    paymentInfo: {
      type: {
        stripeSessionId: {
          type: String,
          required: true,
        },
        paymentIntentId: {
          type: String,
          default: null,
        },
        amount_total: {
          type: Number,
          default: null,
        },
        currency: {
          type: String,
          lowercase: true,
          default: null,
        },
      },
      required: true,
      _id: false,
    } as any,
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

// Compound indexes for common queries
bookingSchema.index({ user: 1, bookingDate: -1 }); // User's booking history
bookingSchema.index({ package: 1, travelDate: 1 }); // Package occupancy
bookingSchema.index({ bookingStatus: 1, paymentStatus: 1 }); // Admin filters
bookingSchema.index({ travelDate: 1 }); // Upcoming trips

// Virtual: remaining amount to pay
bookingSchema.virtual("remainingAmount").get(function () {
  return this.totalAmount - this.paidAmount;
});

export default model<IBooking>("Booking", bookingSchema);
