import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const agentPrompts: Record<string, (brand: string) => string> = {
  pain: (brand) => `You are a consumer insights researcher. Based on this brand context, identify the top 6 pain points that customers of competitors in this industry experience. Search your knowledge of Reddit discussions, review sites, and consumer forums.

BRAND CONTEXT:
${brand}

For each pain point:
- What is the emotional frustration?
- What specific trigger causes it?
- How frequently do consumers complain about this?

Return ONLY a JSON array of 6 strings, each being a specific finding (30 words max each). Start with the most emotionally charged. Format: ["finding 1", "finding 2", ...]`,

  psych: (brand) => `You are a behavioral psychologist studying consumer switching behavior. Based on this brand context, identify what triggers people to switch from competitors to a brand like this, what barriers prevent switching, and what messaging hooks would convert them.

BRAND CONTEXT:
${brand}

Return ONLY a JSON array of 6 strings covering: final straw triggers, switching barriers, and conversion hooks. Format: ["finding 1", "finding 2", ...]`,

  copy: (brand) => `You are a direct response copywriter and conversion optimization expert. Based on this brand context, identify the most effective copywriting strategies for advertising this type of product/service.

BRAND CONTEXT:
${brand}

Return ONLY a JSON array of 6 strings covering: headline formulas, emotional triggers, CTA best practices, and conversion principles specific to this industry. Format: ["finding 1", "finding 2", ...]`,

  creative: (brand) => `You are a creative director reviewing an ad campaign. Based on this brand context, identify the strongest visual and messaging approaches for static image ads.

BRAND CONTEXT:
${brand}

Return ONLY a JSON array of 6 strings covering: which ad formats work best, what visual styles to use, what to avoid, and what will stop the scroll. Format: ["finding 1", "finding 2", ...]`,

  market: (brand) => `You are a market intelligence analyst. Based on this brand context, identify key market dynamics, competitive advantages, demographic insights, and positioning opportunities.

BRAND CONTEXT:
${brand}

Return ONLY a JSON array of 6 strings covering: market trends, competitor weaknesses, audience demographics, and untapped positioning angles. Format: ["finding 1", "finding 2", ...]`,
};

export async function POST(request: NextRequest) {
  try {
    const { agentType, brandDna } = await request.json();

    if (!agentType || !brandDna) {
      return NextResponse.json({ error: "Agent type and brand DNA required" }, { status: 400 });
    }

    const promptFn = agentPrompts[agentType];
    if (!promptFn) {
      return NextResponse.json({ error: `Unknown agent type: ${agentType}` }, { status: 400 });
    }

    const brandContext = JSON.stringify(brandDna, null, 2);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        { role: "user", content: promptFn(brandContext) },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let findings: string[];
    try {
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      findings = JSON.parse(cleaned);
    } catch {
      // Fallback: try to extract quoted strings
      const matches = content.text.match(/"([^"]+)"/g);
      findings = matches ? matches.map((m) => m.replace(/"/g, "")).slice(0, 6) : [content.text];
    }

    return NextResponse.json({ findings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
