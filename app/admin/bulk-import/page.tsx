"use client";

import { useState } from "react";

const PLACEHOLDER = `[
  {
    "title": "Giorgio Armani Stronger With You Tobacco",
    "scent_families": ["amber", "spicy", "tobacco", "woody"],
    "top_notes": ["pink pepper", "black pepper", "cardamom", "sage"],
    "mid_notes": ["tobacco", "chestnut", "cinnamon leaf"],
    "base_notes": ["vanilla", "amber", "guaiac wood"],
    "occasions": ["evening_events", "date_night"],
    "mood": "dark_mysterious",
    "strength": "strong",
    "climate_fit": ["warm_evening", "ac_office"],
    "gender_position": "men",
    "classification": "designer"
  }
]`;

export default function BulkImportPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ matchedCount: number; unmatchedCount: number; unmatched: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setError(null);
    setResult(null);
    let rows;
    try {
      rows = JSON.parse(text);
    } catch {
      setError("That's not valid JSON — check for a missing comma or bracket.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 font-serif text-2xl italic text-ink">Bulk Import Attributes</h1>
        <p className="mb-6 text-xs text-ink/50">
          Paste a JSON array of products. Each row is matched to a live Shopify product by exact
          title (case-insensitive). Titles that don't match anything in your store are reported
          below, not silently dropped.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={16}
          className="w-full rounded border border-ink/15 bg-white p-3 font-mono text-xs"
        />

        <button
          onClick={handleImport}
          disabled={loading || !text.trim()}
          className="mt-4 rounded bg-ink px-5 py-2.5 text-xs text-ivory disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mt-6 rounded border border-ink/10 bg-white/60 p-4 text-sm">
            <p className="mb-2 text-green-700">✓ Matched and saved: {result.matchedCount}</p>
            {result.unmatchedCount > 0 && (
              <>
                <p className="mb-1 text-red-600">✗ Unmatched (check exact spelling in Shopify): {result.unmatchedCount}</p>
                <ul className="list-disc pl-5 text-xs text-ink/60">
                  {result.unmatched.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
