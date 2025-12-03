"use client";
import { useState, useEffect } from "react";
import {
  Flame,
  Mountain,
  Trees,
  Train,
  Landmark,
  Ship,
  Tent,
  Sun,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const destinations = [
  { name: "Explore", icon: <Flame className="w-6 h-6 text-cyan-500" /> },
  { name: "Darjeeling", icon: <Train className="w-6 h-6 text-black" /> },
  { name: "Kalimpong", icon: <Mountain className="w-6 h-6 text-black" /> },
  { name: "Sikkim", icon: <Trees className="w-6 h-6 text-black" /> },
  { name: "Meghalaya", icon: <Tent className="w-6 h-6 text-black" /> },
  { name: "Himachal", icon: <Landmark className="w-6 h-6 text-black" /> },
  { name: "Kashmir", icon: <Ship className="w-6 h-6 text-black" /> },
  { name: "Ladakh", icon: <Mountain className="w-6 h-6 text-black" /> },
  { name: "Goa", icon: <Sun className="w-6 h-6 text-black" /> },
  { name: "Assam", icon: <Trees className="w-6 h-6 text-black" /> },
  { name: "Rajasthan", icon: <Landmark className="w-6 h-6 text-black" /> },
  { name: "Kerala", icon: <Ship className="w-6 h-6 text-black" /> },
];

export default function ExploreTabs() {
  const [visibleCount, setVisibleCount] = useState(9);
  const [startIndex, setStartIndex] = useState(0);

  // Update visible count based on screen size
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(3); // mobile
      } else if (window.innerWidth < 1024) {
        setVisibleCount(6); // tablet
      } else {
        setVisibleCount(9); // desktop
      }
    };

    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (startIndex + visibleCount < destinations.length) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const visibleDestinations = destinations.slice(
    startIndex,
    startIndex + visibleCount
  );

  return (
    <div className="bg-white pt-10 pb-4 px-4 sm:px-6 lg:px-12">
      <div className="flex justify-around items-center gap-3 sm:gap-4">
        {/* Left Arrow */}
        {startIndex > 0 && (
          <button
            onClick={handlePrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-hidden ">
          {visibleDestinations.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center min-w-[60px] sm:min-w-[70px] cursor-pointer text-gray-600 hover:text-cyan-500"
            >
              {/* Icon smaller on mobile */}
              <div className="sm:w-6 sm:h-6 w-5 h-5">{item.icon}</div>
              <span className="text-[10px] sm:text-xs mt-1">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {startIndex + visibleCount < destinations.length && (
          <button
            onClick={handleNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white"
          >
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
