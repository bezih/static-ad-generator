// Ad template definitions — each template is a Satori-compatible JSX function
// Satori supports: flexbox, basic CSS, custom fonts (no grid, no pseudo-elements)

import React from "react";

export interface TemplateProps {
  headline: string;
  subhead: string;
  cta: string;
  bgImageUrl?: string;
  primaryAssetUrl?: string; // product cutout, portrait, facility photo
  logoUrl?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  width: number;
  height: number;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  categories: string[]; // which business types this works for
  adCategories: string[]; // conversion, trust, social-proof, competitive, differentiator
  render: (props: TemplateProps) => React.ReactElement;
}

// Helper: overlay for text readability on images
function Overlay({ opacity = 0.55 }: { opacity?: number }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, rgba(0,0,0,${opacity * 0.3}) 0%, rgba(0,0,0,${opacity}) 100%)`,
      }}
    />
  );
}

// Helper: CTA button
// Helper: brand logo badge — shown in corner or footer of templates
function LogoBadge({ logoUrl, position = "top-right" }: { logoUrl?: string; position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  if (!logoUrl) return null;
  const posStyle: Record<string, string | number> = {
    position: "absolute",
    display: "flex",
    zIndex: 10,
  };
  if (position.includes("top")) posStyle.top = "40px";
  if (position.includes("bottom")) posStyle.bottom = "40px";
  if (position.includes("left")) posStyle.left = "40px";
  if (position.includes("right")) posStyle.right = "40px";

  return (
    <div style={posStyle}>
      <img src={logoUrl} style={{ height: "60px", objectFit: "contain", borderRadius: "8px" }} />
    </div>
  );
}

function CTAButton({
  text,
  color,
  textColor = "#FFFFFF",
  size = "normal",
}: {
  text: string;
  color: string;
  textColor?: string;
  size?: "normal" | "large";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size === "large" ? "32px 80px" : "28px 64px",
        backgroundColor: color,
        borderRadius: "16px",
        color: textColor,
        fontSize: size === "large" ? "36px" : "30px",
        fontWeight: 700,
        letterSpacing: "1px",
      }}
    >
      {text}
    </div>
  );
}

// Helper: brand footer strip
function BrandFooter({ color, text }: { color: string; text?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 0",
        backgroundColor: color,
        width: "100%",
      }}
    >
      {text && (
        <span style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const }}>
          {text}
        </span>
      )}
    </div>
  );
}

// ============================================================
// TEMPLATE 1: Hero Headline
// Full-bleed background + large headline overlay + CTA
// ============================================================
const heroHeadline: TemplateDefinition = {
  id: "hero-headline",
  name: "Hero Headline",
  description: "Full-bleed background with bold headline and CTA overlay",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: props.brandColors.background }}>
      {props.bgImageUrl && (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Overlay opacity={0.6} />
      <LogoBadge logoUrl={props.logoUrl} position="top-right" />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "72px", position: "relative", flex: 1, gap: "24px" }}>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1, maxWidth: "90%" }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "32px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4, maxWidth: "85%" }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "8px" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 2: Bold Statement
// Single powerful line, minimal design
// ============================================================
const boldStatement: TemplateDefinition = {
  id: "bold-statement",
  name: "Bold Statement",
  description: "Single powerful sentence on a clean background",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["emotional", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.primary, padding: "72px", textAlign: "center" as const, gap: "32px" }}>
      <div style={{ display: "flex", fontSize: "74px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, textAlign: "center" as const, maxWidth: "90%" }}>
        {props.headline}
      </div>
      <div style={{ display: "flex", width: "100px", height: "5px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
      <div style={{ display: "flex", fontSize: "32px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
        {props.subhead}
      </div>
      <div style={{ display: "flex", marginTop: "12px" }}>
        <CTAButton text={props.cta} color="#FFFFFF" textColor={props.brandColors.primary} />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 3: Stat Callout
// Large number + context text
// ============================================================
const statCallout: TemplateDefinition = {
  id: "stat-callout",
  name: "Stat Callout",
  description: "Oversized statistic number with supporting context",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => {
    // Extract number from headline (e.g. "500+ Patients Served" -> "500+")
    const match = props.headline.match(/[\d,]+[+%]?/);
    const stat = match ? match[0] : props.headline.split(" ")[0];
    const rest = match ? props.headline.replace(stat, "").trim() : props.headline.split(" ").slice(1).join(" ");

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "20px" }}>
        <div style={{ display: "flex", fontSize: "160px", fontWeight: 900, color: props.brandColors.primary, lineHeight: 1 }}>
          {stat}
        </div>
        <div style={{ display: "flex", fontSize: "42px", fontWeight: 700, color: props.brandColors.primary, opacity: 0.8, textAlign: "center" as const }}>
          {rest}
        </div>
        <div style={{ display: "flex", width: "100px", height: "5px", backgroundColor: props.brandColors.accent, borderRadius: "2px", margin: "12px 0" }} />
        <div style={{ display: "flex", fontSize: "28px", color: "#666666", lineHeight: 1.5, textAlign: "center" as const, maxWidth: "80%" }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "16px" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 4: Split Compare
// Left/right panels — before/after, us vs them
// ============================================================
const splitCompare: TemplateDefinition = {
  id: "split-compare",
  name: "Split Compare",
  description: "Side-by-side comparison panels (before/after, us vs them)",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["competitive", "conversion"],
  render: (props) => {
    const parts = props.headline.split(/\bvs\.?\b|\bor\b|→|➜/i);
    const left = parts[0]?.trim() || "Before";
    const right = parts[1]?.trim() || "After";

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background }}>
        <div style={{ display: "flex", flex: 1 }}>
          {/* Left - "bad" side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#2A2A2A", padding: "44px", gap: "20px" }}>
            <div style={{ display: "flex", fontSize: "64px" }}>😤</div>
            <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, color: "#FF6B6B", textAlign: "center" as const }}>
              {left}
            </div>
          </div>
          {/* Right - "good" side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, padding: "44px", gap: "20px" }}>
            <div style={{ display: "flex", fontSize: "64px" }}>😊</div>
            <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", textAlign: "center" as const }}>
              {right}
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 40px", backgroundColor: props.brandColors.background, gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "28px", color: "#666666", textAlign: "center" as const }}>
            {props.subhead}
          </div>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 5: Testimonial Card
// Quote + name/attribution + star rating
// ============================================================
const testimonialCard: TemplateDefinition = {
  id: "testimonial-card",
  name: "Testimonial Card",
  description: "Customer quote with star rating and attribution",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden" }}>
      {props.bgImageUrl && (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Overlay opacity={0.7} />
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px", position: "relative", flex: 1, gap: "32px" }}>
        {/* Stars */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", fontSize: "42px", color: "#FFD700" }}>★</div>
          ))}
        </div>
        {/* Quote */}
        <div style={{ display: "flex", fontSize: "44px", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.4, textAlign: "center" as const, fontStyle: "italic" }}>
          &ldquo;{props.headline}&rdquo;
        </div>
        {/* Attribution */}
        <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.7)", letterSpacing: "1px" }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "8px" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 6: Problem Solution
// Pain point struck through → benefit highlighted
// ============================================================
const problemSolution: TemplateDefinition = {
  id: "problem-solution",
  name: "Problem → Solution",
  description: "Strike through the pain point, highlight the solution",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion", "competitive"],
  render: (props) => {
    const parts = props.headline.split(/→|➜|→|not|instead of/i);
    const problem = parts[0]?.trim() || props.headline;
    const solution = parts[1]?.trim() || props.subhead;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "32px" }}>
        {/* Problem - struck through */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", fontSize: "24px", color: "#999", letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: 600 }}>THE PROBLEM</div>
          <div style={{ display: "flex", position: "relative" }}>
            <div style={{ display: "flex", fontSize: "48px", fontWeight: 700, color: "#CC4444", textDecoration: "line-through", opacity: 0.6 }}>
              {problem}
            </div>
          </div>
        </div>
        {/* Arrow */}
        <div style={{ display: "flex", fontSize: "48px", color: props.brandColors.primary }}>↓</div>
        {/* Solution */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", fontSize: "24px", color: props.brandColors.primary, letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: 600 }}>THE SOLUTION</div>
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const }}>
            {solution}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "#666", textAlign: "center" as const, maxWidth: "80%" }}>
          {props.subhead}
        </div>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 7: Three Step
// Numbered process flow (how it works)
// ============================================================
const threeStep: TemplateDefinition = {
  id: "three-step",
  name: "Three Step Process",
  description: "How it works — numbered 3-step visual flow",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => {
    // Try to split subhead into 3 steps
    const steps = props.subhead.split(/[|;,]|\d\.\s/).filter(Boolean).slice(0, 3);
    const stepTexts = steps.length === 3 ? steps : ["Step one description", "Step two description", "Step three description"];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", fontSize: "24px", color: props.brandColors.primary, letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: 700 }}>HOW IT WORKS</div>
          <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, color: props.brandColors.primary, lineHeight: 1.15 }}>
            {props.headline}
          </div>
        </div>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "32px" }}>
          {stepTexts.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", borderRadius: "50%", backgroundColor: props.brandColors.primary, color: "#FFFFFF", fontSize: "34px", fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ display: "flex", fontSize: "28px", color: "#444444", lineHeight: 1.4, flex: 1 }}>
                {step.trim()}
              </div>
            </div>
          ))}
        </div>
        {/* CTA */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 8: Trust Authority
// Staff portrait + credentials (service businesses)
// ============================================================
const trustAuthority: TemplateDefinition = {
  id: "trust-authority",
  name: "Trust & Authority",
  description: "Staff portrait with credentials and trust signals",
  categories: ["service", "personal_brand", "location"],
  adCategories: ["trust", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background }}>
      {/* Portrait area */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#E8E4DF" }}>
        {props.primaryAssetUrl ? (
          <img src={props.primaryAssetUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : props.bgImageUrl ? (
          <img src={props.bgImageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: "80px" }}>👨‍⚕️</div>
        )}
        <Overlay opacity={0.3} />
      </div>
      {/* Info panel */}
      <div style={{ display: "flex", flexDirection: "column", padding: "32px 40px", backgroundColor: props.brandColors.primary, gap: "20px" }}>
        <div style={{ display: "flex", fontSize: "42px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "8px" }}>
          <CTAButton text={props.cta} color="#FFFFFF" textColor={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 9: Facility Showcase
// Location photo with key differentiators overlay
// ============================================================
const facilityShowcase: TemplateDefinition = {
  id: "facility-showcase",
  name: "Facility Showcase",
  description: "Location/facility photo with feature overlay",
  categories: ["service", "location"],
  adCategories: ["trust", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden" }}>
      {(props.primaryAssetUrl || props.bgImageUrl) && (
        <img src={props.primaryAssetUrl || props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Overlay opacity={0.65} />
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "flex-end", padding: "72px" }}>
        {/* Badge */}
        <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 20px", backgroundColor: props.brandColors.primary, borderRadius: "24px", marginBottom: "16px" }}>
          <span style={{ fontSize: "22px", color: "#FFFFFF", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const }}>Welcome</span>
        </div>
        <div style={{ display: "flex", fontSize: "60px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, marginBottom: "12px" }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5, maxWidth: "85%", marginBottom: "20px" }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 10: Product Spotlight
// Product cutout center with features around it
// ============================================================
const productSpotlight: TemplateDefinition = {
  id: "product-spotlight",
  name: "Product Spotlight",
  description: "Product image centered with key features around it",
  categories: ["product"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "28px" }}>
      {/* Headline */}
      <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
        {props.headline}
      </div>
      {/* Product Image */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "20px" }}>
        {props.primaryAssetUrl ? (
          <img src={props.primaryAssetUrl} style={{ maxWidth: "280px", maxHeight: "280px", objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", width: "200px", height: "200px", borderRadius: "24px", backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center", fontSize: "60px" }}>📦</div>
        )}
      </div>
      {/* Subhead */}
      <div style={{ display: "flex", fontSize: "28px", color: "#666", textAlign: "center" as const, lineHeight: 1.5, maxWidth: "85%" }}>
        {props.subhead}
      </div>
      <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
    </div>
  ),
};

// ============================================================
// TEMPLATE 11: UGC Style
// Casual social post format
// ============================================================
const ugcStyle: TemplateDefinition = {
  id: "ugc-style",
  name: "UGC Style",
  description: "Casual user-generated content social post aesthetic",
  categories: ["product", "service", "location", "personal_brand"],
  adCategories: ["social-proof", "emotional"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden" }}>
      {props.bgImageUrl && (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Overlay opacity={0.5} />
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, padding: "40px" }}>
        {/* Fake story-style top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "auto" }}>
          <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: props.brandColors.primary, alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#FFF", fontSize: "24px", fontWeight: 700 }}>✓</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFF", fontSize: "22px", fontWeight: 700 }}>Verified Review</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>Real Customer</span>
          </div>
        </div>
        {/* Content at bottom */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "42px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>
            {props.headline}
          </div>
          <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
            {props.subhead}
          </div>
          <div style={{ display: "flex", marginTop: "8px" }}>
            <CTAButton text={props.cta} color={props.brandColors.primary} />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 12: Offer Banner
// Price/discount with urgency
// ============================================================
const offerBanner: TemplateDefinition = {
  id: "offer-banner",
  name: "Offer Banner",
  description: "Promotional offer with price and urgency element",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.primary, padding: "0" }}>
      {/* Top section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "28px" }}>
        {/* Logo */}
        {props.logoUrl && (
          <img src={props.logoUrl} style={{ height: "32px", objectFit: "contain", marginBottom: "4px" }} />
        )}
        {/* Urgency badge */}
        <div style={{ display: "flex", padding: "8px 24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "24px" }}>
          <span style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const }}>LIMITED TIME</span>
        </div>
        <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1, textAlign: "center" as const }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "32px", color: "rgba(255,255,255,0.85)", textAlign: "center" as const, lineHeight: 1.4 }}>
          {props.subhead}
        </div>
      </div>
      {/* CTA area */}
      <div style={{ display: "flex", justifyContent: "center", padding: "44px", backgroundColor: "rgba(0,0,0,0.15)" }}>
        <CTAButton text={props.cta} color="#FFFFFF" textColor={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 13: Social Proof Wall
// Multiple mini-testimonials tiled
// ============================================================
const socialProofWall: TemplateDefinition = {
  id: "social-proof-wall",
  name: "Social Proof Wall",
  description: "Multiple review excerpts tiled together",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => {
    const reviews = props.subhead.split(/[|;]/).filter(Boolean).slice(0, 3);
    const reviewTexts = reviews.length >= 2 ? reviews : ["Amazing experience!", "Would recommend to everyone.", "Changed my life."];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "40px", gap: "28px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ fontSize: "32px", color: "#FFD700" }}>★</span>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
            {props.headline}
          </div>
        </div>
        {/* Review cards */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "20px" }}>
          {reviewTexts.map((review, i) => (
            <div key={i} style={{ display: "flex", padding: "16px 20px", backgroundColor: "rgba(0,0,0,0.04)", borderRadius: "12px", borderLeft: `3px solid ${props.brandColors.primary}` }}>
              <span style={{ fontSize: "24px", color: "#555", lineHeight: 1.4, fontStyle: "italic" }}>&ldquo;{review.trim()}&rdquo;</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 14: Feature Grid
// 2x2 feature callouts
// ============================================================
const featureGrid: TemplateDefinition = {
  id: "feature-grid",
  name: "Feature Grid",
  description: "2x2 grid of key features with icons",
  categories: ["product", "service", "digital", "location"],
  adCategories: ["differentiator", "conversion"],
  render: (props) => {
    const features = props.subhead.split(/[|;,]/).filter(Boolean).slice(0, 4);
    const featureTexts = features.length === 4 ? features : ["Fast & reliable", "Expert team", "Best prices", "24/7 support"];
    const icons = ["⚡", "🎯", "💎", "🔒"];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "40px", gap: "32px" }}>
        <div style={{ display: "flex", fontSize: "50px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
          {props.headline}
        </div>
        {/* 2x2 Grid using flexbox */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flex: 1, gap: "20px" }}>
            {featureTexts.slice(0, 2).map((feat, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "16px", padding: "20px", gap: "8px" }}>
                <span style={{ fontSize: "48px" }}>{icons[i]}</span>
                <span style={{ fontSize: "24px", fontWeight: 600, color: props.brandColors.primary, textAlign: "center" as const }}>{feat.trim()}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1, gap: "20px" }}>
            {featureTexts.slice(2, 4).map((feat, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "16px", padding: "20px", gap: "8px" }}>
                <span style={{ fontSize: "48px" }}>{icons[i + 2]}</span>
                <span style={{ fontSize: "24px", fontWeight: 600, color: props.brandColors.primary, textAlign: "center" as const }}>{feat.trim()}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 15: Lifestyle Blend
// Product/service blended into lifestyle scene
// ============================================================
const lifestyleBlend: TemplateDefinition = {
  id: "lifestyle-blend",
  name: "Lifestyle Scene",
  description: "Product or service in a real-world lifestyle context",
  categories: ["product", "service", "location", "personal_brand"],
  adCategories: ["emotional", "conversion"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden" }}>
      {props.bgImageUrl && (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Overlay opacity={0.5} />
      {/* Top brand bar */}
      <div style={{ display: "flex", position: "relative", padding: "24px 36px", justifyContent: "space-between", alignItems: "center" }}>
        {props.logoUrl ? (
          <img src={props.logoUrl} style={{ height: "32px", objectFit: "contain" }} />
        ) : <div />}
        <div style={{ display: "flex", padding: "6px 16px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>
          <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const }}>AD</span>
        </div>
      </div>
      {/* Content bottom */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative", marginTop: "auto", padding: "36px", gap: "20px" }}>
        <div style={{ display: "flex", fontSize: "58px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "8px" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 16: Myth Buster
// Common myth struck through, truth revealed
// ============================================================
const mythBuster: TemplateDefinition = {
  id: "myth-buster",
  name: "Myth Buster",
  description: "Strike through a common myth, reveal the truth",
  categories: ["product", "service", "digital", "location"],
  adCategories: ["competitive", "conversion"],
  render: (props) => {
    const parts = props.headline.split(/→|➜|TRUTH:/i);
    const myth = parts[0]?.trim() || props.headline;
    const truth = parts[1]?.trim() || props.subhead;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "28px" }}>
        <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, color: "#CC4444", letterSpacing: "3px", textTransform: "uppercase" as const }}>MYTH</div>
        <div style={{ display: "flex", fontSize: "44px", fontWeight: 700, color: "#999", textDecoration: "line-through", textAlign: "center" as const, lineHeight: 1.3 }}>
          {myth}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", flex: 1, height: "1px", backgroundColor: "#E0E0E0" }} />
          <div style={{ display: "flex", fontSize: "34px" }}>⚡</div>
          <div style={{ display: "flex", flex: 1, height: "1px", backgroundColor: "#E0E0E0" }} />
        </div>
        <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, color: props.brandColors.primary, letterSpacing: "3px", textTransform: "uppercase" as const }}>REALITY</div>
        <div style={{ display: "flex", fontSize: "50px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
          {truth}
        </div>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 17: Checklist
// Bulleted benefits list — "Everything you need"
// ============================================================
const checklist: TemplateDefinition = {
  id: "checklist",
  name: "Checklist",
  description: "List of benefits with checkmarks — 'Everything included'",
  categories: ["product", "service", "digital", "location"],
  adCategories: ["differentiator", "conversion"],
  render: (props) => {
    const items = props.subhead.split(/[|;]/).filter(Boolean).slice(0, 5);
    const listItems = items.length >= 3 ? items : ["Benefit one", "Benefit two", "Benefit three", "Benefit four"];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "28px" }}>
        <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, color: props.brandColors.primary, letterSpacing: "2px", textTransform: "uppercase" as const }}>EVERYTHING INCLUDED</div>
        <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, color: props.brandColors.primary, lineHeight: 1.15 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "24px" }}>
          {listItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: props.brandColors.primary, flexShrink: 0 }}>
                <span style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 800 }}>✓</span>
              </div>
              <span style={{ fontSize: "28px", color: "#333", fontWeight: 500 }}>{item.trim()}</span>
            </div>
          ))}
        </div>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 18: Countdown / Urgency
// Limited time with visual urgency
// ============================================================
const countdown: TemplateDefinition = {
  id: "countdown",
  name: "Countdown Urgency",
  description: "Limited time offer with strong urgency signals",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#1A1A1A", padding: "0" }}>
      {/* Top urgency bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "#CC2222", gap: "8px" }}>
        <span style={{ fontSize: "32px" }}>🔥</span>
        <span style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" as const }}>LIMITED TIME OFFER</span>
        <span style={{ fontSize: "32px" }}>🔥</span>
      </div>
      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "32px" }}>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.1 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "32px", color: "rgba(255,255,255,0.75)", textAlign: "center" as const, lineHeight: 1.4 }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
          {["Hours", "Minutes", "Seconds"].map((unit, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", backgroundColor: props.brandColors.primary, borderRadius: "12px" }}>
                <span style={{ color: "#FFFFFF", fontSize: "42px", fontWeight: 900 }}>
                  {i === 0 ? "24" : i === 1 ? "00" : "00"}
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>{unit}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "44px" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 19: FAQ / Objection Handler
// Answer the #1 objection head-on
// ============================================================
const faqObjection: TemplateDefinition = {
  id: "faq-objection",
  name: "Objection Handler",
  description: "Address the #1 customer objection directly",
  categories: ["product", "service", "digital", "location", "personal_brand"],
  adCategories: ["conversion", "trust"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "32px" }}>
      {/* Q */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "40px", backgroundColor: "rgba(0,0,0,0.04)", borderRadius: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#E0E0E0", flexShrink: 0 }}>
            <span style={{ color: "#555", fontSize: "28px", fontWeight: 800 }}>Q</span>
          </div>
          <span style={{ fontSize: "32px", fontWeight: 700, color: "#333" }}>{props.headline}</span>
        </div>
      </div>
      {/* A */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "40px", backgroundColor: props.brandColors.primary, borderRadius: "20px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
            <span style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontSize: "32px", color: "#FFFFFF", lineHeight: 1.5, flex: 1 }}>{props.subhead}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 20: Risk Reversal / Guarantee
// Money back guarantee, risk-free messaging
// ============================================================
const riskReversal: TemplateDefinition = {
  id: "risk-reversal",
  name: "Risk Reversal",
  description: "Guarantee / risk-free / money-back messaging",
  categories: ["product", "service", "digital"],
  adCategories: ["conversion", "trust"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "32px" }}>
      {/* Shield icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: `${props.brandColors.primary}15`, border: `3px solid ${props.brandColors.primary}` }}>
        <span style={{ fontSize: "68px" }}>🛡️</span>
      </div>
      <div style={{ display: "flex", fontSize: "64px", fontWeight: 900, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.1 }}>
        {props.headline}
      </div>
      <div style={{ display: "flex", width: "100px", height: "5px", backgroundColor: props.brandColors.accent, borderRadius: "2px" }} />
      <div style={{ display: "flex", fontSize: "32px", color: "#555", textAlign: "center" as const, lineHeight: 1.5, maxWidth: "85%" }}>
        {props.subhead}
      </div>
      <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
    </div>
  ),
};

// ============================================================
// TEMPLATE 21: Price Comparison
// Show value vs competitor pricing
// ============================================================
const priceComparison: TemplateDefinition = {
  id: "price-comparison",
  name: "Price Comparison",
  description: "Our price vs competitor — show the value gap",
  categories: ["product", "service", "digital"],
  adCategories: ["competitive", "conversion"],
  render: (props) => {
    const parts = props.subhead.split(/[|;]/).filter(Boolean);
    const ourPrice = parts[0]?.trim() || "From $49";
    const theirPrice = parts[1]?.trim() || "Up to $200";

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "28px" }}>
        <div style={{ display: "flex", fontSize: "50px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", flex: 1, gap: "24px", alignItems: "stretch" }}>
          {/* Competitor */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#F5F5F5", borderRadius: "20px", padding: "40px", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#999", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const }}>Others</span>
            <span style={{ fontSize: "60px", fontWeight: 900, color: "#CC4444", textDecoration: "line-through" }}>{theirPrice}</span>
          </div>
          {/* Ours */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, borderRadius: "20px", padding: "40px", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const }}>Us</span>
            <span style={{ fontSize: "60px", fontWeight: 900, color: "#FFFFFF" }}>{ourPrice}</span>
            <div style={{ display: "flex", padding: "4px 12px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "20px" }}>
              <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700 }}>BEST VALUE</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 22: Founder / Story
// Personal narrative with human connection
// ============================================================
const founderStory: TemplateDefinition = {
  id: "founder-story",
  name: "Founder Story",
  description: "Personal narrative — why this brand exists",
  categories: ["product", "service", "personal_brand", "location"],
  adCategories: ["emotional", "trust"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden" }}>
      {props.bgImageUrl && (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)" }} />
      {/* Quote mark */}
      <div style={{ display: "flex", position: "relative", padding: "40px 48px 0" }}>
        <span style={{ fontSize: "120px", color: props.brandColors.primary, lineHeight: 0.8, fontWeight: 900, opacity: 0.8 }}>&ldquo;</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "flex-end", padding: "0 48px 48px" }}>
        <div style={{ display: "flex", fontSize: "42px", color: "#FFFFFF", lineHeight: 1.4, fontStyle: "italic", marginBottom: "20px" }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.75)", marginBottom: "20px", lineHeight: 1.4 }}>
          {props.subhead}
        </div>
        <CTAButton text={props.cta} color={props.brandColors.primary} />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 23: App / Digital Mockup
// Screenshot in device frame with headline
// ============================================================
const appMockup: TemplateDefinition = {
  id: "app-mockup",
  name: "App Mockup",
  description: "Screenshot or UI in a device frame with headline",
  categories: ["digital"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: props.brandColors.background, padding: "72px", gap: "32px", alignItems: "center" }}>
      <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: props.brandColors.primary, textAlign: "center" as const, lineHeight: 1.2 }}>
        {props.headline}
      </div>
      {/* Device frame */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "220px", borderRadius: "32px", border: `8px solid ${props.brandColors.primary}`, overflow: "hidden", backgroundColor: "#F0F0F0" }}>
          {/* Status bar */}
          <div style={{ display: "flex", backgroundColor: props.brandColors.primary, height: "28px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#FFF", fontSize: "10px", fontWeight: 700 }}>9:41</span>
          </div>
          {/* Screen content */}
          <div style={{ display: "flex", flexDirection: "column", padding: "16px", gap: "8px", minHeight: "240px" }}>
            {props.primaryAssetUrl ? (
              <img src={props.primaryAssetUrl} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <div style={{ display: "flex", height: "160px", backgroundColor: `${props.brandColors.primary}20`, borderRadius: "8px", alignItems: "center", justifyContent: "center", fontSize: "58px" }}>📱</div>
            )}
            <div style={{ display: "flex", height: "12px", backgroundColor: `${props.brandColors.primary}30`, borderRadius: "6px" }} />
            <div style={{ display: "flex", height: "12px", backgroundColor: `${props.brandColors.primary}20`, borderRadius: "6px", width: "70%" }} />
          </div>
          {/* Home bar */}
          <div style={{ display: "flex", backgroundColor: "#F0F0F0", height: "20px", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: "60px", height: "4px", backgroundColor: "#CCC", borderRadius: "2px" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", fontSize: "24px", color: "#666", textAlign: "center" as const }}>{props.subhead}</div>
      <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
    </div>
  ),
};

// ============================================================
// Export all templates
// ============================================================
export const TEMPLATES: TemplateDefinition[] = [
  heroHeadline,
  boldStatement,
  statCallout,
  splitCompare,
  testimonialCard,
  problemSolution,
  threeStep,
  trustAuthority,
  facilityShowcase,
  productSpotlight,
  ugcStyle,
  offerBanner,
  socialProofWall,
  featureGrid,
  lifestyleBlend,
  mythBuster,
  checklist,
  countdown,
  faqObjection,
  riskReversal,
  priceComparison,
  founderStory,
  appMockup,
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesForBusinessType(businessType: string): TemplateDefinition[] {
  return TEMPLATES.filter((t) => t.categories.includes(businessType));
}

// Ad format dimensions
export const AD_FORMATS = {
  "feed": { width: 1080, height: 1350, label: "Feed (4:5)", aspect: "4:5" },
  "story": { width: 1080, height: 1920, label: "Story (9:16)", aspect: "9:16" },
  "square": { width: 1080, height: 1080, label: "Square (1:1)", aspect: "1:1" },
  "display": { width: 1200, height: 628, label: "Display (1.91:1)", aspect: "1.91:1" },
} as const;

export type AdFormat = keyof typeof AD_FORMATS;
