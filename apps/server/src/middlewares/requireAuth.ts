// src/middlewares/requireAuth.ts
import { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { JwtUserPayload } from "@/types/auth.types";

export const requireAuth =
  (allowedRoles?: string[]): RequestHandler =>
  (req, res, next) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = verifyAccessToken(token) as JwtUserPayload;
      req.user = decoded;

      // If no roles provided → authentication only
      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      // Role-based access check
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
