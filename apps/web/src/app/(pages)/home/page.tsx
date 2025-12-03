// app/page.tsx  (or wherever your HomePage lives)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PackageCard from "@/components/ui/PackageCard"; // if you still need elsewhere
import AboutUs from "@/components/page/homeComp/aboutus";
import BlogSection from "@/components/page/homeComp/BlogSection";
import StatsSection from "@/components/page/homeComp/statsSection";
import Testimonials from "@/components/page/homeComp/Testimonials";
import WhyChooseUs from "@/components/page/homeComp/WhyChooseUs";

type PackageType = {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  destination?: string | string[];
  categoryAndPrice?: { category: string; price: number }[];
  // add more fields if your API returns them
};

const HomePage: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8100/api/packages/");
        if (!res.ok) {
          throw new Error(`Failed to fetch packages: ${res.status}`);
        }

        const data = await res.json();
        // Assume data is an array. If the API wraps in { data: [...] } adjust accordingly.
        const list: PackageType[] = Array.isArray(data)
          ? data
          : data?.data ?? [];

        if (!canceled) {
          setPackages(list.slice(0, 3));
        }
      } catch (err: any) {
        if (!canceled) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchPackages();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div>
      {/* hero section */}
      <div className="relative h-screen w-full">
        <Image
          src="/img/hero-bg.jpg"
          alt="Banner"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h3 className="text-white text-lg md:text-2xl font-semibold mb-2">
            Explore Before You Expire
          </h3>

          <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold leading-snug">
            Lets Make Your Best <span className="text-cyan-400">Trip</span> US
          </h1>

          <p className="text-white text-sm md:text-lg mt-4">
            Discover amazing places at exclusive deals
          </p>

          <button className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg text-sm md:text-base font-medium shadow-lg transition">
            Discover Tours
          </button>
        </div>
      </div>

      {/* top destination */}
      <section className="py-12 bg-gray-50">
        <div className="text-center mb-10">
          <h3 className="text-lg font-medium text-gray-600">Top Destination</h3>
          <h2 className="text-3xl text-black font-bold">
            HikeSike’s <span className="text-cyan-600">Handpicked</span> Wonders
          </h2>
        </div>

        <div className="max-w-6xl mx-auto px-6 text-gray-600">
          {loading ? (
            <div className="text-center py-12">Loading packages…</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">No packages available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((p) => {
                const prices = p.categoryAndPrice?.map((c) => c.price) ?? [];
                const minPrice = prices.length ? Math.min(...prices) : null;

                return (
                  <article
                    key={p._id}
                    className="border rounded-lg overflow-hidden shadow-sm bg-white"
                  >
                    <Link href={`/packages/${p.slug}`} className="block">
                      <div className="w-full h-44 bg-gray-200 overflow-hidden">
                        {p.featuredImage ? (
                          // Using plain img for remote/local string image path
                          // If you want next/image for remote images, configure domains in next.config.js
                          <img
                            src={p.featuredImage}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg">
                        <Link href={`/packages/${p.slug}`}>{p.title}</Link>
                      </h3>

                      {minPrice !== null && (
                        <p className="text-sm text-cyan-600 mt-1 font-semibold">
                          Starting from ₹{minPrice.toLocaleString("en-IN")}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 mt-2">
                        {Array.isArray(p.destination)
                          ? p.destination.join(", ")
                          : p.destination ?? "Various places"}
                      </p>

                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/package/${p.slug}`}
                          className="text-sm text-cyan-600 font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* aboutus */}
      <AboutUs />
      {/* stats */}
      <StatsSection />
      <WhyChooseUs />
      <Testimonials />
      <BlogSection />
    </div>
  );
};

export default HomePage;
