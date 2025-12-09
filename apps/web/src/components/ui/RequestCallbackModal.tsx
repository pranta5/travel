// src/components/ui/RequestCallbackModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ICallbackRequest } from "../../app/types/callback.types";

type CallbackPayload = Omit<
  Partial<ICallbackRequest>,
  "_id" | "__v" | "createdAt" | "updatedAt"
> & {
  name: string;
  phone: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: CallbackPayload) => Promise<void> | void;
};

export default function RequestCallbackModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    // focus the first input when opened
    requestAnimationFrame(() => nameRef.current?.focus());

    // close on Escape
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!open) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const validatePhone = (p: string) => {
    // Allow digits, spaces, +, -, parentheses. Basic length check.
    const cleaned = p.replace(/[^\d]/g, "");
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const name = (
      form.elements.namedItem("cb_name") as HTMLInputElement
    ).value?.trim();
    const phone = (
      form.elements.namedItem("cb_phone") as HTMLInputElement
    ).value?.trim();
    const preferredTime = (
      form.elements.namedItem("cb_preferred_time") as HTMLSelectElement
    )?.value;
    const message = (
      form.elements.namedItem("cb_message") as HTMLTextAreaElement
    )?.value?.trim();
    const destination = (
      form.elements.namedItem("cb_destination") as HTMLInputElement
    )?.value?.trim();
    const source = (form.elements.namedItem("cb_source") as HTMLSelectElement)
      ?.value as CallbackPayload["source"];

    // Basic validation
    if (!name || !phone) {
      // simple client-side notification. Parent can show toasts as needed.
      alert("Please provide both name and phone.");
      return;
    }
    if (!validatePhone(phone)) {
      alert("Please enter a valid phone number (7-15 digits).");
      return;
    }

    setLoading(true);

    const payload: CallbackPayload = {
      name,
      phone,
      preferredTime: preferredTime || undefined,
      message: message || undefined,
      destination: destination || undefined,
      source: source || undefined,
      // add userAgent for server-side analytics
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    try {
      if (onSubmit) {
        // user-supplied handler (e.g., parent wants to call api or show toast)
        await onSubmit(payload);
      } else {
        // default behaviour: POST to local API
        await fetch("http://localhost:8100/api/callback/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Request failed");
          }
        });
      }
    } catch (err) {
      console.error("Callback submit error:", err);
      // simple fallback alert — parent components can handle nicer UX via onSubmit
      alert("Failed to send callback request. Please try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center text-gray-600"
      role="dialog"
      aria-modal="true"
      aria-label="Request a callback"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10"
      >
        <h3 className="text-lg font-semibold mb-3">Request a Callback</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="cb_name" className="block text-sm mb-1">
              Name
            </label>
            <input
              id="cb_name"
              name="cb_name"
              ref={nameRef}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="cb_phone" className="block text-sm mb-1">
              Phone
            </label>
            <input
              id="cb_phone"
              name="cb_phone"
              required
              className="w-full border rounded px-3 py-2"
              placeholder="+91 98765 43210"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="cb_destination" className="block text-sm mb-1">
              Destination (optional)
            </label>
            <input
              id="cb_destination"
              name="cb_destination"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Manali"
            />
          </div>

          <div>
            <label htmlFor="cb_preferred_time" className="block text-sm mb-1">
              Preferred time (optional)
            </label>
            <select
              id="cb_preferred_time"
              name="cb_preferred_time"
              defaultValue=""
              className="w-full border rounded px-3 py-2"
            >
              <option value="">No preference</option>
              <option value="Morning (8AM - 11AM)">Morning (8AM - 11AM)</option>
              <option value="Noon (11AM - 2PM)">Noon (11AM - 2PM)</option>
              <option value="Afternoon (2PM - 5PM)">
                Afternoon (2PM - 5PM)
              </option>
              <option value="Evening (5PM - 8PM)">Evening (5PM - 8PM)</option>
            </select>
          </div>

          <div>
            <label htmlFor="cb_source" className="block text-sm mb-1">
              Where did you find us? (optional)
            </label>
            <select
              id="cb_source"
              name="cb_source"
              defaultValue="website"
              className="w-full border rounded px-3 py-2"
            >
              <option value="website">Website</option>
              <option value="facebook">facebook</option>
              <option value="instagram">instagram</option>
              <option value="others">others</option>
            </select>
          </div>

          <div>
            <label htmlFor="cb_message" className="block text-sm mb-1">
              Message (optional)
            </label>
            <textarea
              id="cb_message"
              name="cb_message"
              rows={3}
              className="w-full border rounded px-3 py-2"
              placeholder="Any details we should know (budget, dates, group size)..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending..." : "Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
