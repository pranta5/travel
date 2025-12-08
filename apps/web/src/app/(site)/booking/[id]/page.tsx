// app/booking/[id]/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";

type CategoryName = "standard" | "deluxe" | "superdeluxe";

type PackageAPI = {
  _id: string;
  title: string;
  slug: string;
  categoryAndPrice: { category: CategoryName; price: number }[];
  featuredImage?: string;
  overview?: string;
  availableDates?: string[]; // ISO strings
};

export default function BookingPage() {
  const { id: packageId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    totalTraveler: 2,
    travelDate: "", // ISO string selected from dropdown
    category: "standard" as CategoryName,
  });

  const [loading, setLoading] = useState(false);

  // ------------ React Query (object-style) ------------
  const {
    data: pkg,
    isLoading: pkgLoading,
    isError: pkgError,
  } = useQuery<PackageAPI, Error>({
    queryKey: ["package", packageId ?? "undefined"],
    queryFn: async () => {
      if (!packageId) throw new Error("Missing package id");
      const res = await api.get(`/packages/single/${packageId}`);
      return res.data.data as PackageAPI;
    },
    enabled: !!packageId,
    staleTime: 1000 * 60 * 5,
  });

  // Initialize default travelDate to first available date once package loads
  useEffect(() => {
    if (
      pkg?.availableDates &&
      pkg.availableDates.length > 0 &&
      !formData.travelDate
    ) {
      setFormData((s) => ({ ...s, travelDate: pkg.availableDates![0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg]);

  // price per person based on selected category
  const pricePerPerson = useMemo(() => {
    if (!pkg) return 0;
    const entry = pkg.categoryAndPrice?.find(
      (c) =>
        String(c.category).toLowerCase() ===
        String(formData.category).toLowerCase()
    );
    return entry ? Number(entry.price) : 0;
  }, [pkg, formData.category]);

  const totalAmount = useMemo(() => {
    return Number(pricePerPerson) * Number(formData.totalTraveler || 0);
  }, [pricePerPerson, formData.totalTraveler]);

  const handleProceedToPayment = async () => {
    if (!packageId) return toast.error("Invalid package");
    if (!formData.travelDate) return toast.error("Select a travel date");
    if (formData.totalTraveler <= 0)
      return toast.error("Invalid number of travelers");
    if (!formData.category) return toast.error("Select a category");

    setLoading(true);

    try {
      const payload = {
        packageId,
        totalTraveler: Number(formData.totalTraveler),
        travelDate: formData.travelDate,
        category: formData.category,
      };

      const sessionRes = await api.post(
        "/payments/create-checkout-session",
        payload
      );

      const checkoutUrl = sessionRes.data?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      const bookingRes = await api.post("/booking", {
        package: packageId,
        totalTraveler: Number(formData.totalTraveler),
        travelDate: formData.travelDate,
        category: formData.category,
      });

      toast.success("Booking confirmed! Redirecting...");
      const bookingId =
        bookingRes.data?.bookingId ?? bookingRes.data?.data?._id;
      setTimeout(() => {
        if (bookingId) router.push(`/booking-success/${bookingId}`);
      }, 1200);
    } catch (err: any) {
      console.error("Payment / booking error", err);
      toast.error(
        err?.response?.data?.error || err.message || "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  if (!packageId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Package not found</h2>
      </div>
    );
  }

  if (pkgLoading) {
    return <div className="p-8 text-center">Loading package...</div>;
  }

  if (pkgError || !pkg) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Package not found</h2>
        <p className="text-gray-600 mt-2">Unable to load package details.</p>
      </div>
    );
  }

  // Helper to nicely format date for dropdown
  const formatDateForUI = (iso: string) => format(new Date(iso), "dd MMM yyyy");

  return (
    <div className="px-6 md:px-36 py-12 bg-white mt-16 text-gray-600">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Complete Your Booking — {pkg.title}
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 max-w-3xl mx-auto">
        {/* Travelers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers
          </label>
          <input
            type="number"
            min={1}
            max={99}
            value={formData.totalTraveler}
            onChange={(e) =>
              setFormData({
                ...formData,
                totalTraveler: Number(e.target.value),
              })
            }
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Travel Date (dropdown based on package availableDates) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <select
            value={formData.travelDate}
            onChange={(e) =>
              setFormData({ ...formData, travelDate: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {pkg.availableDates && pkg.availableDates.length > 0 ? (
              pkg.availableDates.map((iso) => (
                <option key={iso} value={iso}>
                  {formatDateForUI(iso)}
                </option>
              ))
            ) : (
              <option value="">No dates available</option>
            )}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as CategoryName,
              })
            }
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {pkg.categoryAndPrice?.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category} — ₹{c.price.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-gray-600">
            <p>
              Package ID: <span className="font-medium">{packageId}</span>
            </p>

            <p>
              Travelers:{" "}
              <span className="font-medium">{formData.totalTraveler}</span>
            </p>

            <p>
              Date:{" "}
              <span className="font-medium">
                {formData.travelDate
                  ? formatDateForUI(formData.travelDate)
                  : "-"}
              </span>
            </p>

            <p>
              Category:{" "}
              <span className="font-medium capitalize">
                {formData.category}
              </span>
            </p>

            <p>
              Price per person:{" "}
              <span className="font-medium">
                ₹{pricePerPerson.toLocaleString()}
              </span>
            </p>

            <p className="text-xl">
              Total amount:{" "}
              <span className="font-semibold text-amber-600">
                ₹{totalAmount.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Submit / Payment */}
        <button
          onClick={handleProceedToPayment}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition disabled:opacity-70"
        >
          {loading
            ? "Processing..."
            : `Proceed to Payment — ₹${totalAmount.toLocaleString()}`}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You will be redirected to the payment gateway to complete payment.
        </p>
      </div>
    </div>
  );
}
