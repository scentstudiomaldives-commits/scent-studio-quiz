"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ComparisonTable from "@/components/ComparisonTable";
import ScentProfile from "@/components/ScentProfile";
import type { ScoredProduct, QuizAnswers } from "@/types";

const RESULT_KEY = "sfy-quiz-result";

interface ResultData {
  sessionId: string;
  primary: ScoredProduct[];
  alternates: ScoredProduct[];
  insufficientMatches: boolean;
  answers?: QuizAnswers;
}

export default function ResultsClient() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(RESULT_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!sessionId || parsed.sessionId === sessionId) {
        setData(parsed);
        setLoading(false);
        return;
      }
    }
    // Shared link opened fresh — reconstruct from the server
    if (sessionId) {
      fetch(`/api/quiz/results/${sessionId}`)
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  function handleRetake() {
    sessionStorage.removeItem(RESULT_KEY);
    router.push("/quiz");
  }

  async function handleShare() {
    const url = `${window.location.origin}/results?session=${data?.sessionId}`;
    if (navigator.share) {
      await navigator.share({ title: "My Scent Match — Scent Studio", url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-ink/50">
        Preparing your scent profile…
      </main>
    );
  }

  if (!data || (data.primary.length === 0 && data.alternates.length === 0)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-2xl italic text-ink">No matches yet</h1>
        <p className="max-w-xs text-sm text-ink/60">
          We couldn't find results for this session. Let's take the quiz again.
        </p>
        <Link href="/quiz" className="rounded-sm bg-ink px-6 py-3 text-sm text-ivory">
          Start the Quiz
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-brass">Your Consultation</p>
          <h1 className="font-serif text-3xl italic text-ink">Your Matches</h1>
        </header>

        {data.answers && <ScentProfile answers={data.answers} />}

        {data.insufficientMatches && (
          <p className="rounded-sm border border-brass/30 bg-beige/40 p-4 text-sm text-ink/70">
            We didn't find enough strong matches for every preference you selected, so the
            results below are our closest available options rather than perfect matches.
            Widening your scent families or budget may surface better fits.
          </p>
        )}

        <section>
          <h2 className="mb-4 font-serif text-xl italic text-ink">Top Recommendations</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {data.primary.map((s, i) => (
              <ProductCard key={s.product.id} scored={s} sessionId={data.sessionId} rank={i + 1} />
            ))}
          </div>
        </section>

        {data.primary.length > 1 && (
          <section>
            <h2 className="mb-4 font-serif text-xl italic text-ink">Compare</h2>
            <ComparisonTable items={data.primary} />
          </section>
        )}

        {data.alternates.length > 0 && (
          <section>
            <h2 className="mb-4 font-serif text-xl italic text-ink">Also Worth Considering</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {data.alternates.map((s, i) => (
                <ProductCard key={s.product.id} scored={s} sessionId={data.sessionId} rank={i + 4} compact />
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap justify-center gap-3 border-t border-ink/10 pt-8">
          <button onClick={handleRetake} className="rounded-sm border border-ink/15 px-6 py-3 text-xs uppercase tracking-wide text-ink hover:border-brass">
            Retake Quiz
          </button>
          <button onClick={handleShare} className="rounded-sm bg-ink px-6 py-3 text-xs uppercase tracking-wide text-ivory hover:bg-ink/90">
            {shared ? "Link Copied!" : "Share My Results"}
          </button>
        </div>
      </div>
    </main>
  );
}
