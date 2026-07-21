import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY client. Uses the Supabase service role key, which bypasses
 * Row Level Security. Never import this file from a Client Component or
 * anywhere that could end up in the browser bundle — the `server-only`
 * import above will throw a build error if that happens by mistake.
 * Used by: admin dashboard API routes (app/admin/**\/api or app/api/admin/**).
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
