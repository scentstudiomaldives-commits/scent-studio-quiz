"use client";

import { useEffect, useState } from "react";
import type { ScorableProduct } from "@/types";

function ArrayInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <input
      className="w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
      value={value.join(", ")}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ScorableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<ScorableProduct["attrs"]>) {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, attrs: { ...p.attrs, ...patch } } : p)));
  }

  async function save(p: ScorableProduct) {
    setSavingId(p.id);
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p.attrs, product_id: p.id }),
    });
    setSavingId(null);
  }

  const visible = products.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <main className="p-12 text-sm text-ink/50">Loading catalog from Shopify…</main>;

  return (
    <main className="min-h-screen bg-ivory px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 font-serif text-2xl italic text-ink">Product Attributes</h1>
        <p className="mb-6 text-xs text-ink/50">{products.length} products loaded from Shopify. Changes save per-product.</p>
        <input
          placeholder="Filter by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-4 w-full max-w-sm rounded border border-ink/15 px-3 py-2 text-sm"
        />
        <div className="flex flex-col gap-3">
          {visible.map((p) => (
            <details key={p.id} className="rounded-sm border border-ink/10 bg-white/50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-ink">
                {p.title} <span className="ml-2 text-xs text-ink/40">{p.vendor} · MVR {p.priceRange.minVariantPrice.amount}</span>
                {p.attrs.is_excluded && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-700">Excluded</span>}
                {p.attrs.is_featured && <span className="ml-2 rounded bg-brass/20 px-2 py-0.5 text-[10px] text-brass">Featured</span>}
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Scent families</label>
                  <ArrayInput value={p.attrs.scent_families} onChange={(v) => update(p.id, { scent_families: v as any })} placeholder="woody, amber" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Top notes</label>
                  <ArrayInput value={p.attrs.top_notes} onChange={(v) => update(p.id, { top_notes: v })} placeholder="bergamot" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Mid notes</label>
                  <ArrayInput value={p.attrs.mid_notes} onChange={(v) => update(p.id, { mid_notes: v })} placeholder="jasmine" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Base notes</label>
                  <ArrayInput value={p.attrs.base_notes} onChange={(v) => update(p.id, { base_notes: v })} placeholder="musk" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Occasions</label>
                  <ArrayInput value={p.attrs.occasions} onChange={(v) => update(p.id, { occasions: v as any })} placeholder="office, date_night" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Climate fit</label>
                  <ArrayInput value={p.attrs.climate_fit} onChange={(v) => update(p.id, { climate_fit: v as any })} placeholder="hot_daytime" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Mood</label>
                  <select
                    className="w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
                    value={p.attrs.mood ?? ""}
                    onChange={(e) => update(p.id, { mood: (e.target.value || null) as any })}
                  >
                    <option value="">—</option>
                    {["clean_refreshing","soft_romantic","elegant_sophisticated","sweet_playful","bold_seductive","dark_mysterious","luxurious_powerful"].map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g," ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Strength</label>
                  <select
                    className="w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
                    value={p.attrs.strength ?? ""}
                    onChange={(e) => update(p.id, { strength: (e.target.value || null) as any })}
                  >
                    <option value="">—</option>
                    {["light","moderate","strong","very_strong"].map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Gender position</label>
                  <select
                    className="w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
                    value={p.attrs.gender_position}
                    onChange={(e) => update(p.id, { gender_position: e.target.value as any })}
                  >
                    {["women","men","unisex"].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-ink/40">Classification</label>
                  <select
                    className="w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
                    value={p.attrs.classification ?? ""}
                    onChange={(e) => update(p.id, { classification: (e.target.value || null) as any })}
                  >
                    <option value="">—</option>
                    <option value="designer">Designer</option>
                    <option value="niche">Niche</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={p.attrs.is_featured} onChange={(e) => update(p.id, { is_featured: e.target.checked })} />
                    Featured
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={p.attrs.is_excluded} onChange={(e) => update(p.id, { is_excluded: e.target.checked })} />
                    Exclude
                  </label>
                </div>
              </div>
              <button
                onClick={() => save(p)}
                disabled={savingId === p.id}
                className="mt-4 rounded bg-ink px-4 py-2 text-xs text-ivory disabled:opacity-50"
              >
                {savingId === p.id ? "Saving…" : "Save"}
              </button>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
