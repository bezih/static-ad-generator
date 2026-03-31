import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/campaigns — list campaigns for a brand, or get one by ?id=
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const brandId = request.nextUrl.searchParams.get("brandId");

  if (id) {
    const { data: campaign, error } = await supabase
      .from("adforge_campaigns")
      .select("*, adforge_ads(*)")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ campaign });
  }

  if (brandId) {
    const { data: campaigns, error } = await supabase
      .from("adforge_campaigns")
      .select("id, brand_id, created_at, formats, adforge_ads(count)")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaigns });
  }

  // List recent campaigns across all brands
  const { data: campaigns, error } = await supabase
    .from("adforge_campaigns")
    .select("id, brand_id, created_at, formats, adforge_brands(name, logo_url)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns });
}

// POST /api/campaigns — save a campaign with its generated ads
export async function POST(request: NextRequest) {
  try {
    const { brandId, agentFindings, userNotes, formats, ads } = await request.json();

    if (!brandId || !ads || ads.length === 0) {
      return NextResponse.json({ error: "brandId and ads required" }, { status: 400 });
    }

    // Create campaign
    const { data: campaign, error: campError } = await supabase
      .from("adforge_campaigns")
      .insert({
        brand_id: brandId,
        agent_findings: agentFindings || {},
        user_notes: userNotes || null,
        formats: formats || ["feed"],
      })
      .select("id")
      .single();

    if (campError) return NextResponse.json({ error: campError.message }, { status: 500 });

    // Save ads
    const adRows = ads.map((ad: {
      briefId?: number; templateId: string; headline: string; subhead?: string;
      cta?: string; category?: string; imageUrl?: string; bgImageUrl?: string;
      primaryAssetUrl?: string; format?: string; qualityScore?: number;
      qualityPass?: boolean; compliance?: object;
    }) => ({
      campaign_id: campaign.id,
      brief_id: ad.briefId,
      template_id: ad.templateId,
      headline: ad.headline,
      subhead: ad.subhead,
      cta: ad.cta,
      category: ad.category,
      image_url: ad.imageUrl,
      bg_image_url: ad.bgImageUrl,
      primary_asset_url: ad.primaryAssetUrl,
      format: ad.format || "feed",
      quality_score: ad.qualityScore,
      quality_pass: ad.qualityPass,
      compliance: ad.compliance || {},
    }));

    const { error: adsError } = await supabase
      .from("adforge_ads")
      .insert(adRows);

    if (adsError) return NextResponse.json({ error: adsError.message }, { status: 500 });

    return NextResponse.json({ campaignId: campaign.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
