import type { CreativeBrief, BrandDna } from "./types";
import type React from "react";

// ── Template Rendering ──
// Each layout returns a React element tree for Satori to render to SVG/PNG.
// Satori supports a subset of CSS via inline styles (flexbox, no grid).

interface TemplateProps {
  brief: CreativeBrief;
  brand: BrandDna;
  width: number;
  height: number;
  backgroundUrl?: string;
  productImageUrl?: string;
}

function getColors(brief: CreativeBrief, brand: BrandDna) {
  const c = brief.color_override || {};
  return {
    primary: c.primary || brand.visualIdentity.primaryColor || "#C9A84C",
    secondary: c.secondary || brand.visualIdentity.secondaryColor || "#1A1A1E",
    accent: c.accent || brand.visualIdentity.accentColor || "#E0C872",
    text: c.text || "#FFFFFF",
    bg: c.bg || brand.visualIdentity.backgroundColor || "#0A0A0B",
  };
}

// ── Layout: Hero Center ──
function HeroCenter({ brief, brand, width, height, backgroundUrl, productImageUrl }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width, height, backgroundColor: colors.bg, position: "relative", overflow: "hidden" }}>
      {backgroundUrl && (
        <img src={backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover", opacity: 0.4 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", zIndex: 1, textAlign: "center" as const }}>
        {productImageUrl && (
          <img src={productImageUrl} style={{ width: Math.round(width * 0.35), height: Math.round(width * 0.35), objectFit: "contain", marginBottom: 32 }} />
        )}
        <div style={{ display: "flex", fontSize: Math.round(width * 0.055), fontWeight: 800, color: colors.text, lineHeight: 1.15, marginBottom: 16, maxWidth: "90%" }}>
          {brief.headline}
        </div>
        {brief.subheadline && (
          <div style={{ display: "flex", fontSize: Math.round(width * 0.028), color: colors.accent, lineHeight: 1.4, marginBottom: 32, maxWidth: "80%", opacity: 0.9 }}>
            {brief.subheadline}
          </div>
        )}
        {brief.cta && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, color: colors.bg, padding: "16px 40px", borderRadius: 8, fontSize: Math.round(width * 0.026), fontWeight: 700, letterSpacing: 1 }}>
            {brief.cta}
          </div>
        )}
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 24, fontSize: Math.round(width * 0.018), color: colors.text, opacity: 0.5 }}>
        {brand.brandOverview.name}
      </div>
    </div>
  );
}

// ── Layout: Split Left (text left, image right) ──
function SplitLeft({ brief, brand, width, height, backgroundUrl, productImageUrl }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  const half = Math.round(width * 0.5);
  return (
    <div style={{ display: "flex", flexDirection: "row", width, height, backgroundColor: colors.bg, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: half, padding: "48px 40px" }}>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.015), fontWeight: 600, color: colors.primary, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" as const }}>
          {brand.brandOverview.name}
        </div>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.048), fontWeight: 800, color: colors.text, lineHeight: 1.15, marginBottom: 16 }}>
          {brief.headline}
        </div>
        {brief.subheadline && (
          <div style={{ display: "flex", fontSize: Math.round(width * 0.024), color: colors.text, opacity: 0.7, lineHeight: 1.5, marginBottom: 28 }}>
            {brief.subheadline}
          </div>
        )}
        {brief.cta && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, color: colors.bg, padding: "14px 32px", borderRadius: 6, fontSize: Math.round(width * 0.022), fontWeight: 700, width: "fit-content" }}>
            {brief.cta}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: width - half, height, position: "relative", overflow: "hidden" }}>
        {backgroundUrl && (
          <img src={backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width: width - half, height, objectFit: "cover" }} />
        )}
        {productImageUrl && (
          <img src={productImageUrl} style={{ width: Math.round((width - half) * 0.7), height: Math.round((width - half) * 0.7), objectFit: "contain", position: "relative", zIndex: 1 }} />
        )}
      </div>
    </div>
  );
}

// ── Layout: Split Right (image left, text right) ──
function SplitRight(props: TemplateProps): React.ReactElement {
  const colors = getColors(props.brief, props.brand);
  const half = Math.round(props.width * 0.5);
  return (
    <div style={{ display: "flex", flexDirection: "row", width: props.width, height: props.height, backgroundColor: colors.bg, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: half, height: props.height, position: "relative", overflow: "hidden" }}>
        {props.backgroundUrl && (
          <img src={props.backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width: half, height: props.height, objectFit: "cover" }} />
        )}
        {props.productImageUrl && (
          <img src={props.productImageUrl} style={{ width: Math.round(half * 0.7), height: Math.round(half * 0.7), objectFit: "contain", position: "relative", zIndex: 1 }} />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: props.width - half, padding: "48px 40px" }}>
        <div style={{ display: "flex", fontSize: Math.round(props.width * 0.015), fontWeight: 600, color: colors.primary, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" as const }}>
          {props.brand.brandOverview.name}
        </div>
        <div style={{ display: "flex", fontSize: Math.round(props.width * 0.048), fontWeight: 800, color: colors.text, lineHeight: 1.15, marginBottom: 16 }}>
          {props.brief.headline}
        </div>
        {props.brief.subheadline && (
          <div style={{ display: "flex", fontSize: Math.round(props.width * 0.024), color: colors.text, opacity: 0.7, lineHeight: 1.5, marginBottom: 28 }}>
            {props.brief.subheadline}
          </div>
        )}
        {props.brief.cta && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, color: colors.bg, padding: "14px 32px", borderRadius: 6, fontSize: Math.round(props.width * 0.022), fontWeight: 700, width: "fit-content" }}>
            {props.brief.cta}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Layout: Stacked (full-bleed bg, text overlay at bottom) ──
function Stacked({ brief, brand, width, height, backgroundUrl, productImageUrl }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  return (
    <div style={{ display: "flex", flexDirection: "column", width, height, backgroundColor: colors.bg, position: "relative", overflow: "hidden" }}>
      {backgroundUrl && (
        <img src={backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover", opacity: 0.5 }} />
      )}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {productImageUrl && (
          <img src={productImageUrl} style={{ width: Math.round(width * 0.45), height: Math.round(width * 0.45), objectFit: "contain" }} />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "40px 44px", position: "relative", zIndex: 1, background: `linear-gradient(transparent, ${colors.bg}ee, ${colors.bg})` }}>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.05), fontWeight: 800, color: colors.text, lineHeight: 1.15, marginBottom: 12 }}>
          {brief.headline}
        </div>
        {brief.subheadline && (
          <div style={{ display: "flex", fontSize: Math.round(width * 0.025), color: colors.text, opacity: 0.75, lineHeight: 1.4, marginBottom: 20 }}>
            {brief.subheadline}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {brief.cta && (
            <div style={{ display: "flex", backgroundColor: colors.primary, color: colors.bg, padding: "14px 36px", borderRadius: 6, fontSize: Math.round(width * 0.024), fontWeight: 700 }}>
              {brief.cta}
            </div>
          )}
          <div style={{ display: "flex", fontSize: Math.round(width * 0.018), color: colors.primary, fontWeight: 600 }}>
            {brand.brandOverview.name}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Layout: Minimal ──
function Minimal({ brief, brand, width, height }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width, height, backgroundColor: colors.bg, padding: "80px 60px" }}>
      <div style={{ display: "flex", width: 48, height: 3, backgroundColor: colors.primary, marginBottom: 40 }} />
      <div style={{ display: "flex", fontSize: Math.round(width * 0.058), fontWeight: 800, color: colors.text, lineHeight: 1.2, marginBottom: 20, textAlign: "center" as const }}>
        {brief.headline}
      </div>
      {brief.subheadline && (
        <div style={{ display: "flex", fontSize: Math.round(width * 0.026), color: colors.text, opacity: 0.6, lineHeight: 1.5, marginBottom: 36, textAlign: "center" as const, maxWidth: "75%" }}>
          {brief.subheadline}
        </div>
      )}
      {brief.cta && (
        <div style={{ display: "flex", border: `2px solid ${colors.primary}`, color: colors.primary, padding: "14px 40px", borderRadius: 6, fontSize: Math.round(width * 0.024), fontWeight: 600 }}>
          {brief.cta}
        </div>
      )}
      <div style={{ display: "flex", position: "absolute", bottom: 32, fontSize: Math.round(width * 0.016), color: colors.text, opacity: 0.35, letterSpacing: 3, textTransform: "uppercase" as const }}>
        {brand.brandOverview.name}
      </div>
    </div>
  );
}

// ── Layout: Bold Text ──
function BoldText({ brief, brand, width, height, backgroundUrl }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  return (
    <div style={{ display: "flex", flexDirection: "column", width, height, backgroundColor: colors.primary, position: "relative", overflow: "hidden" }}>
      {backgroundUrl && (
        <img src={backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover", opacity: 0.15 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.075), fontWeight: 900, color: colors.bg, lineHeight: 1.05, marginBottom: 20, textTransform: "uppercase" as const }}>
          {brief.headline}
        </div>
        {brief.subheadline && (
          <div style={{ display: "flex", fontSize: Math.round(width * 0.028), color: colors.bg, opacity: 0.8, lineHeight: 1.4, marginBottom: 32, maxWidth: "80%" }}>
            {brief.subheadline}
          </div>
        )}
        {brief.cta && (
          <div style={{ display: "flex", backgroundColor: colors.bg, color: colors.primary, padding: "16px 40px", borderRadius: 8, fontSize: Math.round(width * 0.026), fontWeight: 700, width: "fit-content" }}>
            {brief.cta}
          </div>
        )}
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 24, right: 32, fontSize: Math.round(width * 0.018), color: colors.bg, opacity: 0.5 }}>
        {brand.brandOverview.name}
      </div>
    </div>
  );
}

// ── Layout: Comparison ──
function Comparison({ brief, brand, width, height }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  const half = Math.round(width * 0.5);
  return (
    <div style={{ display: "flex", flexDirection: "row", width, height, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: half, height, backgroundColor: "#1a1a1e", padding: "40px 32px" }}>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.022), fontWeight: 700, color: "#ff4444", marginBottom: 16, textTransform: "uppercase" as const }}>
          Others
        </div>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.03), color: "#888", lineHeight: 1.4, textAlign: "center" as const }}>
          {brief.subheadline || "Generic experience"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: width - half, height, backgroundColor: colors.bg, padding: "40px 32px" }}>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.022), fontWeight: 700, color: colors.primary, marginBottom: 16, textTransform: "uppercase" as const }}>
          {brand.brandOverview.name}
        </div>
        <div style={{ display: "flex", fontSize: Math.round(width * 0.035), fontWeight: 800, color: colors.text, lineHeight: 1.3, textAlign: "center" as const, marginBottom: 24 }}>
          {brief.headline}
        </div>
        {brief.cta && (
          <div style={{ display: "flex", backgroundColor: colors.primary, color: colors.bg, padding: "12px 28px", borderRadius: 6, fontSize: Math.round(width * 0.02), fontWeight: 700 }}>
            {brief.cta}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Layout: Testimonial ──
function Testimonial({ brief, brand, width, height, backgroundUrl }: TemplateProps): React.ReactElement {
  const colors = getColors(brief, brand);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width, height, backgroundColor: colors.bg, position: "relative", overflow: "hidden", padding: "60px 48px" }}>
      {backgroundUrl && (
        <img src={backgroundUrl} style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover", opacity: 0.15 }} />
      )}
      <div style={{ display: "flex", fontSize: Math.round(width * 0.12), color: colors.primary, marginBottom: 16, position: "relative", zIndex: 1 }}>
        &ldquo;
      </div>
      <div style={{ display: "flex", fontSize: Math.round(width * 0.04), fontWeight: 600, color: colors.text, lineHeight: 1.4, textAlign: "center" as const, position: "relative", zIndex: 1, maxWidth: "85%", marginBottom: 24 }}>
        {brief.headline}
      </div>
      {brief.subheadline && (
        <div style={{ display: "flex", fontSize: Math.round(width * 0.022), color: colors.text, opacity: 0.5, position: "relative", zIndex: 1 }}>
          — {brief.subheadline}
        </div>
      )}
      {brief.cta && (
        <div style={{ display: "flex", backgroundColor: colors.primary, color: colors.bg, padding: "14px 36px", borderRadius: 6, fontSize: Math.round(width * 0.022), fontWeight: 700, marginTop: 32, position: "relative", zIndex: 1 }}>
          {brief.cta}
        </div>
      )}
      <div style={{ display: "flex", position: "absolute", bottom: 24, fontSize: Math.round(width * 0.016), color: colors.primary, opacity: 0.6 }}>
        {brand.brandOverview.name}
      </div>
    </div>
  );
}

// ── Layout Router ──

const LAYOUTS: Record<string, (props: TemplateProps) => React.ReactElement> = {
  "hero-center": HeroCenter,
  "split-left": SplitLeft,
  "split-right": SplitRight,
  "stacked": Stacked,
  "minimal": Minimal,
  "bold-text": BoldText,
  "comparison": Comparison,
  "testimonial": Testimonial,
};

export function renderTemplate(props: TemplateProps): React.ReactElement {
  const Layout = LAYOUTS[props.brief.layout] || HeroCenter;
  return Layout(props);
}

export const LAYOUT_OPTIONS = Object.keys(LAYOUTS);
