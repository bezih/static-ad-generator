import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "4:5", imageUrls } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY not configured" },
        { status: 500 }
      );
    }

    let result;

    if (imageUrls && imageUrls.length > 0) {
      // Edit mode — use reference product images so the AI matches the real product
      result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
        input: {
          prompt,
          image_urls: imageUrls,
          num_images: 1,
          aspect_ratio: aspectRatio,
          output_format: "png",
          safety_tolerance: "4",
        },
      });
    } else {
      // Text-to-image mode — no reference images
      result = await fal.subscribe("fal-ai/nano-banana-2", {
        input: {
          prompt,
          num_images: 1,
          aspect_ratio: aspectRatio,
          output_format: "png",
          safety_tolerance: "4",
          resolution: "1K",
        },
      });
    }

    const data = result.data as { images?: { url: string }[] };

    if (data.images && data.images.length > 0) {
      return NextResponse.json({ imageUrl: data.images[0].url });
    }

    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
