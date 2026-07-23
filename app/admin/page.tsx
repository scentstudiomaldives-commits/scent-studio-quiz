import Link from "next/link";

export default function AdminHome() {
  const links = [
    { href: "/admin/products", label: "Product Attributes", desc: "Edit scent families, notes, mood, climate fit per product" },
    { href: "/admin/bulk-import", label: "Bulk Import", desc: "Paste a JSON batch of attributes and save them all at once" },
    { href: "/admin/weights", label: "Scoring Weights", desc: "Adjust how much each factor counts, and budget ranges" },
    { href: "/admin/analytics", label: "Analytics", desc: "Most selected preferences, top recommendations, conversions" },
  ];
  return (
    <main className="min-h-screen bg-ivory px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-1 text-xs uppercase tracking-widest text-brass">Scent Studio</p>
        <h1 className="mb-8 font-serif text-3xl italic text-ink">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-sm border border-ink/10 bg-white/50 p-6 transition hover:border-brass hover:shadow-card"
            >
              <h2 className="mb-1 font-serif text-lg italic text-ink">{l.label}</h2>
              <p className="text-xs text-ink/50">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
