// components/Reviews.tsx
import Image from "next/image";
import React from "react";

type RatingRow = {
  stars: number;
  count: number;
};

const ratingRows: RatingRow[] = [
  { stars: 5, count: 30 },
  { stars: 4, count: 46 },
  { stars: 3, count: 15 },
  { stars: 2, count: 5 },
  { stars: 1, count: 0 },
];

const average = 4.4;
const totalReviews = ratingRows.reduce((s, r) => s + r.count, 0);

function Star({ solid = true }: { solid?: boolean }) {
  if (solid) {
    return (
      <svg
        className="w-4 h-4 inline-block"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.95c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.997 2.413c-.784.57-1.838-.197-1.539-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.017 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z" />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 inline-block text-yellow-400"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.95c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.997 2.413c-.784.57-1.838-.197-1.539-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.017 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z" />
    </svg>
  );
}

export default function ReviewSummary() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row gap-6">
        {/* LEFT: Rating summary */}
        <div className="md:w-1/3 flex-shrink-0 flex flex-col items-center justify-center border-r md:border-r md:border-gray-200 pr-0 md:pr-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-0 hidden md:block">
            Reviews
          </h2>
          <div className="flex items-center justify-center">
            {/* star cluster */}
            <div className="relative">
              {/* stars  */}
              <div>
                <Image
                  src={"/icons/stars.png"}
                  height={80}
                  width={80}
                  alt="star-image"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold text-emerald-700">{average}</h3>
            <p className="text-sm text-gray-500">
              From {totalReviews}+ reviews
            </p>
          </div>
        </div>

        {/* RIGHT: Rating bars */}
        <div className="flex-1 pt-2 md:pt-0">
          <div className="space-y-4">
            {ratingRows.map((r) => {
              // percentage width for the filled bar (based on highest count or total)
              const maxCount = Math.max(...ratingRows.map((x) => x.count), 1);
              const percent = Math.round((r.count / maxCount) * 100);

              return (
                <div key={r.stars} className="flex items-center gap-3">
                  {/* label */}
                  <div className="w-12 text-sm text-gray-600 flex items-center">
                    <span className="mr-2 font-medium">{r.stars}</span>
                    <Star />
                  </div>

                  {/* bar */}
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          background:
                            r.stars >= 4
                              ? "linear-gradient(90deg,#06b6d4,#06b6b4)"
                              : r.stars === 3
                              ? "linear-gradient(90deg,#06b6d4,#06b6b4)"
                              : "linear-gradient(90deg,#06b6d4,#06b6b4)",
                        }}
                      />
                    </div>
                  </div>

                  {/* count */}
                  <div className="w-12 text-right text-sm text-gray-700">
                    {r.count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* small view for mobile header */}
          <div className="block md:hidden mt-4 text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Overall rating
            </h3>
            <p className="text-sm text-gray-500">
              Based on {totalReviews} reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
