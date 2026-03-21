import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, duration = "5", aspectRatio = "9:16" } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: "Image URL and prompt are required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    // Use Kling v2 master image-to-video for best quality with product fidelity
    const result = await fal.subscribe("fal-ai/kling-video/v2/master/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt,
        duration: duration,
        aspect_ratio: aspectRatio,
      },
    });

    const data = result.data as { video?: { url: string } };

    if (data?.video?.url) {
      return NextResponse.json({ videoUrl: data.video.url });
    }

    return NextResponse.json({ error: "No video generated" }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video generation failed";
    console.error("Video generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
