import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Browser-safe client — uses the anon key, protected by Row Level Security.
// Public policies: read-only on fragrance_attributes, quiz_questions,
// quiz_options, budget_ranges, scoring_weights. Insert-only on quiz_sessions,
// quiz_recommendations, conversions. All admin writes require the service
// role key, which only ever runs on the server (see lib/supabase-admin.ts).
export function getSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
