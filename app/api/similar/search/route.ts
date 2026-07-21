import { NextRequest, NextResponse } from "next/server";
import { searchProductsByTitle } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const results = await searchProductsByTitle(q);
  return NextResponse.json({
    results: results.map((p) => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      image: p.featuredImage?.url ?? null,
      price: p.priceRange.minVariantPrice.amount,
    })),
  });
}
