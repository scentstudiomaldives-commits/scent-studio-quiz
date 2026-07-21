"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./ProgressBar";
import OptionChip from "./OptionChip";
import type { QuizQuestionConfig } from "@/lib/quiz-config";
import type { BudgetRange, QuizAnswers } from "@/types";

const STORAGE_KEY = "sfy-quiz-progress";
const RESULT_KEY = "sfy-quiz-result";

const EMPTY_ANSWERS: QuizAnswers = {
  gender: null,
  ageRange: null,
  scentFamilies: [],
  dislikedNotes: [],
  occasions: [],
  climate: [],
  strength: null,
  mood: null,
  budgetRangeId: null,
  allowSlightlyHigherBudget: false,
  lovedPerfumeFreeText: null,
};

export default function QuizFlow({
  questions,
  budgetRanges,
}: {
  questions: QuizQuestionConfig[];
  budgetRanges: BudgetRange[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(EMPTY_ANSWERS as any);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore progress saved during this session
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step: savedStep, answers: savedAnswers } = JSON.parse(saved);
        setStep(savedStep ?? 0);
        setAnswers(savedAnswers ?? EMPTY_ANSWERS);
      } catch {
        /* ignore corrupt saved state */
      }
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers }));
  }, [step, answers]);

  const question = questions[step];
  const total = questions.length;
  const isLast = step === total - 1;

  const currentValue = answers[question.key];
  const isMulti = question.type === "multi_select";
  const isAnswered = useMemo(() => {
    if (question.optional) return true;
    if (question.type === "text") return true; // optional by nature
    if (isMulti) return Array.isArray(currentValue) && currentValue.length > 0;
    return currentValue !== null && currentValue !== undefined && currentValue !== "";
  }, [currentValue, question, isMulti]);

  const options = question.key === "budgetRangeId"
    ? budgetRanges.map((r) => ({ value: r.id, label: r.label }))
    : question.options ?? [];

  function toggleMulti(value: string) {
    const list: string[] = Array.isArray(currentValue) ? currentValue : [];
    if (question.key === "dislikedNotes" && value === "none") {
      setAnswers((a) => ({ ...a, [question.key]: list.includes("none") ? [] : ["none"] }));
      return;
    }
    const withoutNone = list.filter((v) => v !== "none");
    const next = withoutNone.includes(value)
      ? withoutNone.filter((v) => v !== value)
      : [...withoutNone, value];
    setAnswers((a) => ({ ...a, [question.key]: next }));
  }

  function selectSingle(value: string) {
    setAnswers((a) => ({ ...a, [question.key]: value }));
  }

  async function handleContinue() {
    if (isLast) {
      setSubmitting(true);
      setError(null);
      try {
        const payload: QuizAnswers = {
          ...(answers as QuizAnswers),
          dislikedNotes: (answers.dislikedNotes ?? []).filter((n: string) => n !== "none"),
        };
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Could not generate recommendations. Please try again.");
        const data = await res.json();
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(data));
        sessionStorage.removeItem(STORAGE_KEY);
        router.push(`/results?session=${data.sessionId}`);
      } catch (e: any) {
        setError(e.message);
        setSubmitting(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <ProgressBar step={step + 1} total={total} />

      <div key={question.key} className="fade-slide-enter">
        <h2 className="mb-1 font-serif text-2xl italic leading-snug text-ink">
          {question.label}
        </h2>
        {question.optional && (
          <p className="mb-4 text-xs uppercase tracking-widest text-brass">Optional</p>
        )}
        {!question.optional && <div className="mb-4" />}

        {question.type === "text" ? (
          <input
            type="text"
            value={currentValue ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [question.key]: e.target.value }))}
            placeholder="e.g. Bleu de Chanel, Baccarat Rouge 540…"
            className="w-full rounded-sm border border-ink/15 bg-white/60 px-4 py-4 text-sm text-ink placeholder:text-ink/30 focus:border-brass"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={isMulti ? (currentValue ?? []).includes(opt.value) : currentValue === opt.value}
                onClick={() => (isMulti ? toggleMulti(opt.value) : selectSingle(opt.value))}
              />
            ))}
          </div>
        )}

        {question.key === "budgetRangeId" && (
          <label className="mt-4 flex items-center gap-2 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={!!answers.allowSlightlyHigherBudget}
              onChange={(e) => setAnswers((a) => ({ ...a, allowSlightlyHigherBudget: e.target.checked }))}
              className="h-4 w-4 accent-brass"
            />
            I'm open to slightly higher-priced suggestions
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-sm text-ink/50 underline-offset-4 hover:underline disabled:opacity-0"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isAnswered || submitting}
          className="rounded-sm bg-ink px-8 py-3 text-sm text-ivory shadow-soft transition-all duration-200 ease-silk hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {submitting ? "Finding your matches…" : isLast ? "See My Matches" : "Continue"}
        </button>
      </div>
    </div>
  );
}
