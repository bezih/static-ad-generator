import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { brandDna, agentFindings } = await request.json();

    if (!brandDna) {
      return NextResponse.json({ error: "Brand DNA required" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are a world-class advertising copywriter. Generate 40 image generation prompts for static ad images for this brand.

BRAND DNA:
${JSON.stringify(brandDna, null, 2)}

RESEARCH FINDINGS FROM 5 AGENTS:
${JSON.stringify(agentFindings, null, 2)}

RULES:
- Each prompt must be a self-contained image generation prompt (for an AI image model)
- Include the brand's colors (hex codes), typography style, and mood in each prompt
- Each prompt should specify one clear visual composition
- Include headline text that would appear on the ad
- Use the research findings to write emotionally compelling, conversion-focused copy
- Prompts should be under 800 characters each
- NEVER include phone numbers, addresses, or URLs in prompts
- End every prompt with "Do not include any phone numbers, addresses, or URLs."
- Cover these categories: conversion/CTA (8), competitive/comparison (8), emotional/bold (8), social proof (8), differentiators (8)

TEMPLATE TYPES TO COVER:
1-4: Headline hero, offer/promotion, how-it-works, bold claim
5-8: Us vs them, negative marketing, myth buster, urgency
9-12: Problem/solution, stat/data hero, before/after, testimonial
13-16: Feature benefits, checklist, ingredient/services, lifestyle
17-20: Customer story, founder story, UGC social style, side-by-side
21-24: Free shipping/guarantee, insurance/pricing, seasonal, science-backed
25-28: Minimalist, color block, stacked text, community/local
29-32: Bundle, subscription, award/press, emotional/aspirational
33-36: FAQ/myth, scale/size, behind scenes, routine
37-40: Risk reversal, price comparison, referral, direct CTA

Return ONLY a JSON array of 40 objects with this structure:
[{"id": 1, "template_name": "snake_case_name", "prompt": "the full image generation prompt", "headline_text": "the headline copy", "category": "conversion|competitive|emotional|social-proof|differentiator"}]

Return ONLY the JSON array, no markdown.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let prompts;
    try {
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      prompts = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse prompts", raw: content.text.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ prompts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Prompt generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
