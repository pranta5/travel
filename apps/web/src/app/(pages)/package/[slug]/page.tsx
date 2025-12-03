// app/packages/[slug]/page.tsx
import React from "react";
import PackagePageClient from "@/components/page/packageComp/PackagePageClient";

type Params = { params: { slug: string } };

async function fetchPackageBySlug(slug: string) {
  const res = await fetch(
    `http://localhost:8100/api/packages/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    // throw so we can show not found / error
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch package: ${res.status} ${text}`);
  }

  const body = await res.json().catch(() => null);
  // support both { success:true, data: { ... } } and direct object
  return body?.data ?? body;
}

export default async function PackagePage({ params }: Params) {
  const { slug } = params;

  let pkg: any = null;
  try {
    pkg = await fetchPackageBySlug(slug);
  } catch (err) {
    console.error("Package fetch error:", err);
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Package not found</h2>
        <p className="text-gray-600 mt-2">Unable to load package details.</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Package not found</h2>
      </div>
    );
  }

  return <PackagePageClient pkg={pkg} />;
}
