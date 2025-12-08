// app/packages/[slug]/page.tsx
import PackagePageClient from "@/components/page/packageComp/PackagePageClient";

type Params = { params: { slug: string } };

export default async function PackagePage({ params }: Params) {
  const { slug } = await params;

  return <PackagePageClient slug={slug} />;
}
