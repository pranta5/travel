// components/PolicySection.tsx
"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Panel = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const panels: Panel[] = [
  {
    id: "payment",
    title: "Payment Policy",
    content: (
      <>
        <h4 className="font-semibold mb-2">Cancellation by the Traveler:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>
            Cancellations made 30 Days or more prior to the start date of the
            trip: 90% of the total booking amount will be refunded.
          </li>
          <li>
            Cancellations made between 29 days and 15 days prior to the start
            date of the trip: 50% of the total booking amount will be refunded.
          </li>
          <li>
            Cancellations made less than 15 days prior to the start date of the
            trip: No refund will be provided.
          </li>
          <li>
            For partial cancellations (reducing the number of travelers or
            rooms), the refund amount will be based on the percentage of the
            total booking amount for the cancelled portion.
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-1">
          Cancellation by the Travel Agency:
        </h4>
        <p className="text-sm text-gray-600">
          In the unlikely event that we need to cancel your booking due to
          unforeseen circumstances; we will provide a full refund of the total
          booking amount.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    content: (
      <p className="text-sm text-gray-600">
        Short explanation / terms for cancellation policy. Add details here as
        needed.
      </p>
    ),
  },
  {
    id: "other",
    title: "Other Policy",
    content: (
      <p className="text-sm text-gray-600">
        Other policy details (e.g., baggage rules, conduct, insurance). Put
        whatever extra rules here.
      </p>
    ),
  },
];

export default function PolicySection() {
  const [openId, setOpenId] = useState<string | null>("payment");

  return (
    <section className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-8 lg:px-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-700">
            Our Policy
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-2xl">
            Important booking and cancellation policies. Please read carefully
            before booking.
          </p>
        </div>

        <div className="border-t">
          {/* Accordion container */}
          <div className="divide-y">
            {panels.map((panel) => {
              const isOpen = openId === panel.id;
              return (
                <div key={panel.id} className="px-6 py-4 lg:px-10">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : panel.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${panel.id}-content`}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-base font-medium text-gray-800">
                      {panel.title}
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 transform transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 text-teal-600"
                          : "rotate-0 text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id={`${panel.id}-content`}
                    className={`mt-4 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      isOpen ? "max-h-[1000px]" : "max-h-0"
                    }`}
                    role="region"
                    aria-labelledby={panel.id}
                  >
                    <div className="pb-2">{panel.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
