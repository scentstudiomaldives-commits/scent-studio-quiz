import { NextRequest, NextResponse } from "next/server";
import { getScorableCatalog } from "@/lib/catalog";
import { scoreProducts } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_WEIGHTS, type BudgetRange } from "@/types";

// Re-derives results for a shared link by re-scoring the saved answers
// against the CURRENT catalog — so stock/price are always accurate,
// even if the link is opened days after the quiz was taken.
export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  const admin = getSupabaseAdmin();
  const { data: session, error } = await admin
    .from("quiz_sessions")
    .select("*")
    .eq("id", params.sessionId)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const [catalog, weightsResult, budgetResult] = await Promise.all([
    getScorableCatalog(),
    admin.from("scoring_weights").select("*").eq("id", 1).single(),
    admin.from("budget_ranges").select("*").order("sort_order"),
  ]);

  const weights = weightsResult.data ?? DEFAULT_WEIGHTS;
  const budgetRanges: BudgetRange[] = (budgetResult.data ?? []).map((r: any) => ({
    id: r.id,
    label: r.label,
    min: Number(r.min_mvr),
    max: r.max_mvr === null ? null : Number(r.max_mvr),
    sort_order: r.sort_order,
  }));

  const result = scoreProducts(catalog, session.answers, weights, budgetRanges);
  return NextResponse.json({ sessionId: session.id, ...result, answers: session.answers });
}
