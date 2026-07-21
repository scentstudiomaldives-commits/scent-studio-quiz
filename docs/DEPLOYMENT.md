# Deployment (Vercel)

Matches your existing GitHub → Vercel → Supabase workflow.

1. Push this project to a new GitHub repo (use the GitHub web editor to create the repo
   and upload these files, or `git push` if you're on a machine with git).
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: Next.js (auto-detected).
4. Add environment variables (Project Settings → Environment Variables) — copy every key
   from your `.env.local`:
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_DASHBOARD_PASSWORD`
5. Deploy.
6. Visit `https://your-project.vercel.app/admin` to confirm the basic-auth prompt appears
   and your password works.
7. Point a subdomain at it if you like (e.g. `scent.scentstudiomv.com`) via Vercel →
   Domains, matching the pattern you already use for your resort agency subdomains.
8. Embed in Shopify per the last step of `docs/SETUP.md`.

## Notes

- No server or local dev environment required beyond `npm run dev` for local testing —
  everything else runs on Vercel + Supabase, consistent with your other projects.
- Product data is cached for 5 minutes at the edge (`next: { revalidate: 300 }` in
  `lib/shopify.ts`) to stay fast without hammering the Storefront API; lower this if you
  need near-instant stock updates during a flash sale.
