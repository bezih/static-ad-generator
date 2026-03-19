import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { url, brandName, product } = await request.json();

    if (!url || !brandName) {
      return NextResponse.json({ error: "URL and brand name required" }, { status: 400 });
    }

    // Fetch the website HTML
    let html = "";
    let productImages: string[] = [];
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AdForge/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      html = await res.text();

      // Extract image URLs from HTML
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*/gi;
      let match;
      const baseUrl = new URL(url).origin;
      const allImages: string[] = [];

      while ((match = imgRegex.exec(html)) !== null) {
        let imgUrl = match[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        else if (imgUrl.startsWith("/")) imgUrl = baseUrl + imgUrl;
        else if (!imgUrl.startsWith("http")) imgUrl = baseUrl + "/" + imgUrl;

        // Filter: skip tiny icons, SVGs, tracking pixels
        if (
          !imgUrl.includes("favicon") &&
          !imgUrl.includes("icon") &&
          !imgUrl.includes("logo") &&
          !imgUrl.includes("pixel") &&
          !imgUrl.includes("tracking") &&
          !imgUrl.endsWith(".svg") &&
          !imgUrl.includes("1x1") &&
          !imgUrl.includes("data:image")
        ) {
          allImages.push(imgUrl);
        }
      }

      // Also look for og:image and product-specific images
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogMatch) {
        let ogUrl = ogMatch[1];
        if (ogUrl.startsWith("/")) ogUrl = baseUrl + ogUrl;
        allImages.unshift(ogUrl);
      }

      productImages = [...new Set(allImages)].slice(0, 10);
    } catch {
      // If fetch fails, proceed without HTML
      html = "";
    }

    // Strip HTML to text for Claude analysis
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000);

    // Extract inline CSS for color analysis
    const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const cssContent = styleBlocks.join(" ").slice(0, 5000);
    const hexColors = [...new Set((cssContent + html).match(/#[0-9a-fA-F]{6}/g) || [])].slice(0, 20);

    // Use Claude to analyze the brand
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Analyze this brand and create a comprehensive brand DNA document. Be specific and detailed.

BRAND NAME: ${brandName}
WEBSITE URL: ${url}
PRODUCT/SERVICE: ${product || "Not specified — infer from website content"}
COLORS FOUND ON SITE: ${hexColors.join(", ") || "None extracted"}

WEBSITE CONTENT:
${textContent || "Could not fetch website content. Use your knowledge of the brand."}

Return a JSON object with this exact structure:
{
  "brandOverview": {
    "name": "${brandName}",
    "website": "${url}",
    "tagline": "their tagline or slogan",
    "mission": "their value proposition in 1-2 sentences",
    "targetAudience": "who they serve",
    "voiceTone": "how they communicate (e.g., bold, playful, professional)",
    "industry": "their industry/category"
  },
  "visualIdentity": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "fontStyle": "description of their typography style",
    "mood": "the overall visual feeling"
  },
  "productDetails": {
    "productName": "main product or service name",
    "category": "product category",
    "keyFeatures": ["feature 1", "feature 2", "feature 3"],
    "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
    "pricePoint": "premium/mid-range/affordable or specific price",
    "packagingDescription": "visual description of the product"
  },
  "advertisingStyle": {
    "adTone": "how their ads feel",
    "messagingThemes": ["theme 1", "theme 2", "theme 3"],
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "uniqueAdvantage": "what sets them apart from competitors"
  }
}

Return ONLY the JSON object, no markdown formatting or explanation.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    let brandDna;
    try {
      // Clean the response — remove any markdown code blocks
      const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      brandDna = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse brand DNA", raw: content.text }, { status: 500 });
    }

    return NextResponse.json({
      brandDna,
      productImages,
      hexColors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scraping failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
