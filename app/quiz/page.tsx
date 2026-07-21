import { getQuizQuestions } from "@/lib/quiz-config";
import { getSupabaseClient } from "@/lib/supabase";
import QuizFlow from "@/components/QuizFlow";
import type { BudgetRange } from "@/types";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [questions, budgetResult] = await Promise.all([
    getQuizQuestions(),
    getSupabaseClient().from("budget_ranges").select("*").order("sort_order"),
  ]);

  const budgetRanges: BudgetRange[] = (budgetResult.data ?? []).map((r: any) => ({
    id: r.id,
    label: r.label,
    min: Number(r.min_mvr),
    max: r.max_mvr === null ? null : Number(r.max_mvr),
    sort_order: r.sort_order,
  }));

  return (
    <main className="min-h-screen px-6 py-10">
      <QuizFlow questions={questions} budgetRanges={budgetRanges} />
    </main>
  );
}
