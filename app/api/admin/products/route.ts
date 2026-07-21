import { NextRequest, NextResponse } from "next/server";
import { getScorableCatalog } from "@/lib/catalog";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getScorableCatalog();
  return NextResponse.json({ products: catalog });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("fragrance_attributes")
    .upsert({ ...body, updated_at: new Date().toISOString() }, { onConflict: "product_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
