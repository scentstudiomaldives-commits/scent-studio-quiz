import { NextRequest, NextResponse } from "next/server";
import { getScorableCatalog } from "@/lib/catalog";
import { scoreSimilarProducts } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const catalog = await getScorableCatalog();
  const reference = catalog.find((p) => p.id === productId);
  if (!reference) return NextResponse.json({ error: "Reference product not found" }, { status: 404 });

  const results = scoreSimilarProducts(catalog, reference);

  const admin = getSupabaseAdmin();
  const { data: session } = await admin
    .from("quiz_sessions")
    .insert({ answers: { mode: "find_similar", referenceProductId: productId, referenceTitle: reference.title } })
    .select()
    .single();

  if (session && results.length > 0) {
    await admin.from("quiz_recommendations").insert(
      results.map((s, i) => ({ session_id: session.id, product_id: s.product.id, score: s.score, rank: i + 1 }))
    );
  }

  return NextResponse.json({
    sessionId: session?.id ?? null,
    reference: { id: reference.id, title: reference.title },
    results,
  });
}
