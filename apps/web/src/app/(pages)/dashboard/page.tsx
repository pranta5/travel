// app/dashboard/page.tsx
import React from "react";

const HERO_IMG = "/img/about-side.png";

export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 mt-6 gap-4">
        <div className="border border-amber-300 rounded-lg p-4 shadow-sm text-gray-800">
          <div className="text-xs ">Total Booking</div>
          <div className="text-2xl font-semibold">04</div>
        </div>

        <div className="border border-green-300 rounded-lg p-4 shadow-sm text-gray-800">
          <div className="text-xs ">Total Customers</div>
          <div className="text-2xl font-semibold">04</div>
        </div>

        <div className="border border-red-300 rounded-lg p-4 shadow-sm text-gray-800">
          <div className="text-xs ">Total Earnings</div>
          <div className="text-2xl font-semibold">04</div>
        </div>

        <div className="border border-blue-300 rounded-lg p-4 shadow-sm text-gray-800">
          <div className="text-xs ">New Booking</div>
          <div className="text-2xl font-semibold">04</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
          <h4 className="font-semibold text-sm text-teal-900">Add Blogs</h4>
          <p className="text-xs text-teal-700/80 mt-1">
            Create and manage blog post.
          </p>
        </div>
        <div className="rounded-lg p-5 bg-cyan-50 shadow-sm">
          <h4 className="font-semibold text-sm text-teal-900">Add Packages</h4>
          <p className="text-xs text-teal-700/80 mt-1">
            Create and manage Travel packages.
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

      <div className="mt-8 rounded-2xl overflow-hidden shadow-xl">
        <img src={HERO_IMG} alt="hero" className="w-full h-56 object-cover" />
      </div>
    </>
  );
}
