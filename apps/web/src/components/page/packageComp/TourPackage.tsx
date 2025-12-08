// components/TourPackage.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ActivitiesList, CostBreakdown, FAQAccordion } from "./TourExtras";
import AskExpert from "./AskExpert";
import { IoMdStar } from "react-icons/io";
import OverviewSection from "./OverviewSection";
import ItineraryTimeline from "./ItineraryTimeline";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

/* ---------------------
   Types
   --------------------- */
type ItineraryItem = {
  day: string;
  title: string;
  description: string;
};

export type ImageItem = {
  src: string;
  label?: string;
  alt?: string;
};
export type AskExpertProps = {
  onSubmit?: (data: {
    name: string;
    email: string;
    phone?: string;
    guests?: string;
    checkIn?: string;
    checkOut?: string;
    message?: string;
  }) => void;
  className?: string;
};
export type OverviewProp =
  | string
  | { view?: string; highlighted?: string[] }
  | Array<{ view?: string } | { highlighted?: string[] }>;

export type Activity = {
  id?: string | number;
  title: string;
  description?: string;
  duration?: string;
  image?: string;
};
export type CostItem = {
  include?: Array<string>;
  exclude?: Array<string>;
};
export type FAQItem = {
  q: string;
  a: string;
};
type PackageOption = {
  type: "Standard" | "Deluxe" | "superdeluxe";
  price: number;
  discountPrice?: number;
  features?: string[];
};

export type TourPackageProps = {
  title: string;
  slug: string;
  id: string;
  duration: string;
  locations: { name: string; days: number }[];
  price: number;
  // discountPrice?: number;
  // rating?: number;
  // reviews?: number;
  images: ImageItem[]; // first image will be large, next two small
  itinerary: ItineraryItem[];
  overview?: OverviewProp;
  activities?: Activity[];
  costItems?: CostItem[];
  faqs?: FAQItem[];
  askExpertProps?: AskExpertProps;
  packages?: PackageOption[];
};

export default function TourPackage({
  title,
  slug,
  id,
  duration,
  locations,
  price,
  // discountPrice,
  // rating = 0,
  // reviews = 0,
  images,
  itinerary,
  overview,
  activities,
  costItems,
  faqs,
  askExpertProps,
  packages,
}: TourPackageProps) {
  const tabs = ["Itinerary", "Overview", "Activities", "Cost", "FAQ"];
  const [activeTab, setActiveTab] = useState<string>("Itinerary");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (packages && packages.length > 0) {
      // if current selectedPackage already matches, keep it
      const exists = packages.find((p) => p.type === selectedPackage);
      if (!exists) {
        setSelectedPackage(packages[0].type);
      }
    }
  }, [packages, selectedPackage]);
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
        {/* Top images - full width */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-xl overflow-hidden shadow bg-gray-100">
              {images?.[0] ? (
                <Image
                  src={images[0].src}
                  alt={images[0].alt ?? images[0].label ?? title}
                  width={1200}
                  height={700}
                  className="w-full h-64 md:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-96 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {images?.[0]?.label && (
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {images[0].label}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {images?.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden shadow bg-gray-100"
                >
                  {img ? (
                    <Image
                      src={img.src}
                      alt={img.alt ?? img.label ?? `thumb-${i}`}
                      width={600}
                      height={350}
                      className="w-full h-32 md:h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 md:h-44 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  {img?.label && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {img.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Left: Title, Tabs, Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & badges */}
          <div className="space-y-4">
            <h1 className="text-2xl text-gray-600 md:text-3xl font-bold">
              {title}
            </h1>
            {/* Location and duration badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 text-sm text-gray-600">
              {/* Duration pill */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-2 px-6 py-1.5 bg-cyan-500 text-white rounded-full font-medium text-sm">
                  {duration}
                </span>
              </div>

              {/* Locations: responsive grid of compact cards */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {locations.map((loc, i) => (
                    <div
                      key={i}
                      role="group"
                      aria-label={`${loc.days} days in ${loc.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-white/60 transition-shadow border border-transparent hover:shadow-sm"
                    >
                      <div className="border-l-2 border-gray-500 h-full"></div>

                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center text-gray-400 font-bold text-5xl">
                          {loc.days}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">Days in</div>
                        <div className="text-sm md:text-base font-semibold truncate text-gray-800">
                          {loc.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Package type buttons */}
            <div className="flex gap-3 flex-wrap mt-4">
              {packages?.map((pkg, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPackage(pkg.type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPackage === pkg.type
                      ? "text-cyan-500 bg-gray-50 shadow border-cyan-500 border"
                      : "bg-gray-100 text-gray-700 hover:border hover:border-cyan-500 hover:text-cyan-500"
                  }`}
                >
                  {pkg.type}
                </button>
              ))}
            </div>
            {/* tab buttons */}
            <div className="flex gap-4 flex-wrap border rounded-2xl p-2 bg-gray-100">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeTab === t
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:border hover:border-cyan-500 hover:text-cyan-500"
                  }`}
                  aria-pressed={activeTab === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tab panels */}
          <div className="space-y-6">
            {activeTab === "Itinerary" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Itinerary
                </h2>
                <ItineraryTimeline items={itinerary} />
              </div>
            )}

            {activeTab === "Overview" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Overview
                </h2>
                <OverviewSection overview={overview ?? []} />
              </div>
            )}

            {activeTab === "Activities" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Activities
                </h2>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <ActivitiesList activities={activities ?? []} />
                </div>
              </div>
            )}

            {activeTab === "Cost" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Cost Breakdown
                </h2>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <CostBreakdown items={costItems ?? []} />
                </div>
              </div>
            )}

            {activeTab === "FAQ" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Frequently Asked Questions
                </h2>
                <div className="bg-white p-6">
                  <FAQAccordion faqs={faqs ?? []} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6 flex flex-col md:flex-row md:gap-6  md:space-y-0 lg:flex-col lg:space-y-4">
          {/* Package price card */}
          <div className="w-full  md:flex-1 md:order-1">
            {packages && packages.length > 0 ? (
              (() => {
                const pkg = packages.find((p) => p.type === selectedPackage);
                if (!pkg) return null;
                return (
                  <div className="p-6 border rounded-lg shadow-sm bg-white h-full">
                    <div className="flex">
                      {/* <h3 className="text-lg bg-cyan-600 text-white mb-2 border rounded-xl px-4">
                        10% Off
                      </h3> */}
                      <div className="flex items-center gap-1 text-md ml-auto">
                        <IoMdStar className="text-cyan-600 text-xl" />
                        <h5 className="text-gray-700 font-medium">
                          <span className="text-cyan-600">4.4</span> (76)
                        </h5>
                      </div>
                    </div>
                    <div className=" space-x-2 mb-4">
                      <span className="text-xl text-black">From</span>
                      {/* <span className="text-xl text-red-500 line-through">
                        ₹{pkg.discountPrice}
                      </span> */}
                      <span className="text-3xl font-bold text-black">
                        ₹{pkg.price}{" "}
                        <span className="text-sm font-light">/ Person</span>
                      </span>
                    </div>
                    <hr />
                    {!user ? (
                      <button
                        onClick={() => router.push("/login")}
                        className="mt-6 w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600"
                      >
                        Login to Book
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/booking/${id}`)}
                        className="mt-6 w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600"
                      >
                        Book Now
                      </button>
                    )}

                    <button className="mt-6 w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600">
                      Request A Callback
                    </button>
                    <h5 className="text-sm mt-6 text-gray-500">
                      Need help with booking ?
                      <span className="text-cyan-500"> Send Us A message</span>
                    </h5>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 border rounded-lg shadow-sm bg-white h-full">
                <button className="mt-6 w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600">
                  Request A Callback
                </button>
              </div>
            )}
          </div>

          {/* AskExpert */}
          <div className="w-full  md:flex-1 md:order-2">
            <AskExpert {...(askExpertProps ?? {})} />
          </div>
        </div>
      </div>
    </section>
  );
}
