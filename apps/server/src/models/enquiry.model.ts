// src/models/enquiry.model.ts
import { Schema, model } from "mongoose";
import { IEnquiry, EnquiryStatus } from "@/types/enquiry.types";

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    noOfGuests: { type: Number, required: true, min: 1, max: 50 },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    package: { type: Schema.Types.ObjectId, ref: "Package", default: null },
    destination: { type: String, trim: true },

    message: { type: String, required: true, maxlength: 1000 },

    status: {
      type: String,
      enum: [
        "pending",
        "followup",
        "confirmed",
        "solved",
        "rejected",
      ] as EnquiryStatus[],
      default: "pending",
    },
    remark: { type: String },
    followUpDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    source: {
      type: String,
      enum: ["website", "whatsapp", "call", "instagram", "facebook"],
      default: "website",
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
enquirySchema.index({ status: 1, followUpDate: 1 });
enquirySchema.index({ email: 1, createdAt: -1 });
enquirySchema.index({ package: 1 });

export default model<IEnquiry>("Enquiry", enquirySchema);
