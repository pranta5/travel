// components/TourExtras.tsx
"use client";
import React, { useState } from "react";

export type Activity = {
  title: string;
  image?: string;
};

export type CostInput = {
  include?: Array<string>;
  exclude?: Array<string>;
};

export type FAQItem = {
  q: string;
  a: string;
};

/* -------------------------
   Small icons (inline SVG)
   ------------------------- */
const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ActivitiesList — shows title/desc only on hover or focus
export function ActivitiesList({ activities }: { activities: Activity[] }) {
  if (!activities?.length)
    return <p className="text-sm text-gray-500">No activities provided.</p>;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activities.map((act, i) => (
        <li key={i} className="group">
          {/* Make the whole card focusable for keyboard users */}
          <div
            role="button"
            tabIndex={0}
            aria-label={act.title}
            className="relative overflow-hidden rounded-2xl h-40 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            {/* image (use next/image if you prefer) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={act.image ?? "/img/card-demo.png"}
              alt={act.title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 group-focus:scale-105"
            />

            {/* dark overlay that appears on hover/focus */}
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 group-focus:bg-black/40 transition-colors duration-300"
              aria-hidden
            />

            {/* text that fades in on hover/focus */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
              <div
                className="opacity-0 translate-y-2 group-hover:opacity-100 group-focus:opacity-100 group-hover:translate-y-0 group-focus:translate-y-0 transition-all duration-300"
                style={{ transitionTimingFunction: "cubic-bezier(.2,.9,.2,1)" }}
              >
                <h3 className="text-white text-lg font-semibold drop-shadow-md">
                  {act.title}
                </h3>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CostBreakdown({ items }: { items: CostInput[] }) {
  // normalize the new-shape inputs into lists of { label }
  const includes: Array<{ label: string }> = [];
  const excludes: Array<{ label: string }> = [];

  (items ?? []).forEach((it) => {
    if (!it) return;
    if (Array.isArray(it.include)) {
      it.include.forEach((label) => includes.push({ label }));
    }
    if (Array.isArray(it.exclude)) {
      it.exclude.forEach((label) => excludes.push({ label }));
    }
  });

  const formatLabel = (s: string) =>
    s && typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const renderItem = (
    it: { label: string },
    included: boolean,
    idx: number
  ) => (
    <li
      key={`${included ? "inc" : "exc"}-${idx}-${it.label}`}
      className="flex items-start gap-3 py-3 border-b last:border-b-0 border-gray-100"
    >
      <span
        className={`flex-shrink-0 rounded-md p-2 ${
          included ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        }`}
        aria-hidden
      >
        {included ? <CheckIcon /> : <XIcon />}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-800 truncate">
          {formatLabel(it.label)}
        </div>
      </div>
    </li>
  );

  return (
    <div>
      <div className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Includes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Cost Includes
            </h3>
            {includes.length === 0 ? (
              <p className="text-sm text-gray-500">No included items listed.</p>
            ) : (
              <ul className="divide-y divide-transparent">
                {includes.map((it, i) => renderItem(it, true, i))}
              </ul>
            )}
          </div>

          {/* Exclusions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Cost Exclusions
            </h3>
            {excludes.length === 0 ? (
              <p className="text-sm text-gray-500">No exclusions listed.</p>
            ) : (
              <ul className="divide-y divide-transparent">
                {excludes.map((it, i) => renderItem(it, false, i))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!faqs?.length)
    return <p className="text-sm text-gray-500">No FAQs yet.</p>;

  return (
    <div className="space-y-2 divide-y divide-solid divide-gray-500">
      {faqs.map((f, i) => (
        <div key={i} className="overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-4 py-3 flex justify-between items-center"
            aria-expanded={open === i}
          >
            <span className="font-medium text-md text-bold text-black">
              {f.q}
            </span>
            <span className="text-gray-500">{open === i ? "-" : "+"}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-600">{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
