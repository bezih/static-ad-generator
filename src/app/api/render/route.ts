import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { getTemplateById, AD_FORMATS, AdFormat } from "@/lib/templates";

// Load fonts once at module level
let fontDataCache: { inter: ArrayBuffer; interBold: ArrayBuffer } | null = null;

async function loadFonts() {
  if (fontDataCache) return fontDataCache;

  const [inter, interBold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff").then((r) => r.arrayBuffer()),
  ]);

  fontDataCache = { inter, interBold };
  return fontDataCache;
}

export async function POST(request: NextRequest) {
  try {
    const {
      templateId,
      headline,
      subhead,
      cta,
      bgImageUrl,
      primaryAssetUrl,
      logoUrl,
      brandColors,
      format = "feed",
    } = await request.json();

    if (!templateId || !headline) {
      return NextResponse.json({ error: "templateId and headline required" }, { status: 400 });
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: `Unknown template: ${templateId}` }, { status: 400 });
    }

    const formatSpec = AD_FORMATS[format as AdFormat] || AD_FORMATS.feed;

    // Render the template to a React element
    const element = template.render({
      headline,
      subhead: subhead || "",
      cta: cta || "Learn More",
      bgImageUrl,
      primaryAssetUrl,
      logoUrl,
      brandColors: brandColors || {
        primary: "#2563EB",
        secondary: "#1E40AF",
        accent: "#F59E0B",
        background: "#FFFFFF",
      },
      width: formatSpec.width,
      height: formatSpec.height,
    });

    // Load fonts
    const fonts = await loadFonts();

    // Render to PNG using next/og ImageResponse (uses Satori + resvg-wasm internally)
    const imageResponse = new ImageResponse(element, {
      width: formatSpec.width,
      height: formatSpec.height,
      fonts: [
        {
          name: "Inter",
          data: fonts.inter,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fonts.interBold,
          weight: 700,
          style: "normal",
        },
      ],
    });

    // Convert ImageResponse to a standard NextResponse with proper headers
    const buffer = await imageResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${templateId}-${format}.png"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed";
    console.error("Render error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
