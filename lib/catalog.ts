import { fetchAllProducts } from "./shopify";
import { getSupabaseClient } from "./supabase";
import type { ScorableProduct, FragranceAttributes } from "@/types";

const emptyAttrs = (productId: string): FragranceAttributes => ({
  product_id: productId,
  scent_families: [],
  top_notes: [],
  mid_notes: [],
  base_notes: [],
  occasions: [],
  mood: null,
  strength: null,
  longevity_hours: null,
  projection: null,
  climate_fit: [],
  gender_position: "unisex",
  classification: null,
  is_featured: false,
  is_excluded: false,
});

/**
 * Fetches live Shopify inventory and joins it with fragrance intelligence
 * from Supabase (`fragrance_attributes`). Products with no matching row are
 * still included (with empty attributes) so nothing silently disappears —
 * they'll simply score low until an admin fills in their attributes.
 */
export async function getScorableCatalog(): Promise<ScorableProduct[]> {
  const [products, attrsResult] = await Promise.all([
    fetchAllProducts(),
    getSupabaseClient().from("fragrance_attributes").select("*"),
  ]);

  const attrsMap = new Map<string, FragranceAttributes>();
  (attrsResult.data ?? []).forEach((row: any) => attrsMap.set(row.product_id, row));

  return products.map((p) => ({
    ...p,
    attrs: attrsMap.get(p.id) ?? emptyAttrs(p.id),
  }));
}
