import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Business-type-aware language mapping
const terminology: Record<string, { customer: string; action: string; offering: string; place: string }> = {
  product: { customer: "customers", action: "buy", offering: "product", place: "store" },
  service: { customer: "patients/clients", action: "book", offering: "service", place: "practice/office" },
  location: { customer: "guests/visitors", action: "visit", offering: "experience", place: "location" },
  digital: { customer: "users", action: "sign up", offering: "platform", place: "app" },
  personal_brand: { customer: "followers/clients", action: "engage", offering: "expertise", place: "brand" },
};

function getTerms(businessType: string) {
  return terminology[businessType] || terminology.service;
}

const agentPrompts: Record<string, (brand: string, businessType: string) => string> = {
  pain: (brand, businessType) => {
    const t = getTerms(businessType);
    return `You are a consumer insights researcher specializing in ${businessType} businesses. Based on this brand context, identify the top 6 pain points that ${t.customer} of competitors in this industry experience. Think about what frustrates ${t.customer} when they ${t.action} from competitors.

BRAND CONTEXT:
${brand}

BUSINESS TYPE: ${businessType}

For each pain point:
- What is the emotional frustration specific to ${t.customer}?
- What specific trigger causes them to look for alternatives?
- How frequently do ${t.customer} complain about this?

Return ONLY a JSON array of 6 strings, each being a specific finding (30 words max each). Start with the most emotionally charged. Format: ["finding 1", "finding 2", ...]`;
  },

  psych: (brand, businessType) => {
    const t = getTerms(businessType);
    return `You are a behavioral psychologist studying ${t.customer} switching behavior in the ${businessType} industry. Based on this brand context, identify what triggers ${t.customer} to switch from competitors, what barriers prevent switching, and what messaging hooks would convert them.

BRAND CONTEXT:
${brand}

BUSINESS TYPE: ${businessType}

Consider:
- What's the "final straw" that makes ${t.customer} leave their current ${t.offering} provider?
- What makes ${t.customer} hesitant to ${t.action} with a new ${t.place}?
- What emotional triggers overcome that hesitation?

Return ONLY a JSON array of 6 strings covering: final straw triggers, switching barriers, and conversion hooks. Format: ["finding 1", "finding 2", ...]`;
  },

  copy: (brand, businessType) => {
    const t = getTerms(businessType);
    return `You are a direct response copywriter specializing in ${businessType} advertising. Based on this brand context, identify the most effective copywriting strategies for converting ${t.customer}.

BRAND CONTEXT:
${brand}

BUSINESS TYPE: ${businessType}

Focus on:
- Headlines that make ${t.customer} stop scrolling
- CTAs that drive ${t.customer} to ${t.action} immediately
- Emotional triggers specific to ${businessType} ${t.customer}
- Social proof frameworks that work for ${t.offering} businesses

Return ONLY a JSON array of 6 strings covering: headline formulas, emotional triggers, CTA best practices, and conversion principles specific to this industry. Format: ["finding 1", "finding 2", ...]`;
  },

  creative: (brand, businessType) => {
    const t = getTerms(businessType);
    return `You are a creative director specializing in ${businessType} advertising. Based on this brand context, identify the strongest visual and messaging approaches for static image ads targeting ${t.customer}.

BRAND CONTEXT:
${brand}

BUSINESS TYPE: ${businessType}

Consider:
- What visual styles build trust with ${t.customer}?
- What ad formats perform best for ${t.offering} businesses?
- What imagery makes ${t.customer} want to ${t.action}?
- What common ${businessType} ad mistakes to avoid?

Return ONLY a JSON array of 6 strings covering: which ad formats work best, what visual styles to use, what to avoid, and what will stop the scroll. Format: ["finding 1", "finding 2", ...]`;
  },

  market: (brand, businessType) => {
    const t = getTerms(businessType);
    return `You are a market intelligence analyst specializing in the ${businessType} sector. Based on this brand context, identify key market dynamics, competitive advantages, demographic insights, and positioning opportunities.

BRAND CONTEXT:
${brand}

BUSINESS TYPE: ${businessType}

Focus on:
- How ${t.customer} discover and evaluate ${t.offering} providers
- What ${t.customer} demographics are most valuable and underserved
- What competitors miss that this brand could own
- Market trends affecting how ${t.customer} ${t.action}

Return ONLY a JSON array of 6 strings covering: market trends, competitor weaknesses, ${t.customer} demographics, and untapped positioning angles. Format: ["finding 1", "finding 2", ...]`;
  },
};

export async function POST(request: NextRequest) {
  try {
    const { agentType, brandDna, businessType } = await request.json();

    if (!agentType || !brandDna) {
      return NextResponse.json({ error: "Agent type and brand DNA required" }, { status: 400 });
    }

    const promptFn = agentPrompts[agentType];
    if (!promptFn) {
      return NextResponse.json({ error: `Unknown agent type: ${agentType}` }, { status: 400 });
    }

    const brandContext = JSON.stringify(brandDna, null, 2);
    const bType = businessType || brandDna.businessType || "service";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        { role: "user", content: promptFn(brandContext, bType) },
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
      const matches = content.text.match(/"([^"]+)"/g);
      findings = matches ? matches.map((m) => m.replace(/"/g, "")).slice(0, 6) : [content.text];
    }

    return NextResponse.json({ findings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
