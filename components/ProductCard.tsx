"use client";

import { useState } from "react";
import Image from "next/image";
import type { ScoredProduct } from "@/types";

function formatMVR(amount: string) {
  return `MVR ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function ProductCard({
  scored,
  sessionId,
  rank,
  compact = false,
}: {
  scored: ScoredProduct;
  sessionId: string;
  rank: number;
  compact?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const { product, score, reason } = scored;
  const { attrs } = product;

  function track(event: "view_product" | "add_to_cart") {
    fetch("/api/quiz/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, productId: product.id, event }),
    }).catch(() => {});
  }

  async function handleAddToCart() {
    setAdding(true);
    track("add_to_cart");
    try {
      const { addToCart } = await import("@/lib/shopify");
      const checkoutUrl = await addToCart(product.variantId, 1);
      window.location.href = checkoutUrl;
    } catch {
      setAdding(false);
      window.location.href = product.productUrl;
    }
  }

  return (
    <article className="overflow-hidden rounded-sm border border-ink/10 bg-white/60 shadow-card">
      <div className="relative aspect-square w-full bg-beige">
        {rank <= 3 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink px-2.5 py-1 text-[10px] uppercase tracking-widest text-ivory">
            #{rank} Match
          </span>
        )}
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/20">No image</div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brass">{product.vendor}</p>
            <h3 className="font-serif text-xl italic text-ink">{product.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-serif text-lg text-ink">{score}%</p>
            <p className="text-[10px] uppercase tracking-wide text-ink/40">match</p>
          </div>
        </div>

        <p className="mb-3 text-sm font-medium text-ink/80">
          {formatMVR(product.priceRange.minVariantPrice.amount)}
          <span className="ml-2 text-xs font-normal text-green-700">In stock</span>
        </p>

        {!compact && (
          <>
            <p className="mb-3 text-sm leading-relaxed text-ink/60">{reason}</p>

            <dl className="mb-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-ink/60">
              <div>
                <dt className="text-ink/40">Families</dt>
                <dd className="capitalize">{attrs.scent_families.slice(0, 3).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/40">Key notes</dt>
                <dd className="capitalize">{[...attrs.top_notes, ...attrs.base_notes].slice(0, 3).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/40">Best for</dt>
                <dd className="capitalize">{attrs.occasions.slice(0, 2).join(", ").replace(/_/g, " ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/40">Performance</dt>
                <dd className="capitalize">{attrs.strength?.replace(/_/g, " ") || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink/40">Maldives climate</dt>
                <dd className="capitalize">{attrs.climate_fit.join(", ").replace(/_/g, " ") || "Suitable"}</dd>
              </div>
            </dl>
          </>
        )}

        <div className="flex gap-2">
          <a
            href={product.productUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("view_product")}
            className="flex-1 rounded-sm border border-ink/15 px-4 py-2.5 text-center text-xs uppercase tracking-wide text-ink transition hover:border-brass"
          >
            View Product
          </a>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 rounded-sm bg-ink px-4 py-2.5 text-center text-xs uppercase tracking-wide text-ivory transition hover:bg-ink/90 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
