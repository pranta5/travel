// components/page/packageComp/PackagePageClient.tsx
"use client";

import React from "react";
import PolicySection from "@/components/page/packageComp/PolicySection";
import Reviews from "@/components/page/packageComp/Reviews";
import ReviewSummary from "@/components/page/packageComp/ReviewSummary";
import TourPackage from "@/components/page/packageComp/TourPackage";

type Props = {
  pkg: any; // API package object
};

function mapPackageToProps(pkg: any) {
  // map title
  const title = pkg.title || pkg?.name || "Package";
  const id = pkg._id || pkg.id || "";
  // duration derived from itinerary length if available, fallback to empty
  const duration =
    pkg.itinerary && Array.isArray(pkg.itinerary)
      ? `${pkg.itinerary.length}N/${Math.max(1, pkg.itinerary.length + 1)}D`
      : pkg.duration || "";

  // locations: map itinerary days to locations if present; fallback to destination array
  const locations =
    (pkg.itinerary &&
      pkg.itinerary.map((it: any, idx: number) => ({
        name: pkg.destination?.[idx] || `surpise`,
        days: 1,
      }))) ||
    (Array.isArray(pkg.destination)
      ? pkg.destination.map((d: string) => ({ name: d, days: 1 }))
      : []);

  // price: pick lowest price from categoryAndPrice
  const prices = (pkg.categoryAndPrice || [])
    .map((c: any) => Number(c.price || 0))
    .filter(Boolean);
  const price = prices.length ? Math.min(...prices) : pkg.price || 0;
  // discountPrice: if any discount available, try to pick lowest discountPrice or price
  const discountPrice = pkg.discountPrice ?? price;

  // rating & reviews: attempt to use pkg.rating / pkg.reviews or defaults
  const rating = pkg.rating ?? pkg.avgRating ?? 4.5;
  const reviews = pkg.reviewsCount ?? pkg.reviews?.length ?? 0;

  // images: try to use featuredImage + activity images
  const images =
    pkg.images && Array.isArray(pkg.images) && pkg.images.length
      ? pkg.images.map((i: any) => ({
          src: i.src || i,
          label: i.label || "",
          alt: i.alt || title,
        }))
      : [];

  // if no images array, fallback to featuredImage and first activity images
  if (images.length === 0) {
    if (pkg.featuredImage)
      images.push({ src: pkg.featuredImage, label: "Destination", alt: title });
    if (pkg.activity && Array.isArray(pkg.activity)) {
      pkg.activity.forEach((a: any) => {
        if (a.activityImage)
          images.push({
            src: a.activityImage,
            label: a.activityName || "Activity",
            alt: a.activityName || title,
          });
      });
    }
  }

  // itinerary: map pkg.itinerary where each item has day, title, description
  const itinerary =
    pkg.itinerary && Array.isArray(pkg.itinerary)
      ? pkg.itinerary.map((it: any, idx: number) => ({
          // keep original day string, but presentationally we'll capitalize later
          day: it.day ?? `Day ${idx + 1}`,
          // only use title if API provides it and it's not same as day
          title: it.title && it.title !== it.day ? it.title : undefined,
          description: it.description || "",
        }))
      : [];

  // overview: map overview (string or array) to the design shape
  let overview = [];
  if (Array.isArray(pkg.overview)) {
    overview = pkg.overview.map((o: any) =>
      typeof o === "string" ? { view: o } : o
    );
  } else if (typeof pkg.overview === "string") {
    overview = [{ view: pkg.overview }];
  }

  // activities: map to { title, image }
  const activities =
    pkg.activity && Array.isArray(pkg.activity)
      ? pkg.activity.map((a: any) => ({
          title: a.activityName || a.title || "Activity",
          image: a.activityImage || a.image || "/img/card-demo.png",
        }))
      : [];

  // costItems: look for include/exclude or build from fields
  const costItems = [];
  if (pkg.includes || pkg.included)
    costItems.push({ include: pkg.includes || pkg.included });
  if (pkg.excludes || pkg.excluded)
    costItems.push({ exclude: pkg.excludes || pkg.excluded });
  // fallback from provided cost structure
  if (costItems.length === 0 && (pkg.costIncludes || pkg.costExcludes)) {
    if (pkg.costIncludes) costItems.push({ include: pkg.costIncludes });
    if (pkg.costExcludes) costItems.push({ exclude: pkg.costExcludes });
  }

  // faqs
  const faqs = pkg.faqs || pkg.faq || [];

  // packages (variants): use categoryAndPrice
  const packages =
    pkg.categoryAndPrice && Array.isArray(pkg.categoryAndPrice)
      ? pkg.categoryAndPrice.map((c: any) => ({
          type: c.category || c.type || "Standard",
          price: c.price ?? 0,
          discountPrice: c.discountPrice ?? c.price ?? 0,
          features: c.features || [],
        }))
      : pkg.packages || [];

  return {
    title,
    id,
    duration,
    locations,
    price,
    discountPrice,
    rating,
    reviews,
    images,
    itinerary,
    overview,
    activities,
    costItems,
    faqs,
    packages,
  };
}

export default function PackagePageClient({ pkg }: Props) {
  const mapped = mapPackageToProps(pkg);

  return (
    <div className="mt-16 bg-white">
      <TourPackage
        title={mapped.title}
        id={mapped.id}
        duration={mapped.duration}
        locations={mapped.locations}
        price={mapped.price}
        discountPrice={mapped.discountPrice}
        rating={mapped.rating}
        reviews={mapped.reviews}
        images={mapped.images}
        itinerary={mapped.itinerary}
        overview={mapped.overview}
        activities={mapped.activities}
        costItems={mapped.costItems}
        faqs={mapped.faqs}
        packages={mapped.packages}
        askExpertProps={{
          onSubmit: (d: any) => {
            // you can call your enquiry API here
            console.log("enquiry:", d);
          },
        }}
      />

      <ReviewSummary />
      <Reviews />
      <PolicySection />
    </div>
  );
}
