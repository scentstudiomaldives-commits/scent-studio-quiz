/**
 * Run with: npm run seed
 *
 * Creates 6 test products in Shopify first (Admin → Products → Add product),
 * using the exact titles in sample-inventory.json, priced as listed, then
 * run this script to populate their fragrance attributes in Supabase. This
 * lets you test the full quiz → scoring → results flow with real Shopify
 * inventory before your full catalog is tagged.
 */
import { createClient } from "@supabase/supabase-js";
import sample from "./sample-inventory.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY || !DOMAIN || !TOKEN) {
    console.error("Missing env vars. Copy .env.example to .env.local and fill it in first.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const res = await fetch(`https://${DOMAIN}/api/2024-07/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({
      query: `{ products(first: 100) { edges { node { id title } } } }`,
    }),
  });
  const json = await res.json();
  const products: Array<{ id: string; title: string }> = json.data.products.edges.map((e: any) => e.node);

  let matched = 0;
  for (const item of sample as any[]) {
    const product = products.find((p) => p.title.toLowerCase() === item.title.toLowerCase());
    if (!product) {
      console.warn(`⚠ No Shopify product found titled "${item.title}" — create it first, then re-run.`);
      continue;
    }
    const { error } = await supabase.from("fragrance_attributes").upsert({
      product_id: product.id,
      ...item.attrs,
    });
    if (error) console.error(`✗ ${item.title}:`, error.message);
    else {
      matched++;
      console.log(`✓ Seeded attributes for "${item.title}"`);
    }
  }

  console.log(`\nDone. ${matched}/${sample.length} sample products seeded.`);
}

main();
