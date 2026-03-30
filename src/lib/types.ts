// ── Shared Types ──

export interface BrandDna {
  brandOverview: {
    name: string;
    website: string;
    tagline: string;
    mission: string;
    targetAudience: string;
    voiceTone: string;
    industry: string;
  };
  visualIdentity: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontStyle: string;
    mood: string;
  };
  productDetails: {
    productName: string;
    category: string;
    keyFeatures: string[];
    keyBenefits: string[];
    pricePoint: string;
    packagingDescription: string;
  };
  advertisingStyle: {
    adTone: string;
    messagingThemes: string[];
    competitors: string[];
    uniqueAdvantage: string;
  };
  businessType?: "product" | "service" | "hybrid";
}

export interface AgentState {
  id: string;
  name: string;
  icon: string;
  status: "waiting" | "running" | "done" | "error";
  findings: string[];
}

export interface CreativeBrief {
  id: number;
  template_name: string;
  category: "conversion" | "competitive" | "emotional" | "social-proof" | "differentiator";
  headline: string;
  subheadline: string;
  cta: string;
  layout: "hero-center" | "split-left" | "split-right" | "stacked" | "minimal" | "bold-text" | "comparison" | "testimonial";
  mood: string;
  background_prompt: string;
  color_override?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
    bg?: string;
  };
}

export interface GeneratedAd {
  id: number;
  briefId: number;
  templateName: string;
  headline: string;
  subheadline: string;
  cta: string;
  category: string;
  imageUrl: string;       // final composited image
  backgroundUrl?: string; // AI-generated background
  layout: string;
}

export interface ProcessedAsset {
  originalUrl: string;
  processedUrl?: string;  // bg-removed version
  type: "product" | "logo" | "lifestyle" | "unknown";
  width?: number;
  height?: number;
}

export interface Campaign {
  id: string;
  brandName: string;
  date: string;
  brandDna: BrandDna;
  briefs: CreativeBrief[];
  ads: GeneratedAd[];
  assets: ProcessedAsset[];
}

// ── Ad Dimensions ──

export const AD_SIZES = {
  "1080x1080": { width: 1080, height: 1080, label: "Square (1:1)" },
  "1080x1350": { width: 1080, height: 1350, label: "Portrait (4:5)" },
  "1080x1920": { width: 1080, height: 1920, label: "Story (9:16)" },
  "1200x628": { width: 1200, height: 628, label: "Landscape (1.91:1)" },
} as const;

export type AdSize = keyof typeof AD_SIZES;
