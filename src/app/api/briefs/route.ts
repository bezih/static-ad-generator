import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { TEMPLATES } from "@/lib/templates";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { brandDna, agentFindings, businessType, classifiedAssets, userNotes } = await request.json();

    if (!brandDna) {
      return NextResponse.json({ error: "Brand DNA required" }, { status: 400 });
    }

    // Filter templates to those suitable for this business type
    const bType = businessType || "service";
    const availableTemplates = TEMPLATES.filter((t) => t.categories.includes(bType));

    const templateList = availableTemplates.map((t) => `- ${t.id}: ${t.name} — ${t.description} [categories: ${t.adCategories.join(", ")}]`).join("\n");

    // Describe available assets
    const assetSummary = classifiedAssets?.length
      ? `\nAVAILABLE ASSETS:\n${classifiedAssets.map((a: { url: string; type: string; usability: number }) =>
          `- ${a.type} (usability: ${a.usability}/10): ${a.url}`
        ).join("\n")}`
      : "\nNo brand images available — all templates will use AI-generated backgrounds.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are a world-class advertising creative director. Generate structured creative briefs for static ad images.

BRAND DNA:
${JSON.stringify(brandDna, null, 2)}

BUSINESS TYPE: ${bType}

RESEARCH FINDINGS:
${JSON.stringify(agentFindings, null, 2)}

${userNotes ? `USER NOTES: ${userNotes}` : ""}
${assetSummary}

AVAILABLE TEMPLATES:
${templateList}

RULES:
1. Generate 20-25 creative briefs, each mapped to a specific template ID from the list above.
2. Use a variety of templates — don't repeat the same template more than 3 times.
3. Each brief must include conversion-focused copy using proven frameworks (PAS, AIDA, social proof, urgency, comparison).
4. Headlines should be 3-8 words, punchy, and specific to this brand.
5. Subheads should be 10-20 words, expanding on the headline.
6. CTAs should be 2-4 words, action-oriented.
7. For templates that need backgrounds, write a bg_prompt — a scene description for an AI image generator (NO text/words in the scene, just environment/mood).
8. Use brand colors from the visual identity.
9. Match the ad tone to the brand voice.
10. Generate 3 headline_variants per brief for A/B testing.
11. For the "three-step" template, format the subhead as "Step 1 text | Step 2 text | Step 3 text".
12. For the "social-proof-wall" template, format the subhead as "Review 1 | Review 2 | Review 3".
13. For the "feature-grid" template, format the subhead as "Feature 1 | Feature 2 | Feature 3 | Feature 4".
14. For "split-compare", format the headline as "Bad thing vs Good thing".
15. For "problem-solution", format the headline as "Problem → Solution".
16. If portrait/staff assets are available, assign them to trust-authority templates.
17. If facility assets are available, assign them to facility-showcase templates.
18. If product assets are available, assign them to product-spotlight templates.

Return ONLY a JSON array:
[{
  "id": 1,
  "templateId": "hero-headline",
  "category": "conversion",
  "headline": "Your Smile Deserves Better",
  "subhead": "Same-day appointments, gentle care, and a team that actually listens.",
  "cta": "Book Now",
  "bg_prompt": "Warm, modern dental office with soft natural light, clean white surfaces, green plants, inviting atmosphere",
  "primary_asset_url": null,
  "headline_variants": ["Transform Your Smile Today", "Dental Care, Reimagined", "Your Smile Deserves Better"],
  "copy_framework": "PAS"
}]

Return ONLY the JSON array, no markdown.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let briefs;
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
