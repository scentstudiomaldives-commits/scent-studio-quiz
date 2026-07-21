# Find Your Perfect Scent

A fragrance recommendation quiz for **Scent Studio**, built to embed into the Shopify
storefront. Asks a short quiz (or takes a "find something similar" search), scores your
live Shopify catalog with a transparent weighted engine, and recommends only in-stock
products.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Shopify Storefront API · Supabase

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in your Shopify + Supabase credentials
npm run dev
```

Then see, in order:

1. **`docs/SETUP.md`** — Supabase + Shopify setup, env vars, local run, sample data
2. **`docs/SHOPIFY_INTEGRATION.md`** — Storefront API scopes, metafield schema
3. **`docs/DEPLOYMENT.md`** — deploying to Vercel
4. **`docs/TESTING_CHECKLIST.md`** — full QA pass before going live

## Project structure

```
app/
  page.tsx                 Welcome screen
  quiz/page.tsx             Scent Quiz
  similar/page.tsx          Find Something Similar
  results/page.tsx          Results, comparison, share
  admin/                    Admin dashboard (products, weights, analytics)
  api/
    quiz/submit             Score quiz answers → recommendations
    quiz/results/[id]       Reconstruct results for shared links
    quiz/track              Log view/add-to-cart conversions
    similar/search           Autocomplete search
    similar/recommend        Similar-product scoring
    admin/*                  Admin CRUD + analytics (basic-auth protected)
components/                 QuizFlow, ProductCard, ComparisonTable, etc.
lib/
  shopify.ts                Storefront API client (public-safe)
  supabase.ts / supabase-admin.ts
  scoring.ts                The recommendation engine
  catalog.ts                Joins live Shopify data with Supabase attributes
  quiz-config.ts            Default + admin-configurable quiz questions
types/                      Shared TypeScript types
supabase/schema.sql         Full DB schema + RLS policies
scripts/                    Sample inventory + seed script
docs/                       Setup, Shopify, deployment, testing docs
```

## Design tokens

Warm ivory `#FFFCF7` / beige `#F5F0E8` background, ink `#111111` type, brass-gold
`#B08D57` accent. Fraunces-style serif (Cormorant Garamond) for headings, Work Sans for
body — same editorial pairing as the rest of the Scent Studio brand.
