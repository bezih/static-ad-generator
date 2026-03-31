import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/brands — list all saved brands (or get one by ?id=)
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const { data: brand, error } = await supabase
      .from("adforge_brands")
      .select("*, adforge_assets(*)")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ brand });
  }

  const { data: brands, error } = await supabase
    .from("adforge_brands")
    .select("id, name, website, business_type, logo_url, colors, updated_at")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brands });
}

// POST /api/brands — save or update a brand
export async function POST(request: NextRequest) {
  try {
    const { name, website, product, businessType, brandDna, logoUrl, colors, assets } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Brand name required" }, { status: 400 });
    }

    // Check if brand already exists by name
    const { data: existing } = await supabase
      .from("adforge_brands")
      .select("id")
      .eq("name", name)
      .single();

    let brandId: string;

    if (existing) {
      // Update existing brand
      brandId = existing.id;
      await supabase
        .from("adforge_brands")
        .update({
          website,
          product,
          business_type: businessType || "service",
          brand_dna: brandDna || {},
          logo_url: logoUrl,
          colors: colors || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", brandId);
    } else {
      // Create new brand
      const { data, error } = await supabase
        .from("adforge_brands")
        .insert({
          name,
          website,
          product,
          business_type: businessType || "service",
          brand_dna: brandDna || {},
          logo_url: logoUrl,
          colors: colors || {},
        })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      brandId = data.id;
    }

    // Save assets if provided
    if (assets && assets.length > 0) {
      // Delete old assets, replace with new
      await supabase.from("adforge_assets").delete().eq("brand_id", brandId);

      const assetRows = assets.map((a: { url: string; type: string; usability?: number; processedUrl?: string; source?: string }) => ({
        brand_id: brandId,
        url: a.url,
        asset_type: a.type,
        usability: a.usability || 5,
        processed_url: a.processedUrl || null,
        source: a.source || "uploaded",
      }));

      await supabase.from("adforge_assets").insert(assetRows);
    }

    return NextResponse.json({ brandId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save brand";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
