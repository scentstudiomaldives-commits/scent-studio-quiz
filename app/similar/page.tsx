"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { ScoredProduct } from "@/types";

interface SearchResult {
  id: string;
  title: string;
  vendor: string;
  image: string | null;
  price: string;
}

export default function SimilarPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [chosen, setChosen] = useState<SearchResult | null>(null);
  const [results, setResults] = useState<{ sessionId: string; results: ScoredProduct[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chosen || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/similar/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.results);
    }, 300);
    return () => clearTimeout(handle);
  }, [query, chosen]);

  async function handleChoose(product: SearchResult) {
    setChosen(product);
    setSuggestions([]);
    setLoading(true);
    const res = await fetch("/api/similar/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-brass">Find Something Similar</p>
          <h1 className="font-serif text-3xl italic text-ink">What do you already love?</h1>
          <p className="mt-2 text-sm text-ink/60">Search a perfume you own and we'll find close matches in our collection.</p>
        </header>

        {!chosen && (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by perfume name…"
              className="w-full rounded-sm border border-ink/15 bg-white/60 px-4 py-4 text-sm focus:border-brass"
              autoFocus
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-ink/10 bg-ivory shadow-card">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => handleChoose(s)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-beige/50"
                    >
                      {s.image && <img src={s.image} alt="" className="h-10 w-10 rounded object-cover" />}
                      <span>
                        <span className="block text-ink">{s.title}</span>
                        <span className="block text-xs text-ink/40">{s.vendor}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {chosen && (
          <div className="flex items-center justify-between rounded-sm border border-brass/30 bg-beige/40 p-4">
            <span className="text-sm text-ink">
              Finding matches for <strong className="font-serif italic">{chosen.title}</strong>
            </span>
            <button
              onClick={() => {
                setChosen(null);
                setResults(null);
                setQuery("");
              }}
              className="text-xs uppercase tracking-wide text-brass underline"
            >
              Change
            </button>
          </div>
        )}

        {loading && <p className="text-center text-sm text-ink/50">Searching our collection…</p>}

        {results && results.results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {results.results.slice(0, 6).map((s, i) => (
              <ProductCard key={s.product.id} scored={s} sessionId={results.sessionId} rank={i + 1} compact={i >= 3} />
            ))}
          </div>
        )}

        {results && results.results.length === 0 && (
          <p className="text-center text-sm text-ink/60">
            We couldn't find a close match in stock right now — try the Scent Quiz instead for a broader search.
          </p>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs uppercase tracking-wide text-ink/40 underline">
            ← Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}
