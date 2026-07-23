import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getScorableCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface BulkRow {
  title: string; // matched case-insensitively against live Shopify product titles
  scent_families?: string[];
  top_notes?: string[];
  mid_notes?: string[];
  base_notes?: string[];
  occasions?: string[];
  mood?: string | null;
  strength?: string | null;
  longevity_hours?: number | null;
  projection?: string | null;
  climate_fit?: string[];
  gender_position?: string;
  classification?: string | null;
}

// Accepts a JSON array of rows (matched to live Shopify products by exact
// title match, case-insensitive) and upserts fragrance_attributes for all
// of them in one call. Returns which titles matched vs. were skipped, so
// naming mismatches are visible instead of silently dropped.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows: BulkRow[] = Array.isArray(body) ? body : body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Expected a JSON array of rows" }, { status: 400 });
  }

  const catalog = await getScorableCatalog();
  const titleToId = new Map<string, string>();
  catalog.forEach((p) => titleToId.set(p.title.trim().toLowerCase(), p.id));

  const admin = getSupabaseAdmin();
  const matched: string[] = [];
  const unmatched: string[] = [];
  const upserts: any[] = [];

  for (const row of rows) {
    const productId = titleToId.get((row.title ?? "").trim().toLowerCase());
    if (!productId) {
      unmatched.push(row.title);
      continue;
    }
    matched.push(row.title);
    upserts.push({
      product_id: productId,
      scent_families: row.scent_families ?? [],
      top_notes: row.top_notes ?? [],
      mid_notes: row.mid_notes ?? [],
      base_notes: row.base_notes ?? [],
      occasions: row.occasions ?? [],
      mood: row.mood ?? null,
      strength: row.strength ?? null,
      longevity_hours: row.longevity_hours ?? null,
      projection: row.projection ?? null,
      climate_fit: row.climate_fit ?? [],
      gender_position: row.gender_position ?? "unisex",
      classification: row.classification ?? null,
      updated_at: new Date().toISOString(),
    });
  }

  if (upserts.length > 0) {
    const { error } = await admin
      .from("fragrance_attributes")
      .upsert(upserts, { onConflict: "product_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    matchedCount: matched.length,
    unmatchedCount: unmatched.length,
    unmatched, // titles that didn't match any live Shopify product — check spelling
  });
}
