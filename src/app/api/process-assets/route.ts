import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fal } from "@fal-ai/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

fal.config({
  credentials: process.env.FAL_KEY,
});

interface AssetInput {
  url: string;
  index: number;
}

interface ClassifiedAsset {
  url: string;
  type: "product" | "logo" | "lifestyle" | "unknown";
  processedUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { images }: { images: AssetInput[] } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Step 1: Classify images using Claude vision
    const imageBlocks = images.slice(0, 8).map((img) => ([
      {
        type: "image" as const,
        source: { type: "url" as const, url: img.url },
      },
      {
        type: "text" as const,
        text: `Image ${img.index}: Classify as "product", "logo", "lifestyle", or "unknown".`,
      },
    ])).flat();

    const classifyResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          ...imageBlocks,
          {
            type: "text",
            text: `Classify each image above. Return ONLY a JSON array like: [{"index": 0, "type": "product"}, {"index": 1, "type": "logo"}]. Valid types: product, logo, lifestyle, unknown.`,
          },
        ],
      }],
    });

    const classifyText = classifyResponse.content[0];
    let classifications: { index: number; type: string }[] = [];

    if (classifyText.type === "text") {
      try {
        const cleaned = classifyText.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        classifications = JSON.parse(cleaned);
      } catch {
        // Default all to unknown
        classifications = images.map((_, i) => ({ index: i, type: "unknown" }));
      }
    }

    // Step 2: Remove backgrounds from product images using FAL
    const results: ClassifiedAsset[] = [];

    for (const img of images.slice(0, 8)) {
      const cls = classifications.find((c) => c.index === img.index);
      const type = (cls?.type || "unknown") as ClassifiedAsset["type"];

      let processedUrl: string | undefined;

      if (type === "product" && process.env.FAL_KEY) {
        try {
          const bgResult = await fal.subscribe("fal-ai/birefnet", {
            input: {
              image_url: img.url,
            },
          });
          const bgData = bgResult.data as { image?: { url: string } };
          if (bgData?.image?.url) {
            processedUrl = bgData.image.url;
          }
        } catch (e) {
          console.error("BG removal failed for", img.url, e);
        }
      }

      results.push({
        url: img.url,
        type,
        processedUrl,
      });
    }

    return NextResponse.json({ assets: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Asset processing failed";
    console.error("Process assets error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
