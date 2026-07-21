"use client";

import { useEffect, useState } from "react";

interface Analytics {
  totalSessions: number;
  topFamilies: [string, number][];
  topRecommended: [string, number][];
  addToCartCount: number;
  conversionRate: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <main className="p-12 text-sm text-ink/50">Loading…</main>;

  return (
    <main className="min-h-screen bg-ivory px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-serif text-2xl italic text-ink">Analytics</h1>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <Stat label="Quiz sessions" value={data.totalSessions} />
          <Stat label="Add-to-cart clicks" value={data.addToCartCount} />
          <Stat label="Recommendation → cart rate" value={`${data.conversionRate}%`} />
        </div>

        <section className="mb-8">
          <h2 className="mb-3 font-serif text-lg italic text-ink">Most Selected Scent Preferences</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {data.topFamilies.map(([f, c]) => (
              <li key={f} className="flex justify-between border-b border-ink/5 py-1 capitalize">
                <span>{f}</span><span className="text-ink/50">{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg italic text-ink">Most Recommended Products (Product IDs)</h2>
          <ul className="flex flex-col gap-1 text-xs">
            {data.topRecommended.map(([id, c]) => (
              <li key={id} className="flex justify-between border-b border-ink/5 py-1">
                <span className="truncate">{id}</span><span className="text-ink/50">{c}× in top 3</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white/50 p-4 text-center">
      <p className="font-serif text-2xl italic text-ink">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-ink/40">{label}</p>
    </div>
  );
}
