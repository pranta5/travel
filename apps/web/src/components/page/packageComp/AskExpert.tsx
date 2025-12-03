"use client";

import React, { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/axios";
import { toast } from "react-toastify";

export type AskExpertProps = {
  onSubmit?: (data: {
    name: string;
    email: string;
    phone?: string;
    guests?: string;
    checkIn?: string; // YYYY-MM-DD
    checkOut?: string; // YYYY-MM-DD
    message?: string;
  }) => void;
  className?: string;
};

/* Calendar icon (unchanged) */
const CalendarIcon = () => (
  <svg
    className="h-4 w-4 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CustomDateInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const {
    value,
    onClick,
    onChange,
    className,
    placeholder,
    placeholderText,
    disabled,
    id,
    ...rest
  } = props;

  const ph = placeholder ?? placeholderText ?? "";

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => onClick?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`w-full flex items-center gap-2 rounded-md border px-3 py-2 h-10 text-sm bg-white
        focus-within:ring-2 focus-within:ring-cyan-400 focus-within:ring-offset-2 ${
          className ?? ""
        }`}
      aria-label={ph || "Select date"}
    >
      <input
        ref={ref}
        readOnly
        value={value ?? ""}
        onChange={onChange}
        placeholder={ph}
        id={id}
        disabled={disabled}
        className="flex-1 w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        aria-label={ph || "Date input"}
        {...rest}
      />
      <CalendarIcon />
    </div>
  );
});

CustomDateInput.displayName = "CustomDateInput";

/* ---------- Main component (POSTs to /api/enquiries/) ---------- */
export default function AskExpertWithCustomDate({
  onSubmit,
  className = "",
}: AskExpertProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "",
    message: "",
  });

  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const formatDateForSubmit = (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : ""; // YYYY-MM-DD

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      noOfGuests: form.guests ? Number(form.guests) : undefined,
      checkInDate: formatDateForSubmit(checkInDate),
      checkOutDate: formatDateForSubmit(checkOutDate),
      message: form.message,
    };

    // Call optional prop first (if consumer wants to intercept)
    try {
      setSubmitting(true);

      if (onSubmit) {
        try {
          onSubmit({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            guests: String(payload.noOfGuests ?? ""),
            checkIn: payload.checkInDate,
            checkOut: payload.checkOutDate,
            message: payload.message,
          });
        } catch (err) {
          // ignore errors from consumer callback — we still send to API below
        }
      }

      const res = await api.post("/enquiries/", payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Enquiry submitted successfully.");
        // reset
        setForm({ name: "", email: "", phone: "", guests: "", message: "" });
        setCheckInDate(null);
        setCheckOutDate(null);
      } else {
        const msg = res?.data?.message || "Failed to submit enquiry";
        toast.warn(msg);
      }
    } catch (err: any) {
      console.error("Enquiry submit error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit enquiry";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className={`w-full h-full flex flex-col p-4 border rounded-lg bg-white ${className}`}
    >
      <h4 className="text-lg font-semibold mb-3 text-cyan-700">
        Ask an expert
      </h4>

      <form
        onSubmit={submit}
        className="flex-1 flex flex-col space-y-3 text-gray-500"
      >
        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full Name*"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
            placeholder="Email*"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone No"
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <input
              name="guests"
              value={form.guests}
              onChange={handleChange}
              placeholder="No. of Guest"
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DatePicker
              selected={checkInDate}
              onChange={(d) => setCheckInDate(d)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Check-In"
              customInput={<CustomDateInput />}
            />
            <DatePicker
              selected={checkOutDate}
              onChange={(d) => setCheckOutDate(d)}
              minDate={checkInDate ?? undefined}
              dateFormat="dd/MM/yyyy"
              placeholderText="Check-Out"
              customInput={<CustomDateInput />}
            />
          </div>
        </div>

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message..."
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 flex-grow"
        />

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600 transition disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Enquiry"}
          </button>
        </div>
      </form>
    </aside>
  );
}
