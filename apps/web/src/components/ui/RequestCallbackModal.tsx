"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { name: string; phone: string }) => void;
};

export default function RequestCallbackModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

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

  // don't render anything when closed
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center text-gray-600 "
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10"
      >
        <h3 className="text-lg font-semibold mb-3">Request a Callback</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const name = (
              form.elements.namedItem("cb_name") as HTMLInputElement
            ).value.trim();
            const phone = (
              form.elements.namedItem("cb_phone") as HTMLInputElement
            ).value.trim();
            if (onSubmit) onSubmit({ name, phone });
            onClose();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="cb_name"
              ref={nameRef}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              name="cb_phone"
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Phone number"
              inputMode="tel"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded"
            >
              Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
