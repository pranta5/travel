// src/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/booking.model";
import User from "../models/user.model";
import redisClient from "../config/redis";
import logger from "../logger";

const CACHE_KEY = "dashboard:summary";
const CACHE_TTL = 10; // seconds

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // Try cache first
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      logger.info("Dashboard summary cache hit");
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    // Dates for ranges
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    // Aggregation on bookings to compute counts and earnings
    const agg = await Booking.aggregate([
      {
        $facet: {
          totalBookings: [{ $count: "count" }],
          bookingsToday: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $count: "count" },
          ],
          newBookingsLast7Days: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: "count" },
          ],
          totalEarnings: [
            // consider only paid bookings for earnings
            { $match: { paymentStatus: "paid" } },
            {
              $group: {
                _id: null,
                total: { $sum: { $ifNull: ["$paidAmount", 0] } }, // use paidAmount (safer)
              },
            },
          ],
          // optional: bookingsByStatus
          bookingsByStatus: [
            {
              $group: {
                _id: "$bookingStatus",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = agg?.[0] ?? {};

    const totalBookings = result.totalBookings?.[0]?.count ?? 0;
    const bookingsToday = result.bookingsToday?.[0]?.count ?? 0;
    const newBookingsLast7Days = result.newBookingsLast7Days?.[0]?.count ?? 0;
    const totalEarnings = result.totalEarnings?.[0]?.total ?? 0;

    // Count unique customers who made bookings (distinct booking.user)
    const uniqueCustomerCountAgg = await Booking.aggregate([
      { $group: { _id: "$user" } },
      { $count: "count" },
    ]);
    const totalCustomers = uniqueCustomerCountAgg?.[0]?.count ?? 0;

    const payload = {
      totalBookings,
      totalCustomers,
      totalEarnings,
      newBookingsLast7Days,
      bookingsToday,
      bookingsByStatus:
        (result.bookingsByStatus || []).reduce((acc: any, cur: any) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {}) || {},
    };

    // cache the summary briefly
    await redisClient.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(payload));

    return res.json({ success: true, data: payload });
  } catch (err: any) {
    logger.error("Get dashboard summary error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
