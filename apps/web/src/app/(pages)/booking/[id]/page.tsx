// app/booking/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import api from "@/lib/axios";

export default function BookingPage() {
  const { id: packageId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    totalTraveler: 2,
    travelDate: new Date(),
    category: "standard" as "standard" | "deluxe" | "super deluxe",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!packageId) {
      toast.error("Package not found");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        package: packageId,
        totalTraveler: Number(formData.totalTraveler),
        travelDate: formData.travelDate.toISOString(),
        category: formData.category,
      };

      const res = await api.post("/booking/", payload);

      toast.success("Booking Confirmed! Redirecting...");

      setTimeout(() => {
        router.push(`/booking-success/${res.data.bookingId}`);
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-36 py-12 bg-white mt-16 text-gray-600">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Complete Your Booking
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        {/* Travelers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers
          </label>
          <input
            type="number"
            min="1"
            max="20"
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

        {/* Travel Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <DatePicker
            selected={formData.travelDate}
            onChange={(date: Date | null) =>
              date && setFormData({ ...formData, travelDate: date })
            }
            minDate={new Date()}
            dateFormat="dd MMMM yyyy"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as any })
            }
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="super deluxe">Super Deluxe</option>
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
                {format(formData.travelDate, "dd MMM yyyy")}
              </span>
            </p>
            <p>
              Category:{" "}
              <span className="font-medium capitalize">
                {formData.category}
              </span>
            </p>
            {/* <p>
              Total amount :{" "}
              <span className="font-medium capitalize">
              </span>
            </p> */}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition disabled:opacity-70"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Payment gateway will be integrated soon. Booking will be confirmed
          after payment.
        </p>
      </div>
    </div>
  );
}
