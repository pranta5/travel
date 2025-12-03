"use client";
import { useParams } from "next/navigation";

// app/booking-success/[bookingId]/page.tsx
export default function BookingSuccess() {
  const { bookingId } = useParams();

  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="bg-white rounded-xl shadow-lg p-12">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Booking Confirmed!
        </h1>
        <p className="text-xl text-gray-700">
          Your booking ID: <strong>{bookingId}</strong>
        </p>
        <p className="mt-6 text-gray-600">
          We have sent confirmation to your email.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
