import { Schema, model, Document } from "mongoose";
import { IUser } from "@/types/user.types";
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true, // prevents unique index issues
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    walletBalance: {
      type: Number,
      default: 500,
    },

    role: {
      type: String,
      enum: ["user", "admin", "manager", "employee"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
