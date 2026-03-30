import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "4:5" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    // Use Flux Pro 1.1 for high-quality backgrounds
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: `${prompt}. Abstract background, no text, no people, no products, atmospheric and visually rich.`,
        num_images: 1,
        image_size: aspectRatio === "1:1" ? "square_hd"
          : aspectRatio === "9:16" ? "portrait_16_9"
          : aspectRatio === "16:9" ? "landscape_16_9"
          : "portrait_4_3",
        output_format: "png",
        safety_tolerance: 4,
      },
    });

    const data = result.data as { images?: { url: string }[] };

    if (data?.images && data.images.length > 0) {
      return NextResponse.json({ backgroundUrl: data.images[0].url });
    }

    return NextResponse.json({ error: "No background generated" }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Background generation failed";
    console.error("Background error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
