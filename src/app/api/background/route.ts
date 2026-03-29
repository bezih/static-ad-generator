import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "4:5" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    // Use Flux Pro for higher quality backgrounds
    // Append instructions to keep it clean (no text, no products)
    const cleanPrompt = `${prompt}. No text, no words, no letters, no watermarks, no logos. Clean background image only.`;

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: cleanPrompt,
        num_images: 1,
        image_size: aspectRatio === "4:5"
          ? { width: 1080, height: 1350 }
          : aspectRatio === "9:16"
          ? { width: 1080, height: 1920 }
          : aspectRatio === "1:1"
          ? { width: 1080, height: 1080 }
          : { width: 1200, height: 628 },
        output_format: "png",
        safety_tolerance: 4,
      },
    });

    const data = result.data as { images?: { url: string }[] };

    if (data?.images && data.images.length > 0) {
      return NextResponse.json({ imageUrl: data.images[0].url });
    }

    return NextResponse.json({ error: "No background generated" }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Background generation failed";
    console.error("Background error:", message);

    // Fallback to nano-banana-2 if flux-pro isn't available
    try {
      const { prompt, aspectRatio = "4:5" } = await request.json();
      const cleanPrompt = `${prompt}. No text, no words, no letters. Clean background only.`;

      const result = await fal.subscribe("fal-ai/nano-banana-2", {
        input: {
          prompt: cleanPrompt,
          num_images: 1,
          aspect_ratio: aspectRatio,
          output_format: "png",
          safety_tolerance: "4",
          resolution: "1K",
        },
      });

      const data = result.data as { images?: { url: string }[] };
      if (data?.images && data.images.length > 0) {
        return NextResponse.json({ imageUrl: data.images[0].url });
      }
    } catch {
      // Both models failed
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
