# Shopify Integration

## Why Storefront API, not Admin API

The Admin API token can read/write everything in your store and must never appear in
frontend code. This app only ever uses the **Storefront API** in the browser — a token
type Shopify designed to be public, scoped to read-only catalog data plus cart/checkout
creation. All product tagging (the fragrance attributes) happens server-side via the
admin dashboard, using the Supabase service role key — never the Shopify Admin API key
in the client bundle.

## Create the Storefront API app

1. Shopify Admin → **Settings → Apps and sales channels → Develop apps**.
2. **Create an app** → name it "Find Your Perfect Scent".
3. **Configuration → Storefront API scopes** → enable:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts` (needed for the Add to Cart button)
4. **Install app**, then under **API credentials**, copy the **Storefront API access
   token**.

## Metafield schema (namespace: `scent`)

Create these under **Settings → Custom data → Products → Add definition**. Namespace
`scent`, one definition per row below.

| Key | Type | Notes |
|---|---|---|
| `families` | List of single line text | Values: fresh, citrus, aquatic, floral, fruity, sweet, vanilla, gourmand, woody, spicy, amber, musk, leather, tobacco, oud |
| `top_notes` | List of single line text | Free text, lowercase |
| `mid_notes` | List of single line text | |
| `base_notes` | List of single line text | |
| `occasions` | List of single line text | everyday, office, date_night, evening_events, weddings_special, holiday, gift |
| `mood` | Single line text | One of the 7 mood values (see quiz config) |
| `strength` | Single line text | light, moderate, strong, very_strong |
| `longevity_hours` | Integer | Approximate hours of wear |
| `projection` | Single line text | intimate, moderate, heavy |
| `climate_fit` | List of single line text | hot_daytime, warm_evening, ac_office, any_weather |
| `gender` | Single line text | women, men, unisex |
| `classification` | Single line text | designer, niche |

## How Shopify metafields and Supabase relate

The scoring engine reads fragrance attributes from **Supabase** (`fragrance_attributes`
table), not directly from Shopify metafields at request time — this keeps quiz scoring
fast and lets your admin dashboard edit attributes without touching Shopify.

You have two ways to populate that table:

1. **Directly in the admin dashboard** (`/admin/products`) — fastest for day-to-day
   edits, no Shopify access needed.
2. **From Shopify metafields** — if you prefer tagging fragrances inside Shopify itself
   (e.g. so your whole team edits them there), add a small sync script that reads the
   `scent.*` metafields via the Storefront API and upserts them into
   `fragrance_attributes`. This isn't included by default since most single-admin setups
   find the dashboard faster, but the metafield schema above is designed to map 1:1 onto
   the `fragrance_attributes` columns if you want to build that sync later.

## What's fetched live from Shopify at quiz time

Every quiz submission fetches current data directly from Shopify via the Storefront API:
product title, vendor, image, price, tags, and — critically — **live inventory and
availability**, so out-of-stock products are never recommended, even if they were in
stock an hour ago.

## Add to Cart

Uses the Storefront `cartCreate` mutation to create a cart with the selected variant,
then redirects to the returned `checkoutUrl` — your existing Shopify checkout, no custom
payment handling needed.
