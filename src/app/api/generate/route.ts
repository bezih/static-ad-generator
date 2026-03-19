import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

async function generateTextToImage(prompt: string, aspectRatio: string) {
  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: {
      prompt,
      num_images: 1,
      aspect_ratio: aspectRatio,
      output_format: "png",
      safety_tolerance: "4",
      resolution: "1K",
    },
  });
  return result.data as { images?: { url: string }[] };
}

async function generateWithReference(prompt: string, imageUrls: string[], aspectRatio: string) {
  const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
    input: {
      prompt,
      image_urls: imageUrls,
      num_images: 1,
      aspect_ratio: aspectRatio,
      output_format: "png",
      safety_tolerance: "4",
    },
  });
  return result.data as { images?: { url: string }[] };
}

// Check if an image URL is likely accessible and in a supported format
function isValidImageUrl(url: string): boolean {
  if (!url.startsWith("http")) return false;
  // Skip formats FAL can't handle
  const badExtensions = [".avif", ".webp", ".svg", ".gif", ".bmp", ".ico"];
  const lower = url.toLowerCase();
  if (badExtensions.some((ext) => lower.includes(ext))) return false;
  // Skip data URIs and tracking
  if (url.includes("data:image") || url.includes("pixel") || url.includes("tracking")) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "4:5", imageUrls } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    let data: { images?: { url: string }[] } | undefined;

    // Try edit mode with reference images first, fall back to text-to-image
    const validImages = (imageUrls || []).filter(isValidImageUrl);

    if (validImages.length > 0) {
      try {
        data = await generateWithReference(prompt, validImages.slice(0, 3), aspectRatio);
      } catch {
        // Edit mode failed (bad image URLs, format issues, etc.) — fall back
        console.log("Edit mode failed, falling back to text-to-image");
        data = await generateTextToImage(prompt, aspectRatio);
      }
    } else {
      data = await generateTextToImage(prompt, aspectRatio);
    }

    if (data?.images && data.images.length > 0) {
      return NextResponse.json({ imageUrl: data.images[0].url });
    }

    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
