import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getSupabaseAdmin();
  const [weights, budgets] = await Promise.all([
    admin.from("scoring_weights").select("*").eq("id", 1).single(),
    admin.from("budget_ranges").select("*").order("sort_order"),
  ]);
  return NextResponse.json({ weights: weights.data, budgetRanges: budgets.data });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const admin = getSupabaseAdmin();

  if (body.weights) {
    const w = body.weights;
    const total = w.family + w.notes + w.occasion + w.mood + w.performance + w.climate + w.budget;
    if (Math.abs(total - 100) > 0.5) {
      return NextResponse.json({ error: `Weights must sum to 100 (currently ${total})` }, { status: 400 });
    }
    const { error } = await admin.from("scoring_weights").update(w).eq("id", 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.budgetRanges) {
    for (const range of body.budgetRanges) {
      const { error } = await admin.from("budget_ranges").upsert(range);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
