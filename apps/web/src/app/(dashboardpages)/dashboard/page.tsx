"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  // ---- Fetch dashboard summary ----
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get("/dashboard/summary");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading dashboard...</div>;

  if (isError || !data)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard summary
      </div>
    );

  const { totalBookings, totalCustomers, totalEarnings, bookingsToday } = data;

  return (
    <>
      <ProtectedRoute>
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 mt-6 gap-4">
          <div className="border border-amber-300 rounded-lg p-4 shadow-sm text-gray-800">
            <div className="text-xs">Total Booking</div>
            <div className="text-2xl font-semibold">{totalBookings}</div>
          </div>

          <div className="border border-green-300 rounded-lg p-4 shadow-sm text-gray-800">
            <div className="text-xs">Total Customers</div>
            <div className="text-2xl font-semibold">{totalCustomers}</div>
          </div>

          <div className="border border-red-300 rounded-lg p-4 shadow-sm text-gray-800">
            <div className="text-xs">Total Earnings</div>
            <div className="text-2xl font-semibold">
              ₹{totalEarnings.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="border border-blue-300 rounded-lg p-4 shadow-sm text-gray-800">
            <div className="text-xs">New Booking Today</div>
            <div className="text-2xl font-semibold">{bookingsToday}</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
            <h4 className="font-semibold text-sm text-teal-900">Add Blogs</h4>
            <p className="text-xs text-teal-700/80 mt-1">
              Create and manage blog posts.
            </p>
          </div>
          <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
            <h4 className="font-semibold text-sm text-teal-900">
              Add Packages
            </h4>
            <p className="text-xs text-teal-700/80 mt-1">
              Create and manage travel packages.
            </p>
          </div>
          <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
            <h4 className="font-semibold text-sm text-teal-900">
              Add Destinations
            </h4>
            <p className="text-xs text-teal-700/80 mt-1">
              Create and manage destinations.
            </p>
          </div>
          <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
            <h4 className="font-semibold text-sm text-teal-900">Add Hotels</h4>
            <p className="text-xs text-teal-700/80 mt-1">
              Create and manage hotels.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-8 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/img/about-side.png"
            alt="hero"
            className="w-full h-56 object-cover"
          />
        </div>
      </ProtectedRoute>
    </>
  );
}
