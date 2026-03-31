import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Upload each file to fal.ai storage (gives us publicly accessible URLs)
    const uploaded: { url: string; name: string; type: string }[] = [];

    for (const file of files) {
      try {
        // Convert File to a fal-compatible upload
        const url = await fal.storage.upload(file);

        // Determine asset type from filename
        const lower = file.name.toLowerCase();
        let type = "other";
        if (lower.includes("logo")) type = "logo";
        else if (lower.includes("product") || lower.includes("item") || lower.includes("package")) type = "product";
        else if (lower.includes("team") || lower.includes("staff") || lower.includes("headshot") || lower.includes("portrait") || lower.includes("doctor") || lower.includes("dr")) type = "portrait";
        else if (lower.includes("office") || lower.includes("clinic") || lower.includes("store") || lower.includes("building") || lower.includes("interior") || lower.includes("exterior")) type = "facility";
        else if (file.type.startsWith("image/")) type = "product"; // default images to product

        uploaded.push({ url, name: file.name, type });
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    return NextResponse.json({ uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
