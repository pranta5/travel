// src/types.ts

import { Types, Document } from "mongoose";

/**
 * Role type for improved type safety
 */
export type UserRole = "user" | "admin" | "manager" | "employee";

/**
 * Mongoose User Document Type
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  isEmailVerified: boolean;
  referralCode: string;
  referredBy?: Types.ObjectId | null;
  walletBalance: number;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

import { Request } from "express";

/**
 * JWT Payload stored inside cookies accessToken
 */
export interface JwtUserPayload {
  userId: string;
  role: UserRole; 
}


