import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { sessionId, productId, event } = await req.json();
  if (!sessionId || !productId || !["view_product", "add_to_cart"].includes(event)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // Uses the anon client — RLS permits public insert-only on this table.
  const supabase = getSupabaseClient();
  await supabase.from("conversions").insert({ session_id: sessionId, product_id: productId, event });
  return NextResponse.json({ ok: true });
}
