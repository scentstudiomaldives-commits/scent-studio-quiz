# Setup Instructions

## 1. Supabase

1. Create a project at supabase.com.
2. Open the SQL Editor, paste the contents of `supabase/schema.sql`, and run it.
3. Go to Project Settings → API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server only)

## 2. Shopify

See `docs/SHOPIFY_INTEGRATION.md` for the full metafield setup. Quick version:

1. Shopify Admin → Apps → Develop apps → Create an app named "Find Your Perfect Scent".
2. Configuration → Storefront API → enable scopes: `unauthenticated_read_product_listings`,
   `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts` (for cart/checkout).
3. Install the app, copy the **Storefront API access token** (this is the public-safe token) →
   `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`.
4. `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` = `your-store.myshopify.com`.
5. Create the metafield definitions listed in `docs/SHOPIFY_INTEGRATION.md` under Settings →
   Custom data → Products.

## 3. Environment variables

```bash
cp .env.example .env.local
# fill in the values from steps 1-2
```

Set `ADMIN_DASHBOARD_PASSWORD` to something strong — this protects `/admin`.

## 4. Install & run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 5. Test with sample data (optional but recommended)

1. In Shopify Admin, create 6 test products using the exact titles and prices in
   `scripts/sample-inventory.json`.
2. Run `npm run seed` — this pushes the sample fragrance attributes into Supabase for those
   products, matched by title.
3. Take the quiz at `/quiz` and confirm you get real, in-stock recommendations.

## 6. Tag your real catalog

Once you're confident the flow works, go to `/admin/products` and fill in the scent
attributes for your actual inventory (or edit metafields directly in Shopify — either
source works, see the integration doc for how they relate).

## 7. Embed in your Shopify theme

Deploy the app (see `docs/DEPLOYMENT.md`), then embed it as an iframe or a link from your
theme, e.g. a "Find Your Perfect Scent" button in your nav that links to
`https://your-deployed-app.vercel.app`. For a fully inline experience, add an
`<iframe src="https://your-deployed-app.vercel.app" style="width:100%;border:0;min-height:100vh">`
inside a custom section template in your Shopify theme.
