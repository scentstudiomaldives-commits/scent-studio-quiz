import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getSupabaseAdmin();

  const [sessionsRes, recsRes, conversionsRes] = await Promise.all([
    admin.from("quiz_sessions").select("answers, created_at"),
    admin.from("quiz_recommendations").select("product_id, rank"),
    admin.from("conversions").select("product_id, event"),
  ]);

  const sessions = sessionsRes.data ?? [];
  const recs = recsRes.data ?? [];
  const conversions = conversionsRes.data ?? [];

  // Most selected scent families across all quiz sessions
  const familyCounts: Record<string, number> = {};
  sessions.forEach((s: any) => {
    (s.answers?.scentFamilies ?? []).forEach((f: string) => {
      familyCounts[f] = (familyCounts[f] ?? 0) + 1;
    });
  });
  const topFamilies = Object.entries(familyCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Most recommended products (by times appearing in top-3)
  const recCounts: Record<string, number> = {};
  recs.filter((r: any) => r.rank <= 3).forEach((r: any) => {
    recCounts[r.product_id] = (recCounts[r.product_id] ?? 0) + 1;
  });
  const topRecommended = Object.entries(recCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Recommendation-to-purchase conversion rate
  const totalPrimaryRecs = recs.filter((r: any) => r.rank <= 3).length;
  const addToCartCount = conversions.filter((c: any) => c.event === "add_to_cart").length;
  const conversionRate = totalPrimaryRecs > 0 ? (addToCartCount / totalPrimaryRecs) * 100 : 0;

  return NextResponse.json({
    totalSessions: sessions.length,
    topFamilies,
    topRecommended,
    addToCartCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
  });
}
