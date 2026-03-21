import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { brandDna, ads, videoStyle, withAudio } = await request.json();

    if (!brandDna || !ads || !Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json({ error: "Brand DNA and ads are required" }, { status: 400 });
    }

    const styleDescriptions: Record<string, string> = {
      "product-showcase":
        "Slow, elegant camera orbit around the product. Start with a close-up detail shot, then pull back to reveal the full product. Use subtle depth-of-field shifts. The product must remain the exact same — no morphing, no shape changes, no artistic reinterpretation. Think Apple-style product reveal.",
      "lifestyle":
        "Show the product naturally in a lifestyle setting. Gentle ambient movement — light shifts, subtle background motion, a hand reaching toward the product. The product itself must stay perfectly still and unchanged. Think Instagram lifestyle reel.",
      "cinematic":
        "Dramatic, slow-motion reveal with cinematic lighting. Lens flare, volumetric light, or particle effects around (but never altering) the product. Camera pushes in slowly. The product must remain photographically identical. Think movie trailer hero shot.",
      "social-media":
        "Quick, punchy motion — zoom-in, slight bounce, or snap-cut energy. Text elements can animate on/off. Fast-paced and attention-grabbing for TikTok/Reels. Product stays exactly as shown. Think scroll-stopping social ad.",
      "unboxing":
        "Reveal animation — the product emerges from below frame, or a cover lifts away. Build anticipation with a 1-2 second tease before the full reveal. Product must match the reference image exactly once revealed. Think premium unboxing experience.",
    };

    const styleGuide = styleDescriptions[videoStyle] || styleDescriptions["product-showcase"];

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are a world-class VIDEO PROMPT ENGINEER specializing in AI video generation (Kling model). You create motion prompts that produce stunning 5-10 second product videos.

CRITICAL RULES FOR VIDEO PROMPTS:
1. The product in the source image must NEVER change shape, color, packaging, or appearance. It must remain a 1:1 match.
2. Only describe MOTION, CAMERA MOVEMENT, LIGHTING CHANGES, and ENVIRONMENT ANIMATION — never describe changing the product itself.
3. Keep prompts under 500 characters — Kling works best with concise, clear motion instructions.
4. Never mention text overlays, phone numbers, URLs, or watermarks in the prompt.
5. Focus on ONE clear motion concept per prompt — don't combine multiple complex movements.
6. Describe the motion in present tense, as if narrating what's happening in real-time.

BRAND CONTEXT:
${JSON.stringify(brandDna?.brandOverview || {}, null, 2)}

VIDEO STYLE GUIDE:
${styleGuide}

${withAudio ? `AUDIO NOTE: These videos will have audio added. Consider motions that pair well with sound — impacts, swooshes, ambient sounds.` : ""}

Generate a video motion prompt for EACH of these ads. The prompt should describe how to animate the static ad image into a compelling short video.

ADS TO ANIMATE:
${ads.map((ad: { templateName: string; headline: string }, i: number) => `${i + 1}. "${ad.templateName}" — Headline: "${ad.headline}"`).join("\n")}

Return ONLY a JSON array of objects:
[{"adIndex": 0, "videoPrompt": "the motion/animation prompt for Kling", "suggestedDuration": 5}]

- adIndex is the 0-based index matching the ads array
- suggestedDuration is either 5 or 10 (prefer 5 for cost efficiency, use 10 only for complex reveals or lifestyle scenes)

Return ONLY the JSON array, no markdown.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let videoPrompts;
    try {
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      videoPrompts = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse video prompts", raw: content.text.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ videoPrompts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Video prompt generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
