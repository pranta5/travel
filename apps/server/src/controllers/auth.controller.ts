// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import logger from "../logger";
import User from "../models/user.model";
import env from "../config/env";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  rotateTokens,
  invalidateRefreshToken,
} from "../utils/jwt";
import { hashPwd, comparePwd } from "../utils/bcrypt";
import { cookieOptions } from "../config/cookies";
import {
  registerSchema,
  loginSchema,
  resendVerifySchema,
} from "../validators/auth.validator";
import MailService, { verifyEmailToken } from "../services/mail.service"; // optional: comment out if not used
import redisClient from "../config/redis";

// Cookie lifetimes (ms)
const ACCESS_TOKEN_MAX_AGE = env.ACCESS_TOKEN_MAX_AGE;
const REFRESH_TOKEN_MAX_AGE = env.REFRESH_TOKEN_MAX_AGE;

const publicUserProjection = (u: any) => {
  const { password, __v, ...rest } = u;
  return rest;
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const payload = await registerSchema.validateAsync(req.body, {
      stripUnknown: true,
    });

    // uniqueness checks
    const emailExists = await User.exists({
      email: payload.email.toLowerCase(),
    });
    if (emailExists)
      return res.status(409).json({ message: "Email already in use" });

    const phoneExists = await User.exists({ phone: payload.phone });
    if (phoneExists)
      return res.status(409).json({ message: "Phone already in use" });

    //  referredBy
    let referredById: Types.ObjectId | null = null;
    if (payload.referralCode) {
      const [referrer] = await User.aggregate([
        { $match: { referralCode: payload.referralCode } },
        { $project: { _id: 1 } },
        { $limit: 1 },
      ]);
      if (referrer) referredById = referrer._id;
    }

    // generate referralCode
    const generatedReferralCode = `${payload.name
      .replace(/\s+/g, "")
      .toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    const hashed = await hashPwd(payload.password);

    const newUser = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashed,
      phone: payload.phone,
      referralCode: generatedReferralCode,
      referredBy: referredById,
      role: payload.role || "user",
    });

    // send verification email
    try {
      await MailService.sendVerificationEmail({
        _id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
      });
    } catch (e) {
      logger.warn("[Auth:Register] Failed to send verification email: %o", e);
    }
    return res.status(201).json({
      message: "register successfull",
      user: publicUserProjection(newUser.toObject()),
    });
  } catch (err: any) {
    logger.error("[Auth:Register] %o", err);
    if (err.isJoi) return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const payload = await loginSchema.validateAsync(req.body, {
      stripUnknown: true,
    });

    const user = await User.findOne({
      email: payload.email.toLowerCase(),
    }).select("+password");
    if (!user?.isEmailVerified)
      return res.status(401).json({ message: "Email is not Verified" });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePwd(payload.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const tokenPayload = {
      userId: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return res.json({
      message: "Login successfull",
      user: publicUserProjection(user.toObject()),
    });
  } catch (err: any) {
    logger.error("[Auth:Login] %o", err);
    if (err.isJoi) return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// REFRESH (rotate tokens)
// -----------------------------
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = String(req.cookies?.refreshToken || "");
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = await rotateTokens(
      refreshToken
    );

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/api/auth",
    });

    return res.json({ message: "Tokens rotated" });
  } catch (err: any) {
    logger.error("[Auth:Refresh] %o", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// -----------------------------
// LOGOUT
// -----------------------------
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = String(req.cookies?.refreshToken);
    if (refreshToken) {
      try {
        const decoded = await verifyRefreshToken(refreshToken);
        await invalidateRefreshToken(decoded.userId);
      } catch (e) {
        logger.debug("[Auth:Logout] refresh token invalid/expired: %o", e);
      }
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.json({ message: "Logged out" });
  } catch (err: any) {
    logger.error("[Auth:Logout] %o", err);
    // clear cookies anyway
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// ME (current user)
// -----------------------------
export const me = async (req: Request, res: Response) => {
  try {
    // logger.info(`userid - ${req.user?.userId}`);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    // Convert string to ObjectId
    const objectId = new Types.ObjectId(userId);
    const [user] = await User.aggregate([
      { $match: { _id: objectId } },
      { $project: { password: 0, __v: 0 } },
      {
        $lookup: {
          from: "users",
          localField: "referredBy",
          foreignField: "_id",
          as: "referredByDoc",
        },
      },
      { $unwind: { path: "$referredByDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          referredBy: {
            _id: "$referredByDoc._id",
            name: "$referredByDoc.name",
            email: "$referredByDoc.email",
            referralCode: "$referredByDoc.referralCode",
          },
        },
      },
      { $project: { referredByDoc: 0 } },
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err: any) {
    logger.error("[Auth:Me] %o", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * - Rate-limited via Redis key: verify:resend:email:<emailLower>
 */

const RESEND_TTL_SECONDS = 10; // 5 minutes

export const resendVerification = async (req: Request, res: Response) => {
  try {
    // 1) validate input
    const { email } = await resendVerifySchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    const emailLower = email.toLowerCase();

    // 2) rate limit key
    const rateKey = `verify:resend:email:${emailLower}`;

    const limited = await redisClient.get(rateKey);
    if (limited) {
      return res
        .status(200)
        .json({ message: "If eligible, a verification email has been sent." });
    }

    // 3) find user
    const user = await User.findOne({ email: emailLower }).lean();

    // 4) If no user or already verified
    if (!user || user.isEmailVerified) {
      await redisClient.setex(rateKey, RESEND_TTL_SECONDS, "1");
      return res
        .status(200)
        .json({ message: "If eligible, a verification email has been sent." });
    }

    // 5) send verification email
    try {
      await MailService.sendVerificationEmail({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      // set rate-limit key on success
      await redisClient.setex(rateKey, RESEND_TTL_SECONDS, "1");

      return res
        .status(200)
        .json({ message: "If eligible, a verification email has been sent." });
    } catch (mailErr: any) {
      logger.error("[Auth:ResendVerify] Mail send failed: %o", mailErr);

      // small TTL backoff to avoid hammering when mail server down
      await redisClient.setex(rateKey, 10, "1"); // 1 minute

      // still respond generically
      return res
        .status(200)
        .json({ message: "If eligible, a verification email has been sent." });
    }
  } catch (err: any) {
    logger.error("[Auth:ResendVerify] Error: %o", err);
    if (err.isJoi) return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || req.body.token || "").trim();
    if (!token) return res.status(400).json({ message: "Token is required" });

    let payload: { userId: string; email?: string };
    try {
      payload = verifyEmailToken(token);
    } catch (err: any) {
      logger.debug(
        "[Auth:VerifyEmail] token verify failed: %o",
        err?.message ?? err
      );
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const userId = payload.userId;
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("[Auth:VerifyEmail] user not found for token: %o", {
        userId,
      });
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // mark verified
    user.isEmailVerified = true;
    await user.save();

    logger.info("[Auth:VerifyEmail] User verified: %s", user._id.toString());

    return res.status(200).json({ message: "Email verified" });
  } catch (err: any) {
    logger.error("[Auth:VerifyEmail] Unexpected error: %o", err);
    return res.status(500).json({ message: "Server error" });
  }
};
