// src/components/StatsSection.tsx
"use client";

import React from "react";

const stats = [
  { value: "18000+", label: "Happy Travellers" },
  { value: "1021+", label: "Total Trip" },
  { value: "4k", label: "Destination" },
  { value: "2013", label: "Begin On" },
];

const StatsSection = () => {
  return (
    <section className="bg-gradient-to-r from-cyan-600 to-cyan-400 py-6">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index}>
              <h2 className="text-xl md:text-2xl font-bold">{stat.value}</h2>
              <p className="mt-1 text-xs md:text-xs uppercase tracking-wide opacity-90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
