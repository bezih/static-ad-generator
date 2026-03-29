import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import Anthropic from "@anthropic-ai/sdk";

fal.config({ credentials: process.env.FAL_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ClassifiedAsset {
  url: string;
  type: "product" | "portrait" | "facility" | "logo" | "screenshot" | "other";
  usability: number; // 1-10
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, brandName, businessType } = await request.json();

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ assets: [], processedAssets: {} });
    }

    // Step 1: Classify images using Claude Vision
    const classifiable = imageUrls.slice(0, 12); // limit to 12 images

    const classificationPrompt = `Classify each of these images from the website "${brandName}" (business type: ${businessType || "unknown"}).

For each image URL, return its classification and a usability score (1-10) for use in advertising.

Image URLs:
${classifiable.map((url: string, i: number) => `${i + 1}. ${url}`).join("\n")}

Classifications:
- "product": Physical product, packaging, merchandise
- "portrait": Person, headshot, team photo, staff member
- "facility": Building interior/exterior, office, store, clinic space
- "logo": Company logo, brand mark
- "screenshot": App screenshot, website screenshot, UI mockup
- "other": Decorative, stock, icons, or unusable

Usability scoring (1-10):
- 10: Perfect high-res hero image, ideal for ads
- 7-9: Good quality, usable with some processing
- 4-6: Mediocre quality but acceptable
- 1-3: Low quality, too small, or wrong format

Return ONLY a JSON array:
[{"url": "...", "type": "product|portrait|facility|logo|screenshot|other", "usability": 8}]`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: classificationPrompt }],
    });

    const content = message.content[0];
    let assets: ClassifiedAsset[] = [];

    if (content.type === "text") {
      try {
        const cleaned = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        assets = JSON.parse(cleaned);
      } catch {
        // Fallback: simple heuristic classification
        assets = classifiable.map((url: string) => {
          const lower = url.toLowerCase();
          let type: ClassifiedAsset["type"] = "other";
          if (lower.includes("logo") || lower.includes("brand")) type = "logo";
          else if (lower.includes("team") || lower.includes("staff") || lower.includes("doctor") || lower.includes("portrait")) type = "portrait";
          else if (lower.includes("office") || lower.includes("clinic") || lower.includes("store") || lower.includes("building")) type = "facility";
          else if (lower.includes("product") || lower.includes("item") || lower.includes("shop")) type = "product";
          else if (lower.includes("screenshot") || lower.includes("app")) type = "screenshot";
          return { url, type, usability: 5 };
        });
      }
    }

    // Step 2: Process top assets — background removal for products and portraits
    const processedAssets: Record<string, string> = {};
    const toProcess = assets
      .filter((a) => (a.type === "product" || a.type === "portrait") && a.usability >= 5)
      .slice(0, 5);

    if (process.env.FAL_KEY && toProcess.length > 0) {
      const bgRemovalResults = await Promise.allSettled(
        toProcess.map(async (asset) => {
          try {
            const result = await fal.subscribe("fal-ai/birefnet/v2", {
              input: {
                image_url: asset.url,
                operating_resolution: "1024x1024",
                output_format: "png",
              },
            });
            const data = result.data as { image?: { url: string } };
            if (data?.image?.url) {
              return { originalUrl: asset.url, processedUrl: data.image.url };
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      for (const result of bgRemovalResults) {
        if (result.status === "fulfilled" && result.value) {
          processedAssets[result.value.originalUrl] = result.value.processedUrl;
        }
      }
    }

    return NextResponse.json({
      assets,
      processedAssets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Asset processing failed";
    console.error("Asset processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
