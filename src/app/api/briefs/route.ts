import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CreativeBrief } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { brandDna, agentFindings, hasProductImages } = await request.json();

    if (!brandDna) {
      return NextResponse.json({ error: "Brand DNA required" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are a world-class creative director. Generate 20 structured creative briefs for static ad images.

BRAND DNA:
${JSON.stringify(brandDna, null, 2)}

RESEARCH FINDINGS:
${JSON.stringify(agentFindings, null, 2)}

${hasProductImages ? "IMPORTANT: Product images are available and will be composited onto the ad. The background_prompt should complement (not replicate) the product." : "No product images available. The background_prompt should be atmospheric and evocative."}

For each brief, provide:
- id: sequential number (1-20)
- template_name: descriptive snake_case name
- category: one of "conversion", "competitive", "emotional", "social-proof", "differentiator"
- headline: punchy headline text (max 8 words)
- subheadline: supporting text (max 15 words)
- cta: call-to-action button text (max 4 words)
- layout: one of "hero-center", "split-left", "split-right", "stacked", "minimal", "bold-text", "comparison", "testimonial"
- mood: visual mood description (e.g., "warm and inviting", "bold and energetic")
- background_prompt: a prompt for AI image generation to create the background (atmospheric, no text/people/products, max 100 words)

CATEGORY DISTRIBUTION:
- conversion: 4 briefs (CTAs, offers, urgency)
- competitive: 4 briefs (us vs them, switching, comparison)
- emotional: 4 briefs (pain points, aspirations, storytelling)
- social-proof: 4 briefs (testimonials, stats, trust)
- differentiator: 4 briefs (unique features, benefits, brand story)

LAYOUT DISTRIBUTION: Use variety. Don't repeat the same layout more than 3 times.

Use the brand's actual colors in color_override when the brand has strong colors:
- color_override: { primary, secondary, accent, text, bg } (hex codes, all optional)

Make headlines EMOTIONALLY compelling and conversion-focused. Use research findings to inform the messaging.

Return ONLY a JSON array of 20 CreativeBrief objects. No markdown wrapping.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let briefs: CreativeBrief[];
    try {
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      briefs = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse briefs", raw: content.text.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ briefs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Brief generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
