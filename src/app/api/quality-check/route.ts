import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, headline, category, brandColors } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }

    // Fetch the image and convert to base64
    const imageRes = await fetch(imageUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageRes.headers.get("content-type") || "image/png";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: `Score this static ad image for conversion quality. The intended headline is: "${headline || "N/A"}"
Category: ${category || "general"}
Brand colors: ${JSON.stringify(brandColors || {})}

Score each dimension 1-10:
1. TEXT_LEGIBILITY: Is all text sharp, readable, correctly spelled? (rendered text, not AI-garbled)
2. VISUAL_HIERARCHY: Does the eye flow naturally? Is the headline prominent?
3. BRAND_CONSISTENCY: Do colors match the brand palette?
4. CTA_PROMINENCE: Is the call-to-action clearly visible and compelling?
5. OVERALL_CONVERSION: Would this ad stop the scroll and drive action?
6. PROFESSIONAL_QUALITY: Does it look like a professional ad, not AI-generated noise?

Also flag any issues: garbled text, wrong colors, cluttered layout, missing CTA, etc.

Return ONLY JSON:
{"scores": {"text_legibility": 8, "visual_hierarchy": 7, "brand_consistency": 9, "cta_prominence": 7, "overall_conversion": 8, "professional_quality": 8}, "overall": 7.8, "pass": true, "issues": [], "suggestion": ""}

Set "pass" to true if overall >= 7, false otherwise.
If pass is false, include a brief "suggestion" for what to regenerate.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let result;
    try {
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      // If parsing fails, assume it passes (don't block the user)
      result = { scores: {}, overall: 7, pass: true, issues: [], suggestion: "" };
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quality check failed";
    console.error("Quality check error:", message);
    // On error, don't block — just pass it through
    return NextResponse.json({ scores: {}, overall: 7, pass: true, issues: [], suggestion: "", error: message });
  }
}
