"use client";

import { useEffect, useState } from "react";
import type { ScoringWeights, BudgetRange } from "@/types";

export default function AdminWeightsPage() {
  const [weights, setWeights] = useState<ScoringWeights | null>(null);
  const [ranges, setRanges] = useState<BudgetRange[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => {
        setWeights(d.weights);
        setRanges(
          (d.budgetRanges ?? []).map((r: any) => ({
            id: r.id, label: r.label, min: Number(r.min_mvr), max: r.max_mvr === null ? null : Number(r.max_mvr), sort_order: r.sort_order,
          }))
        );
      });
  }, []);

  const total = weights
    ? weights.family + weights.notes + weights.occasion + weights.mood + weights.performance + weights.climate + weights.budget
    : 0;

  async function saveWeights() {
    setStatus("Saving…");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights }),
    });
    const d = await res.json();
    setStatus(res.ok ? "Saved." : d.error);
  }

  async function saveRanges() {
    setStatus("Saving…");
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budgetRanges: ranges.map((r) => ({ id: r.id, label: r.label, min_mvr: r.min, max_mvr: r.max, sort_order: r.sort_order })),
      }),
    });
    setStatus("Saved.");
  }

  if (!weights) return <main className="p-12 text-sm text-ink/50">Loading…</main>;

  return (
    <main className="min-h-screen bg-ivory px-6 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 font-serif text-2xl italic text-ink">Scoring Weights</h1>
        <p className={`mb-4 text-xs ${total === 100 ? "text-green-700" : "text-red-600"}`}>Total: {total}% (must equal 100%)</p>
        <div className="flex flex-col gap-3">
          {(Object.keys(weights) as (keyof ScoringWeights)[]).map((key) => (
            <label key={key} className="flex items-center justify-between gap-4 text-sm capitalize text-ink">
              {key}
              <input
                type="number"
                value={weights[key]}
                onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                className="w-20 rounded border border-ink/15 px-2 py-1 text-right"
              />
            </label>
          ))}
        </div>
        <button onClick={saveWeights} className="mt-4 rounded bg-ink px-5 py-2.5 text-xs text-ivory">Save Weights</button>

        <h2 className="mb-4 mt-12 font-serif text-2xl italic text-ink">Budget Ranges</h2>
        <div className="flex flex-col gap-3">
          {ranges.map((r, i) => (
            <div key={r.id} className="grid grid-cols-3 gap-2 text-sm">
              <input
                value={r.label}
                onChange={(e) => setRanges((rs) => rs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                className="rounded border border-ink/15 px-2 py-1"
              />
              <input
                type="number"
                value={r.min}
                onChange={(e) => setRanges((rs) => rs.map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)))}
                className="rounded border border-ink/15 px-2 py-1"
                placeholder="min"
              />
              <input
                type="number"
                value={r.max ?? ""}
                onChange={(e) => setRanges((rs) => rs.map((x, j) => (j === i ? { ...x, max: e.target.value === "" ? null : Number(e.target.value) } : x)))}
                className="rounded border border-ink/15 px-2 py-1"
                placeholder="max (blank = no limit)"
              />
            </div>
          ))}
        </div>
        <button onClick={saveRanges} className="mt-4 rounded bg-ink px-5 py-2.5 text-xs text-ivory">Save Budget Ranges</button>

        {status && <p className="mt-4 text-xs text-ink/60">{status}</p>}
      </div>
    </main>
  );
}
