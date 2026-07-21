import { NextRequest, NextResponse } from "next/server";
import { getScorableCatalog } from "@/lib/catalog";
import { scoreProducts } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_WEIGHTS, type QuizAnswers, type BudgetRange } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const answers: QuizAnswers = await req.json();
    const admin = getSupabaseAdmin();

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

    const { primary, alternates, insufficientMatches } = scoreProducts(
      catalog,
      answers,
      weights,
      budgetRanges
    );

    // Persist the session + shown recommendations for analytics/share-links
    const { data: session, error: sessionErr } = await admin
      .from("quiz_sessions")
      .insert({ answers })
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    const recRows = [
      ...primary.map((s, i) => ({ session_id: session.id, product_id: s.product.id, score: s.score, rank: i + 1 })),
      ...alternates.map((s, i) => ({ session_id: session.id, product_id: s.product.id, score: s.score, rank: i + 4 })),
    ];
    if (recRows.length > 0) {
      await admin.from("quiz_recommendations").insert(recRows);
    }

    return NextResponse.json({
      sessionId: session.id,
      primary,
      alternates,
      insufficientMatches,
      answers,
    });
  } catch (err: any) {
    console.error("quiz/submit error", err);
    return NextResponse.json({ error: err.message ?? "Something went wrong" }, { status: 500 });
  }
}
