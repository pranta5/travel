"use client";
import { useState } from "react";

export type FAQItem = {
  q: string;
  a: string;
};
function FAQAccordion({ faqs }: { faqs?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!faqs || faqs.length === 0)
    return <p className="text-sm text-gray-500">No FAQs yet.</p>;

  return (
    <div className="space-y-2">
      {faqs.map((f, i) => (
        <div key={i} className="border rounded-md overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-4 py-3 flex justify-between items-center bg-white"
            aria-expanded={open === i}
          >
            <span className="font-medium text-sm">{f.q}</span>
            <span className="text-gray-500">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-600">{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
