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
function Overlay({ opacity = 0.6, direction = "bottom" }: { opacity?: number; direction?: "bottom" | "top" | "full" }) {
  const gradient = direction === "full"
    ? `rgba(0,0,0,${opacity})`
    : direction === "top"
    ? `linear-gradient(180deg, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.2}) 60%, transparent 100%)`
    : `linear-gradient(180deg, transparent 0%, rgba(0,0,0,${opacity * 0.3}) 40%, rgba(0,0,0,${opacity}) 100%)`;
  return (
    <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: gradient }} />
  );
}

// Helper: brand logo badge
function LogoBadge({ logoUrl, position = "top-right" }: { logoUrl?: string; position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  if (!logoUrl) return null;
  const posStyle: Record<string, string | number> = { position: "absolute", display: "flex", zIndex: 10 };
  if (position.includes("top")) posStyle.top = "48px";
  if (position.includes("bottom")) posStyle.bottom = "48px";
  if (position.includes("left")) posStyle.left = "48px";
  if (position.includes("right")) posStyle.right = "48px";
  return (
    <div style={posStyle}>
      <img src={logoUrl} style={{ height: "64px", objectFit: "contain", borderRadius: "8px" }} />
    </div>
  );
}

// Helper: CTA button — MASSIVE, impossible to miss
function CTAButton({
  text,
  color,
  textColor = "#FFFFFF",
  size = "normal",
  fullWidth = false,
}: {
  text: string;
  color: string;
  textColor?: string;
  size?: "normal" | "large";
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size === "large" ? "36px 96px" : "32px 72px",
        backgroundColor: color,
        borderRadius: "20px",
        color: textColor,
        fontSize: size === "large" ? "40px" : "34px",
        fontWeight: 800,
        letterSpacing: "1.5px",
        textTransform: "uppercase" as const,
        width: fullWidth ? "100%" : undefined,
      }}
    >
      {text}
    </div>
  );
}

// Helper: colored bottom bar with CTA — gives structure to every ad
function CTABar({ cta, color, textColor = "#FFFFFF" }: { cta: string; color: string; textColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 72px", backgroundColor: color }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "28px 72px", backgroundColor: textColor, borderRadius: "18px",
        color: color, fontSize: "34px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" as const,
      }}>
        {cta}
      </div>
    </div>
  );
}

// Helper: accent bar / colored stripe for visual weight
function AccentStripe({ color, height = "8px" }: { color: string; height?: string }) {
  return <div style={{ display: "flex", width: "100%", height, backgroundColor: color }} />;
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
// Full-bleed background photo + bold text bottom + CTA bar
// ============================================================
const heroHeadline: TemplateDefinition = {
  id: "hero-headline",
  name: "Hero Headline",
  description: "Full-bleed background with bold headline and CTA bar",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: "#111" }}>
      {props.bgImageUrl ? (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${props.brandColors.primary} 0%, ${props.brandColors.secondary} 100%)` }} />
      )}
      <Overlay opacity={0.7} direction="bottom" />
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      {/* Content fills bottom 50% */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", flex: 1, padding: "0 72px 0" }}>
        <div style={{ display: "flex", fontSize: "76px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.05 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "rgba(255,255,255,0.9)", lineHeight: 1.4, marginTop: "20px" }}>
          {props.subhead}
        </div>
      </div>
      {/* Solid CTA bar at bottom */}
      <div style={{ display: "flex", position: "relative", padding: "40px 72px 48px" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 2: Bold Statement
// Brand color background with massive centered text
// ============================================================
const boldStatement: TemplateDefinition = {
  id: "bold-statement",
  name: "Bold Statement",
  description: "Single powerful sentence on brand color background",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["emotional", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, background: `linear-gradient(160deg, ${props.brandColors.primary} 0%, ${props.brandColors.secondary} 100%)` }}>
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      {/* Centered content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "28px" }}>
        <div style={{ display: "flex", fontSize: "80px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1, textAlign: "center" as const }}>
          {props.headline}
        </div>
        <AccentStripe color="rgba(255,255,255,0.3)" height="6px" />
        <div style={{ display: "flex", fontSize: "30px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5, textAlign: "center" as const }}>
          {props.subhead}
        </div>
      </div>
      {/* White CTA on dark background bar */}
      <CTABar cta={props.cta} color="rgba(0,0,0,0.25)" textColor="#FFFFFF" />
    </div>
  ),
};

// ============================================================
// TEMPLATE 3: Stat Callout
// Huge number on dark bg with brand accent
// ============================================================
const statCallout: TemplateDefinition = {
  id: "stat-callout",
  name: "Stat Callout",
  description: "Oversized statistic number with supporting context",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => {
    const match = props.headline.match(/[\d,]+[+%]?/);
    const stat = match ? match[0] : props.headline.split(" ")[0];
    const rest = match ? props.headline.replace(stat, "").trim() : props.headline.split(" ").slice(1).join(" ");

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        {/* Top accent stripe */}
        <AccentStripe color={props.brandColors.primary} height="10px" />
        {/* Centered stat */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "200px", fontWeight: 900, color: props.brandColors.primary, lineHeight: 0.9 }}>
            {stat}
          </div>
          <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: "#FFFFFF", textAlign: "center" as const, marginTop: "8px" }}>
            {rest}
          </div>
          <div style={{ display: "flex", width: "120px", height: "6px", backgroundColor: props.brandColors.primary, borderRadius: "3px", margin: "24px 0" }} />
          <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, textAlign: "center" as const, maxWidth: "85%" }}>
            {props.subhead}
          </div>
        </div>
        {/* CTA bar */}
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 4: Split Compare
// Left/right panels — no emojis, bold text + color contrast
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
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height }}>
        {/* Two halves */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* Left - "bad" side — dark, crossed out */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1A1A1A", padding: "48px", gap: "24px" }}>
            <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, color: "#FF4444", letterSpacing: "4px", textTransform: "uppercase" as const }}>THE OLD WAY</div>
            <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, color: "#FF6B6B", textAlign: "center" as const, textDecoration: "line-through", lineHeight: 1.2 }}>
              {left}
            </div>
          </div>
          {/* Right - "good" side — brand color, bold */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, padding: "48px", gap: "24px" }}>
            <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "4px", textTransform: "uppercase" as const }}>THE BETTER WAY</div>
            <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.2 }}>
              {right}
            </div>
          </div>
        </div>
        {/* Bottom bar with subhead + CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px", backgroundColor: "#111", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.8)", textAlign: "center" as const }}>
            {props.subhead}
          </div>
          <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
        </div>
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 5: Testimonial Card
// Big quote on dark overlay with stars — full bleed photo
// ============================================================
const testimonialCard: TemplateDefinition = {
  id: "testimonial-card",
  name: "Testimonial Card",
  description: "Customer quote with star rating on photo background",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: "#111" }}>
      {props.bgImageUrl ? (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(160deg, #1a1a2e 0%, ${props.brandColors.primary} 100%)` }} />
      )}
      <Overlay opacity={0.75} direction="full" />
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      {/* Stars at top */}
      <div style={{ display: "flex", position: "relative", justifyContent: "center", paddingTop: "160px", gap: "8px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", fontSize: "48px", color: "#FFD700" }}>★</div>
        ))}
      </div>
      {/* Quote centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "48px 72px", position: "relative", gap: "32px" }}>
        <div style={{ display: "flex", fontSize: "48px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.35, textAlign: "center" as const, fontStyle: "italic" }}>
          &ldquo;{props.headline}&rdquo;
        </div>
        <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.6)", letterSpacing: "2px", textTransform: "uppercase" as const }}>
          {props.subhead}
        </div>
      </div>
      {/* CTA bar */}
      <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
    </div>
  ),
};

// ============================================================
// TEMPLATE 6: Problem Solution
// Two stacked blocks — dark problem, bright solution
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
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height }}>
        {/* Problem — dark block, top half */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1A1A1A", padding: "72px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, color: "#FF4444", letterSpacing: "4px", textTransform: "uppercase" as const }}>THE PROBLEM</div>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 800, color: "#FF6B6B", textDecoration: "line-through", textAlign: "center" as const, lineHeight: 1.15 }}>
            {problem}
          </div>
        </div>
        {/* Accent stripe */}
        <AccentStripe color={props.brandColors.primary} height="10px" />
        {/* Solution — brand color block, bottom half */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, padding: "72px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "4px", textTransform: "uppercase" as const }}>THE SOLUTION</div>
          <div style={{ display: "flex", fontSize: "60px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.15 }}>
            {solution}
          </div>
          <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.8)", textAlign: "center" as const, marginTop: "8px" }}>
            {props.subhead}
          </div>
        </div>
        {/* CTA */}
        <CTABar cta={props.cta} color="#111" textColor="#FFFFFF" />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 7: Three Step
// Dark bg, numbered steps with brand accent, CTA bar
// ============================================================
const threeStep: TemplateDefinition = {
  id: "three-step",
  name: "Three Step Process",
  description: "How it works — numbered 3-step visual flow",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => {
    const steps = props.subhead.split(/[|;,]|\d\.\s/).filter(Boolean).slice(0, 3);
    const stepTexts = steps.length === 3 ? steps : ["Step one description", "Step two description", "Step three description"];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        {/* Accent top */}
        <AccentStripe color={props.brandColors.primary} height="10px" />
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px 0", gap: "12px" }}>
          <div style={{ display: "flex", fontSize: "22px", color: props.brandColors.primary, letterSpacing: "4px", textTransform: "uppercase" as const, fontWeight: 700 }}>HOW IT WORKS</div>
          <div style={{ display: "flex", fontSize: "60px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
            {props.headline}
          </div>
        </div>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", padding: "32px 72px", gap: "40px" }}>
          {stepTexts.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: props.brandColors.primary, color: "#FFFFFF", fontSize: "38px", fontWeight: 900, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ display: "flex", fontSize: "30px", color: "rgba(255,255,255,0.9)", lineHeight: 1.35, flex: 1, fontWeight: 500 }}>
                {step.trim()}
              </div>
            </div>
          ))}
        </div>
        {/* CTA bar */}
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 8: Trust Authority
// Photo takes 60%, brand color panel with text + CTA takes 40%
// ============================================================
const trustAuthority: TemplateDefinition = {
  id: "trust-authority",
  name: "Trust & Authority",
  description: "Staff portrait with credentials and trust signals",
  categories: ["service", "personal_brand", "location"],
  adCategories: ["trust", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height }}>
      {/* Portrait area — 60% of height */}
      <div style={{ display: "flex", flex: 3, position: "relative", overflow: "hidden", backgroundColor: "#222" }}>
        {(props.primaryAssetUrl || props.bgImageUrl) ? (
          <img src={props.primaryAssetUrl || props.bgImageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, #1a1a2e 0%, ${props.brandColors.primary} 100%)` }} />
        )}
        <Overlay opacity={0.3} direction="bottom" />
        <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      </div>
      {/* Info panel — 40% with brand color */}
      <div style={{ display: "flex", flexDirection: "column", flex: 2, padding: "48px 72px", backgroundColor: props.brandColors.primary, gap: "16px", justifyContent: "center" }}>
        <div style={{ display: "flex", fontSize: "48px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.15 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", marginTop: "12px" }}>
          <CTAButton text={props.cta} color="#FFFFFF" textColor={props.brandColors.primary} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 9: Facility Showcase
// Full-bleed photo with text at bottom
// ============================================================
const facilityShowcase: TemplateDefinition = {
  id: "facility-showcase",
  name: "Facility Showcase",
  description: "Location/facility photo with feature overlay",
  categories: ["service", "location"],
  adCategories: ["trust", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: "#111" }}>
      {(props.primaryAssetUrl || props.bgImageUrl) ? (
        <img src={props.primaryAssetUrl || props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(160deg, #1a1a2e 0%, ${props.brandColors.primary} 100%)` }} />
      )}
      <Overlay opacity={0.7} direction="bottom" />
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "flex-end", padding: "0 72px" }}>
        <div style={{ display: "flex", fontSize: "64px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.9)", lineHeight: 1.4, marginTop: "16px" }}>
          {props.subhead}
        </div>
      </div>
      <div style={{ display: "flex", position: "relative", padding: "40px 72px 48px" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 10: Product Spotlight
// Product on dark bg with brand accent border
// ============================================================
const productSpotlight: TemplateDefinition = {
  id: "product-spotlight",
  name: "Product Spotlight",
  description: "Product image centered with key features",
  categories: ["product"],
  adCategories: ["conversion", "differentiator"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
      <AccentStripe color={props.brandColors.primary} height="10px" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 72px 0", gap: "8px" }}>
        <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.1 }}>
          {props.headline}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "32px" }}>
        {props.primaryAssetUrl ? (
          <img src={props.primaryAssetUrl} style={{ maxWidth: "400px", maxHeight: "400px", objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", width: "300px", height: "300px", borderRadius: "24px", backgroundColor: "#1a1a1a", border: `4px solid ${props.brandColors.primary}`, alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "28px", color: props.brandColors.primary, fontWeight: 700 }}>YOUR PRODUCT</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 72px 16px" }}>
        <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.7)", textAlign: "center" as const, lineHeight: 1.4 }}>
          {props.subhead}
        </div>
      </div>
      <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
    </div>
  ),
};

// ============================================================
// TEMPLATE 11: UGC Style
// Photo bg with casual text overlay — no emoji, just raw
// ============================================================
const ugcStyle: TemplateDefinition = {
  id: "ugc-style",
  name: "UGC Style",
  description: "Casual user-generated content social post aesthetic",
  categories: ["product", "service", "location", "personal_brand"],
  adCategories: ["social-proof", "emotional"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: "#111" }}>
      {props.bgImageUrl ? (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(160deg, #1a1a2e 0%, ${props.brandColors.primary} 100%)` }} />
      )}
      <Overlay opacity={0.65} direction="full" />
      {/* Verified badge top */}
      <div style={{ display: "flex", position: "relative", padding: "48px 56px", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: props.brandColors.primary, alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#FFF", fontSize: "28px", fontWeight: 800 }}>✓</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#FFF", fontSize: "24px", fontWeight: 700 }}>Verified Review</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "18px" }}>Real Customer</span>
        </div>
      </div>
      {/* Content fills bottom */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "flex-end", padding: "0 56px" }}>
        <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5, marginTop: "16px" }}>
          {props.subhead}
        </div>
      </div>
      <div style={{ display: "flex", position: "relative", padding: "40px 56px 48px" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
      </div>
    </div>
  ),
};

// ============================================================
// TEMPLATE 12: Offer Banner
// Gradient bg with urgency badge and massive CTA
// ============================================================
const offerBanner: TemplateDefinition = {
  id: "offer-banner",
  name: "Offer Banner",
  description: "Promotional offer with urgency",
  categories: ["product", "service", "location", "digital"],
  adCategories: ["conversion"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, background: `linear-gradient(160deg, ${props.brandColors.primary} 0%, ${props.brandColors.secondary} 100%)` }}>
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "32px" }}>
        {/* Urgency badge */}
        <div style={{ display: "flex", padding: "14px 40px", backgroundColor: "rgba(0,0,0,0.25)", borderRadius: "40px" }}>
          <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase" as const }}>LIMITED TIME</span>
        </div>
        <div style={{ display: "flex", fontSize: "76px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.05, textAlign: "center" as const }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "rgba(255,255,255,0.85)", textAlign: "center" as const, lineHeight: 1.4 }}>
          {props.subhead}
        </div>
      </div>
      <CTABar cta={props.cta} color="rgba(0,0,0,0.3)" textColor="#FFFFFF" />
    </div>
  ),
};

// ============================================================
// TEMPLATE 13: Social Proof Wall
// Dark bg with stacked review cards and accent borders
// ============================================================
const socialProofWall: TemplateDefinition = {
  id: "social-proof-wall",
  name: "Social Proof Wall",
  description: "Multiple review excerpts on dark background",
  categories: ["product", "service", "location", "digital", "personal_brand"],
  adCategories: ["social-proof", "trust"],
  render: (props) => {
    const reviews = props.subhead.split(/[|;]/).filter(Boolean).slice(0, 3);
    const reviewTexts = reviews.length >= 2 ? reviews : ["Amazing experience!", "Would recommend to everyone.", "Changed my life."];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        <AccentStripe color={props.brandColors.primary} height="10px" />
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 72px 0", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ fontSize: "40px", color: "#FFD700" }}>★</span>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.15 }}>
            {props.headline}
          </div>
        </div>
        {/* Review cards */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", padding: "32px 72px", gap: "20px" }}>
          {reviewTexts.map((review, i) => (
            <div key={i} style={{ display: "flex", padding: "28px 32px", backgroundColor: "#1a1a1a", borderRadius: "16px", borderLeft: `6px solid ${props.brandColors.primary}` }}>
              <span style={{ fontSize: "26px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4, fontStyle: "italic" }}>&ldquo;{review.trim()}&rdquo;</span>
            </div>
          ))}
        </div>
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 14: Feature Grid
// Dark bg, 2x2 grid with brand-colored cards, no emojis
// ============================================================
const featureGrid: TemplateDefinition = {
  id: "feature-grid",
  name: "Feature Grid",
  description: "2x2 grid of key features",
  categories: ["product", "service", "digital", "location"],
  adCategories: ["differentiator", "conversion"],
  render: (props) => {
    const features = props.subhead.split(/[|;,]/).filter(Boolean).slice(0, 4);
    const featureTexts = features.length === 4 ? features : ["Fast & reliable", "Expert team", "Best prices", "24/7 support"];

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        <AccentStripe color={props.brandColors.primary} height="10px" />
        <div style={{ display: "flex", fontSize: "52px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.15, padding: "56px 72px 0" }}>
          {props.headline}
        </div>
        {/* 2x2 Grid */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "16px", padding: "32px 72px" }}>
          <div style={{ display: "flex", flex: 1, gap: "16px" }}>
            {featureTexts.slice(0, 2).map((feat, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1a1a1a", borderRadius: "20px", padding: "24px", border: `2px solid ${props.brandColors.primary}30` }}>
                <div style={{ display: "flex", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: props.brandColors.primary, alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ color: "#FFF", fontSize: "28px", fontWeight: 900 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", textAlign: "center" as const }}>{feat.trim()}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1, gap: "16px" }}>
            {featureTexts.slice(2, 4).map((feat, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1a1a1a", borderRadius: "20px", padding: "24px", border: `2px solid ${props.brandColors.primary}30` }}>
                <div style={{ display: "flex", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: props.brandColors.primary, alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ color: "#FFF", fontSize: "28px", fontWeight: 900 }}>{i + 3}</span>
                </div>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", textAlign: "center" as const }}>{feat.trim()}</span>
              </div>
            ))}
          </div>
        </div>
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
      </div>
    );
  },
};

// ============================================================
// TEMPLATE 15: Lifestyle Blend
// Full-bleed lifestyle photo, bold text at bottom, CTA bar
// ============================================================
const lifestyleBlend: TemplateDefinition = {
  id: "lifestyle-blend",
  name: "Lifestyle Scene",
  description: "Product or service in a real-world lifestyle context",
  categories: ["product", "service", "location", "personal_brand"],
  adCategories: ["emotional", "conversion"],
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, position: "relative", overflow: "hidden", backgroundColor: "#111" }}>
      {props.bgImageUrl ? (
        <img src={props.bgImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(160deg, #1a1a2e 0%, ${props.brandColors.primary} 100%)` }} />
      )}
      <Overlay opacity={0.65} direction="bottom" />
      <LogoBadge logoUrl={props.logoUrl} position="top-left" />
      {/* Content at bottom */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "flex-end", padding: "0 72px" }}>
        <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.05 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.9)", lineHeight: 1.4, marginTop: "16px" }}>
          {props.subhead}
        </div>
      </div>
      <div style={{ display: "flex", position: "relative", padding: "40px 72px 48px" }}>
        <CTAButton text={props.cta} color={props.brandColors.primary} size="large" />
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
  description: "Dark stacked blocks — myth struck through, truth in brand color",
  categories: ["product", "service", "digital", "location"],
  adCategories: ["competitive", "conversion"],
  render: (props) => {
    const parts = props.headline.split(/→|➜|TRUTH:/i);
    const myth = parts[0]?.trim() || props.headline;
    const truth = parts[1]?.trim() || props.subhead;

    return (
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height }}>
        {/* Myth — dark red tinted block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1a0000", padding: "72px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "24px", fontWeight: 800, color: "#FF4444", letterSpacing: "6px", textTransform: "uppercase" as const }}>MYTH</div>
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: "#FF6B6B", textDecoration: "line-through", textAlign: "center" as const, lineHeight: 1.2 }}>
            {myth}
          </div>
        </div>
        <AccentStripe color={props.brandColors.primary} height="10px" />
        {/* Truth — brand color block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, padding: "72px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "24px", fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: "6px", textTransform: "uppercase" as const }}>REALITY</div>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.15 }}>
            {truth}
          </div>
        </div>
        <CTABar cta={props.cta} color="#111" textColor="#FFFFFF" />
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
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        <AccentStripe color={props.brandColors.primary} height="10px" />
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 72px 0", gap: "12px" }}>
          <div style={{ display: "flex", fontSize: "22px", fontWeight: 800, color: props.brandColors.primary, letterSpacing: "4px", textTransform: "uppercase" as const }}>WHAT YOU GET</div>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
            {props.headline}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", padding: "24px 72px", gap: "28px" }}>
          {listItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: props.brandColors.primary, flexShrink: 0 }}>
                <span style={{ color: "#FFFFFF", fontSize: "26px", fontWeight: 900 }}>✓</span>
              </div>
              <span style={{ fontSize: "30px", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{item.trim()}</span>
            </div>
          ))}
        </div>
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
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
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
      {/* Red urgency bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backgroundColor: "#CC2222" }}>
        <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 900, letterSpacing: "6px", textTransform: "uppercase" as const }}>OFFER ENDS SOON</span>
      </div>
      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "32px" }}>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.1 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "32px", color: "rgba(255,255,255,0.75)", textAlign: "center" as const, lineHeight: 1.4 }}>
          {props.subhead}
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {["24", "00", "00"].map((val, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", backgroundColor: props.brandColors.primary, borderRadius: "16px" }}>
              <span style={{ color: "#FFFFFF", fontSize: "52px", fontWeight: 900 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <CTABar cta={props.cta} color="#CC2222" textColor="#CC2222" />
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
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
      <AccentStripe color={props.brandColors.primary} height="10px" />
      {/* Q block */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "56px 72px", backgroundColor: "#1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#333", flexShrink: 0 }}>
          <span style={{ color: "#FFF", fontSize: "32px", fontWeight: 900 }}>Q</span>
        </div>
        <span style={{ fontSize: "36px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>{props.headline}</span>
      </div>
      {/* A block */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flex: 1, padding: "56px 72px", backgroundColor: props.brandColors.primary }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
          <span style={{ color: "#FFFFFF", fontSize: "32px", fontWeight: 900 }}>A</span>
        </div>
        <span style={{ fontSize: "34px", color: "#FFFFFF", lineHeight: 1.45, flex: 1 }}>{props.subhead}</span>
      </div>
      <CTABar cta={props.cta} color="#111" textColor="#FFFFFF" />
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
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
      <AccentStripe color={props.brandColors.primary} height="10px" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "72px", gap: "36px" }}>
        {/* Guarantee circle — no emoji */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "140px", height: "140px", borderRadius: "50%", border: `6px solid ${props.brandColors.primary}`, backgroundColor: "#1a1a1a" }}>
          <span style={{ color: props.brandColors.primary, fontSize: "56px", fontWeight: 900 }}>100%</span>
        </div>
        <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.05 }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", width: "120px", height: "6px", backgroundColor: props.brandColors.primary, borderRadius: "3px" }} />
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.7)", textAlign: "center" as const, lineHeight: 1.5, maxWidth: "85%" }}>
          {props.subhead}
        </div>
      </div>
      <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
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
      <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
        <AccentStripe color={props.brandColors.primary} height="10px" />
        <div style={{ display: "flex", fontSize: "52px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.15, padding: "56px 72px 0" }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", flex: 1, gap: "16px", padding: "32px 72px", alignItems: "stretch" }}>
          {/* Competitor */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#1a1a1a", borderRadius: "24px", padding: "40px", gap: "12px", border: "2px solid #333" }}>
            <span style={{ fontSize: "22px", color: "#888", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase" as const }}>OTHERS</span>
            <span style={{ fontSize: "72px", fontWeight: 900, color: "#FF4444", textDecoration: "line-through" }}>{theirPrice}</span>
          </div>
          {/* Ours */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: props.brandColors.primary, borderRadius: "24px", padding: "40px", gap: "12px" }}>
            <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.7)", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase" as const }}>US</span>
            <span style={{ fontSize: "72px", fontWeight: 900, color: "#FFFFFF" }}>{ourPrice}</span>
            <div style={{ display: "flex", padding: "8px 24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "24px" }}>
              <span style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 800, letterSpacing: "2px" }}>BEST VALUE</span>
            </div>
          </div>
        </div>
        <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
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
      <Overlay opacity={0.8} direction="full" />
      {/* Big quote mark */}
      <div style={{ display: "flex", position: "relative", padding: "64px 72px 0" }}>
        <span style={{ fontSize: "160px", color: props.brandColors.primary, lineHeight: 0.7, fontWeight: 900 }}>&ldquo;</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "center", padding: "0 72px" }}>
        <div style={{ display: "flex", fontSize: "48px", color: "#FFFFFF", lineHeight: 1.35, fontStyle: "italic" }}>
          {props.headline}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.6)", marginTop: "24px", letterSpacing: "2px", textTransform: "uppercase" as const }}>
          {props.subhead}
        </div>
      </div>
      <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
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
    <div style={{ display: "flex", flexDirection: "column", width: props.width, height: props.height, backgroundColor: "#0D0D0D" }}>
      <AccentStripe color={props.brandColors.primary} height="10px" />
      <div style={{ display: "flex", fontSize: "56px", fontWeight: 900, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.1, padding: "56px 72px 0" }}>
        {props.headline}
      </div>
      {/* Device frame */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "300px", borderRadius: "40px", border: `8px solid ${props.brandColors.primary}`, overflow: "hidden", backgroundColor: "#1a1a1a" }}>
          <div style={{ display: "flex", backgroundColor: props.brandColors.primary, height: "36px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#FFF", fontSize: "16px", fontWeight: 700 }}>9:41</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "20px", gap: "12px", minHeight: "320px" }}>
            {props.primaryAssetUrl ? (
              <img src={props.primaryAssetUrl} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "12px" }} />
            ) : (
              <div style={{ display: "flex", height: "220px", backgroundColor: `${props.brandColors.primary}20`, borderRadius: "12px", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: props.brandColors.primary, fontSize: "32px", fontWeight: 700 }}>YOUR APP</span>
              </div>
            )}
            <div style={{ display: "flex", height: "16px", backgroundColor: "#333", borderRadius: "8px" }} />
            <div style={{ display: "flex", height: "16px", backgroundColor: "#2a2a2a", borderRadius: "8px", width: "70%" }} />
          </div>
          <div style={{ display: "flex", height: "24px", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: "80px", height: "5px", backgroundColor: "#444", borderRadius: "3px" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", fontSize: "24px", color: "rgba(255,255,255,0.6)", textAlign: "center" as const, padding: "0 72px 16px", justifyContent: "center" }}>{props.subhead}</div>
      <CTABar cta={props.cta} color={props.brandColors.primary} textColor={props.brandColors.primary} />
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
