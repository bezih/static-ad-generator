// Shared types for the generate workflow

export type Step = "input" | "scraping" | "review" | "research" | "briefs" | "selecting" | "generating" | "done" | "editing";

export type BusinessType = "product" | "service" | "location" | "digital" | "personal_brand";

export interface BrandDna {
  businessType?: BusinessType;
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
  serviceDetails?: {
    serviceNames: string[];
    credentials: string[];
    serviceArea: string;
    bookingProcess: string;
  };
  advertisingStyle: {
    adTone: string;
    messagingThemes: string[];
    competitors: string[];
    uniqueAdvantage: string;
  };
}

export interface ClassifiedAsset {
  url: string;
  type: "product" | "portrait" | "facility" | "logo" | "screenshot" | "other";
  usability: number;
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
  templateId: string;
  category: string;
  headline: string;
  subhead: string;
  cta: string;
  bg_prompt: string;
  primary_asset_url: string | null;
  headline_variants: string[];
  copy_framework: string;
}

export interface GeneratedAd {
  briefId: number;
  templateId: string;
  templateName: string;
  headline: string;
  subhead: string;
  cta: string;
  category: string;
  imageUrl: string; // blob URL or data URL from rendered PNG
  bgImageUrl?: string;
  primaryAssetUrl?: string;
  format: string;
}

export interface SavedCampaign {
  brandName: string;
  date: string;
  ads: GeneratedAd[];
}

export const AGENTS: AgentState[] = [
  { id: "pain", name: "Pain Point Analyst", icon: "🔍", status: "waiting", findings: [] },
  { id: "psych", name: "Behavioral Psychologist", icon: "🧠", status: "waiting", findings: [] },
  { id: "copy", name: "Conversion Copywriter", icon: "✍️", status: "waiting", findings: [] },
  { id: "creative", name: "Creative Director", icon: "🎨", status: "waiting", findings: [] },
  { id: "market", name: "Market Intelligence", icon: "📊", status: "waiting", findings: [] },
];

export const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string; description: string }[] = [
  { value: "product", label: "Product", icon: "📦", description: "Physical goods, e-commerce" },
  { value: "service", label: "Service", icon: "🏥", description: "Clinic, law firm, agency" },
  { value: "location", label: "Location", icon: "📍", description: "Restaurant, gym, hotel" },
  { value: "digital", label: "Digital", icon: "💻", description: "SaaS, app, software" },
  { value: "personal_brand", label: "Personal Brand", icon: "👤", description: "Coach, creator, consultant" },
];
