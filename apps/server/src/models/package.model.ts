import { Schema, model } from "mongoose";
import { IPackage } from "@/types/package.types";

const categoryAndPriceSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["standard", "deluxe", "superdeluxe"],
      required: true,
    },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const itinerarySchema = new Schema(
  {
    day: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const activitySchema = new Schema(
  {
    activityName: { type: String, required: true },
    activityImage: { type: String, required: true },
  },
  { _id: false }
);

const packageSchema = new Schema<IPackage>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categoryAndPrice: {
      type: [categoryAndPriceSchema],
      required: true,
    },
    featuredImage: { type: String, required: true },
    overview: { type: String, required: true },
    destination: [{ type: String, required: true }],
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    itinerary: {
      type: [itinerarySchema],
      default: [],
    },
    activity: {
      type: [activitySchema],
      default: [],
    },
    availableDates: [{ type: Date }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookup by slug & active status
packageSchema.index({ isActive: 1 });

export default model<IPackage>("Package", packageSchema);
