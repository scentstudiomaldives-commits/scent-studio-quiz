import type { ScoredProduct } from "@/types";

function formatMVR(amount: string) {
  return `MVR ${Number(amount).toLocaleString("en-US")}`;
}

export default function ComparisonTable({ items }: { items: ScoredProduct[] }) {
  if (items.length < 2) return null;
  const rows: Array<{ label: string; render: (s: ScoredProduct) => string }> = [
    { label: "Match", render: (s) => `${s.score}%` },
    { label: "Price", render: (s) => formatMVR(s.product.priceRange.minVariantPrice.amount) },
    { label: "Families", render: (s) => s.product.attrs.scent_families.slice(0, 3).join(", ") || "—" },
    { label: "Performance", render: (s) => s.product.attrs.strength?.replace(/_/g, " ") || "—" },
    { label: "Best for", render: (s) => s.product.attrs.occasions.slice(0, 2).join(", ").replace(/_/g, " ") || "—" },
    { label: "Classification", render: (s) => s.product.attrs.classification ?? "—" },
  ];

  return (
    <div className="overflow-x-auto rounded-sm border border-ink/10 bg-white/50">
      <table className="w-full min-w-[480px] text-left text-xs">
        <thead>
          <tr className="border-b border-ink/10">
            <th className="p-3 font-normal text-ink/40">Compare</th>
            {items.map((s) => (
              <th key={s.product.id} className="p-3 font-serif text-sm italic text-ink">
                {s.product.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-ink/5 last:border-0">
              <td className="p-3 text-ink/40">{row.label}</td>
              {items.map((s) => (
                <td key={s.product.id} className="p-3 capitalize text-ink/80">
                  {row.render(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
