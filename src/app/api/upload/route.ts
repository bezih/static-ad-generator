import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to fal.ai storage
    const url = await fal.storage.upload(file);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
