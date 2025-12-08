"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";

/* Types (adapt if your real types differ) */
type BookingStatus =
  | "pending"
  | "confirmed"
  | "reschedule"
  | "complete"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type Booking = {
  _id: string;
  bookingId: string;
  bookingDate: string;
  travelDate: string;
  totalAmount: number;
  paidAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  package: {
    _id?: string;
    title: string;
    availableDates?: string[];
  };
};

type BookingsResponse = {
  success: boolean;
  data: Booking[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

/* Helper */
const formatDate = (iso?: string) =>
  iso ? format(new Date(iso), "dd MMM yyyy") : "-";

/* Component */
export default function MyBookingsPage() {
  const qc = useQueryClient();

  const {
    data: bookingsRes,
    isLoading,
    isError,
    error,
  } = useQuery<BookingsResponse, Error>({
    queryKey: ["bookings", "my"],
    queryFn: async () => {
      const { data } = await api.get("/booking/my");
      return data as BookingsResponse;
    },
    staleTime: 1000 * 60 * 5,
  });

  const bookings: Booking[] = bookingsRes?.data ?? [];

  // ←←← LOADING & ERROR HANDLED HERE (in parent) ←←←
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="mt-4">Loading your bookings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Failed to load bookings</p>
        <p className="text-sm mt-2">{(error as any)?.message}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">Empty</div>
        <p className="text-gray-500">You have no bookings yet.</p>
      </div>
    );
  }

  // ←←← NOW render the table safely ←←←
  return (
    <div className="p-6 text-gray-600">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Booking ID</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Booking Date</th>
              <th className="px-4 py-3 text-left">Travel Date</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{b.bookingId}</td>

                <td className="px-4 py-3">
                  <div className="font-medium">{b.package.title}</div>
                  <div className="text-xs text-gray-500">{b.user.name}</div>
                </td>

                <td className="px-4 py-3">{formatDate(b.bookingDate)}</td>

                <td className="px-4 py-3">{formatDate(b.travelDate)}</td>

                <td className="px-4 py-3">
                  <div className="font-semibold">
                    ₹{b.totalAmount.toLocaleString("en-IN")}
                  </div>
                  {b.paidAmount < b.totalAmount && (
                    <div className="text-xs text-orange-600">
                      Paid: ₹{b.paidAmount.toLocaleString("en-IN")}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800 capitalize">
                    {b.bookingStatus}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {b.paymentStatus}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
