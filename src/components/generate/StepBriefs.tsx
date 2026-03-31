"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreativeBrief } from "@/lib/types";
import { TEMPLATES, AD_FORMATS, AdFormat } from "@/lib/templates";

// Mini layout icons for template previews
const templateIcons: Record<string, string> = {
  "hero-headline": "▓▓▓\n▓▓▓\n███",
  "bold-statement": "━━━\nTXT\n━━━",
  "stat-callout": "###\ntxt\n━━━",
  "split-compare": "▌ ▐",
  "testimonial-card": "★★★\n\" \"\ntxt",
  "problem-solution": "✗✗✗\n───\n✓✓✓",
  "three-step": "①②③",
  "trust-authority": "▓▓▓\n███",
  "facility-showcase": "▓▓▓\ntxt▓",
  "product-spotlight": "txt\n[■]\ntxt",
  "ugc-style": "▓▓▓\ntxt▓",
  "offer-banner": "!!!\nTXT\n[→]",
  "social-proof-wall": "★★★\n───\n───",
  "feature-grid": "■ ■\n■ ■",
  "lifestyle-blend": "▓▓▓\ntxt▓",
  "myth-buster": "✗✗✗\n───\n✓✓✓",
  "checklist": "☑☑☑\n☑☑☑",
  "countdown": "!!!\n⏱⏱\n[→]",
  "faq-objection": "Q?\n───\nA!",
  "risk-reversal": "◉\nTXT\n━━━",
  "price-comparison": "$$ $$\nvs",
  "founder-story": "\" \"\ntxt▓",
  "app-mockup": "txt\n[📱]\ntxt",
};

interface Props {
  briefs: CreativeBrief[];
  selectedBriefs: number[];
  onToggleBrief: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateBrief: (id: number, updates: Partial<CreativeBrief>) => void;
  selectedFormats: AdFormat[];
  onToggleFormat: (format: AdFormat) => void;
  onGenerate: () => void;
}

export function StepBriefs({
  briefs, selectedBriefs, onToggleBrief, onSelectAll, onDeselectAll,
  onUpdateBrief, selectedFormats, onToggleFormat, onGenerate,
}: Props) {
  const [editingBrief, setEditingBrief] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = ["all", ...new Set(briefs.map((b) => b.category))];
  const filteredBriefs = filterCategory === "all" ? briefs : briefs.filter((b) => b.category === filterCategory);

  const costPerAd = 0.06;
  const totalAds = selectedBriefs.length * selectedFormats.length;
  const estimatedCost = totalAds * costPerAd;

  return (
    <motion.div key="selecting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl text-ivory mb-2">Pick your ads.</h1>
          <p className="text-silver">
            {selectedBriefs.length} of {briefs.length} selected
            <span className="text-gold ml-2">{totalAds} total images</span>
            <span className="text-silver ml-2">~${estimatedCost.toFixed(2)}</span>
          </p>
        </div>
        <button onClick={selectedBriefs.length === briefs.length ? onDeselectAll : onSelectAll}
          className="text-sm text-gold hover:text-gold-light transition-colors">
          {selectedBriefs.length === briefs.length ? "Deselect All" : `Select All ${briefs.length}`}
        </button>
      </div>

      {/* Format selector */}
      <div className="glass rounded-xl p-4 mb-6">
        <p className="text-xs text-silver mb-3 font-medium tracking-wider uppercase">Output Formats</p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(AD_FORMATS) as AdFormat[]).map((fmt) => (
            <button key={fmt} onClick={() => onToggleFormat(fmt)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                selectedFormats.includes(fmt)
                  ? "glass-gold border-gold/30 text-gold"
                  : "glass text-silver hover:text-ivory"
              }`}>
              <span>{AD_FORMATS[fmt].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
              filterCategory === cat ? "bg-gold text-obsidian" : "glass text-silver hover:text-ivory"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Brief cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-10">
        {filteredBriefs.map((brief) => {
          const template = TEMPLATES.find((t) => t.id === brief.templateId);
          const isSelected = selectedBriefs.includes(brief.id);
          const isEditing = editingBrief === brief.id;

          return (
            <motion.div key={brief.id} layout className={`rounded-xl border transition-all ${
              isSelected ? "glass-gold border-gold/30" : "glass border-transparent hover:border-ivory/10"
            }`}>
              {/* Card header — click to select */}
              <button onClick={() => onToggleBrief(brief.id)} className="w-full text-left p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isSelected ? "bg-gold border-gold" : "border-ash"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {/* Mini layout preview */}
                  <div className="w-10 h-12 rounded-md bg-obsidian border border-ash/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <span className="text-[7px] text-gold/60 leading-none whitespace-pre text-center font-mono">
                      {templateIcons[brief.templateId] || "▓▓▓"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gold/10 text-gold font-medium capitalize">{brief.category}</span>
                      <span className="text-[10px] text-ash">{template?.name || brief.templateId}</span>
                    </div>
                    <p className="text-sm font-medium text-ivory leading-tight">{brief.headline}</p>
                    <p className="text-xs text-silver mt-1 line-clamp-2">{brief.subhead}</p>
                    <p className="text-[10px] text-gold/60 mt-1.5">{brief.cta} &middot; {brief.copy_framework}</p>
                  </div>
                </div>
              </button>

              {/* Edit toggle */}
              <div className="px-4 pb-3">
                <button onClick={() => setEditingBrief(isEditing ? null : brief.id)}
                  className="text-[10px] text-silver hover:text-gold transition-colors">
                  {isEditing ? "Close editor" : "Edit brief"}
                </button>
              </div>

              {/* Inline editor */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-ivory/5">
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-[10px] text-silver mb-1 block">Headline</label>
                        <input value={brief.headline} onChange={(e) => onUpdateBrief(brief.id, { headline: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian border border-ash text-ivory text-xs focus:outline-none focus:border-gold/30" />
                      </div>
                      <div>
                        <label className="text-[10px] text-silver mb-1 block">Subhead</label>
                        <textarea value={brief.subhead} onChange={(e) => onUpdateBrief(brief.id, { subhead: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian border border-ash text-ivory text-xs focus:outline-none focus:border-gold/30 resize-none" rows={2} />
                      </div>
                      <div>
                        <label className="text-[10px] text-silver mb-1 block">CTA</label>
                        <input value={brief.cta} onChange={(e) => onUpdateBrief(brief.id, { cta: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian border border-ash text-ivory text-xs focus:outline-none focus:border-gold/30" />
                      </div>
                      {/* Headline variants */}
                      {brief.headline_variants?.length > 0 && (
                        <div>
                          <label className="text-[10px] text-silver mb-1 block">Headline variants (click to use)</label>
                          <div className="space-y-1">
                            {brief.headline_variants.map((variant, i) => (
                              <button key={i} onClick={() => onUpdateBrief(brief.id, { headline: variant })}
                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all ${
                                  variant === brief.headline ? "bg-gold/10 text-gold" : "hover:bg-ivory/5 text-silver hover:text-ivory"
                                }`}>
                                {variant}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <button onClick={onGenerate} disabled={selectedBriefs.length === 0 || selectedFormats.length === 0}
        className="w-full py-5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
        Generate {totalAds} Ad{totalAds !== 1 ? "s" : ""}
      </button>
    </motion.div>
  );
}
