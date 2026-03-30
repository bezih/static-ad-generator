import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { renderTemplate } from "@/lib/templates";
import { AD_SIZES } from "@/lib/types";
import type { CreativeBrief, BrandDna, AdSize } from "@/lib/types";

// Load fonts at module level
let fontDataRegular: ArrayBuffer | null = null;
let fontDataBold: ArrayBuffer | null = null;

async function loadFonts() {
  if (fontDataRegular && fontDataBold) return;

  const [regular, bold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-400-normal.ttf").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-800-normal.ttf").then((r) => r.arrayBuffer()),
  ]);
  fontDataRegular = regular;
  fontDataBold = bold;
}

export async function POST(request: NextRequest) {
  try {
    const {
      brief,
      brand,
      size = "1080x1350",
      backgroundUrl,
      productImageUrl,
    }: {
      brief: CreativeBrief;
      brand: BrandDna;
      size?: AdSize;
      backgroundUrl?: string;
      productImageUrl?: string;
    } = await request.json();

    if (!brief || !brand) {
      return NextResponse.json({ error: "Brief and brand required" }, { status: 400 });
    }

    await loadFonts();

    const dimensions = AD_SIZES[size] || AD_SIZES["1080x1350"];
    const { width, height } = dimensions;

    // Render the template to a React element tree
    const element = renderTemplate({
      brief,
      brand,
      width,
      height,
      backgroundUrl,
      productImageUrl,
    });

    // Convert to SVG via Satori
    const svg = await satori(element, {
      width,
      height,
      fonts: [
        { name: "DM Sans", data: fontDataRegular!, weight: 400, style: "normal" },
        { name: "DM Sans", data: fontDataBold!, weight: 800, style: "normal" },
      ],
    });

    // Convert SVG to PNG via resvg
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(pngBuffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed";
    console.error("Render error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
