// components/ItineraryTimeline.tsx
"use client";
import React, { useState } from "react";

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

export type ItineraryItem = {
  day: string; // e.g. "Day 1"
  title: string;
  description?: string;
  /** optional small label/icon type if you want to customize icon per item */
  iconType?: "car" | "circle";
};

type Props = {
  items: ItineraryItem[];
  initialOpenIndex?: number | null;
  className?: string;
};

const CarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 13.5V10a2 2 0 012-2h1.2a3 3 0 012.8-2h4a3 3 0 012.8 2H19a2 2 0 012 2v3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7.5"
      cy="16.2"
      r="1.2"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle
      cx="16.5"
      cy="16.2"
      r="1.2"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

const DotIcon = ({ filled = false }: { filled?: boolean }) => (
  <div
    className={`w-3.5 h-3.5 rounded-full ${
      filled ? "bg-cyan-600" : "border-2 border-cyan-600 bg-white"
    }`}
  />
);

/** Simple chevron that rotates */
const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 transform ${
      open ? "rotate-180" : "rotate-0"
    } transition-transform duration-200`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ItineraryTimeline({
  items,
  initialOpenIndex = null,
  className = "",
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col">
        {items.map((it, i) => {
          const isOpen = openIndex === i;
          const isFirst = i === 0;
          const isLast = i === items.length - 1;

          return (
            <div key={i} className="flex items-stretch gap-6">
              {/* left column: icon + vertical connector */}
              <div className="flex flex-col items-center pt-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-white ring-2 ring-white shadow-sm`}
                  aria-hidden
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                    {/* show car for first/last or when iconType === 'car' */}
                    {it.iconType === "car" || isFirst || isLast ? (
                      <CarIcon className="w-4 h-4 text-white" />
                    ) : (
                      <DotIcon filled={true} />
                    )}
                  </div>
                </div>

                {/* vertical line connector (renders for non-last) */}
                {!isLast && <div className="flex-1 w-px bg-gray-200 mt-2" />}
              </div>

              {/* right column: content */}
              <div className="flex-1 pb-6 w-full">
                <div className="flex items-start justify-between w-full">
                  <div className="min-w-0">
                    <button
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      className="w-full text-left mt-1 focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <h3 className="text-md md:text-md font-semibold text-gray-700 truncate">
                            {/* show capitalized day */}
                            {capitalize(it.day)}
                          </h3>
                          {/* if a title exists, show it as a small subtitle */}
                          {it.title ? (
                            <div className="text-sm text-gray-500 truncate mt-0.5">
                              {it.title}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => toggle(i)}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                    className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    <Chevron open={isOpen} />
                  </button>
                </div>

                {/* content panel: smooth height + opacity transition */}
                <div
                  className="overflow-hidden transition-[max-height,opacity] duration-300"
                  style={{
                    maxHeight: isOpen ? 400 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="pt-4 text-sm text-gray-600 leading-relaxed">
                    {it.description}
                  </div>
                </div>
                {/* separator line */}
                <div className="mt-4 border-b border-gray-200" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
