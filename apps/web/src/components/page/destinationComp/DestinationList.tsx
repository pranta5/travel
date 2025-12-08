"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { MapPin } from "lucide-react";

type PackageSummary = {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  destination?: string[] | string;
  categoryAndPrice?: { category: string; price: number }[];
};

type ApiResponse = {
  success: boolean;
  data: PackageSummary[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export default function DestinationList() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(8);
  const [totalPages, setTotalPages] = useState<number>(1);

  // search UI state
  const [search, setSearch] = useState<string>("");
  const [destination, setDestination] = useState<string | undefined>(undefined);

  // debounce timer ref
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, destination]);

  async function loadPackages() {
    setLoading(true);
    setError(null);

    const params: any = { page, limit };
    if (destination) params.destination = destination;

    try {
      const res = await api.get<ApiResponse>("/packages/", { params });
      const body = res.data;

      if (body?.success && Array.isArray(body.data)) {
        setPackages(body.data);
        setTotalPages(body.pagination?.pages || 1);
      } else if (Array.isArray(body)) {
        setPackages(body);
        setTotalPages(1);
      } else {
        setPackages([]);
        setError(null); // don't spam errors for normal empty results
      }
    } catch (err: any) {
      setPackages([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch packages"
      );
    } finally {
      setLoading(false);
    }
  }

  // Called when user clicks Search or presses Enter
  const applySearch = (value: string) => {
    const trimmed = value.trim();
    setPage(1);
    // empty string -> clear destination (show all)
    setDestination(trimmed ? trimmed : undefined);
  };

  // Debounced handler for typing (optional UX)
  const handleTyping = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      // If user cleared the input, remove filter immediately
      if (value.trim() === "") {
        applySearch("");
      }
      // otherwise, do nothing until user hits Search or Enter (avoid auto-search)
    }, 300);
  };

  const clearSearch = () => {
    setSearch("");
    applySearch("");
  };

  return (
    <section className=" py-8 px-22 text-gray-600 bg-white">
      {/* Search box */}
      <div className="py-6 bg-white mb-6">
        <div className="flex items-center bg-white drop-shadow-md rounded-xl p-2 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 flex-1 border-r pr-4 relative">
            <MapPin className="text-cyan-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applySearch((e.target as HTMLInputElement).value);
                }
              }}
              placeholder="Where are you going?"
              className="w-full outline-none text-sm text-gray-500"
            />

            {/* clear button */}
            {search.length > 0 && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() => applySearch(search)}
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        Packages {destination ? `— ${destination}` : ""}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-40 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : packages.length === 0 ? (
        <div className="text-gray-600">No packages found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => {
              const prices = p.categoryAndPrice?.map((c) => c.price) || [];
              const minPrice = prices.length ? Math.min(...prices) : null;

              return (
                <article
                  key={p._id}
                  className="border rounded-lg overflow-hidden shadow-sm bg-white"
                >
                  <Link href={`/package/${p.slug}`} className="block">
                    <div className="w-full h-44 bg-gray-200 overflow-hidden">
                      {p.featuredImage ? (
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
                        Starting from ₹{minPrice}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mt-2">
                      {Array.isArray(p.destination)
                        ? p.destination.join(", ")
                        : p.destination}
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

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((s) => Math.max(1, s - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
