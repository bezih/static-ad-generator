"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { GeneratedAd } from "@/lib/types";
import { AD_FORMATS, AdFormat } from "@/lib/templates";

interface Props {
  ad: GeneratedAd;
  brandColors: { primary: string; secondary: string; accent: string; background: string };
  onSave: (updated: GeneratedAd) => void;
  onRegenerate: (ad: GeneratedAd) => void;
  onBack: () => void;
}

export function StepEditor({ ad, brandColors, onSave, onRegenerate, onBack }: Props) {
  const [headline, setHeadline] = useState(ad.headline);
  const [subhead, setSubhead] = useState(ad.subhead);
  const [cta, setCta] = useState(ad.cta);
  const [format, setFormat] = useState<AdFormat>(ad.format as AdFormat);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSave = () => {
    onSave({ ...ad, headline, subhead, cta, format });
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate({ ...ad, headline, subhead, cta, format });
    setIsRegenerating(false);
  };

  return (
    <motion.div key="editing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-silver hover:text-ivory transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to results
        </button>
        <h1 className="font-display text-3xl text-ivory">Customize Ad</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden glass max-w-md w-full">
            <div className="relative aspect-[4/5]">
              <Image src={ad.imageUrl} alt={headline} fill className="object-cover" sizes="400px" unoptimized />
            </div>
          </div>
          <p className="text-xs text-silver mt-3">Current rendered ad — changes will re-render</p>
        </div>

        {/* Editor panel */}
        <div className="space-y-6">
          {/* Text editing */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Ad Copy</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-silver mb-1 block">Headline</label>
                <input value={headline} onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-obsidian border border-ash text-ivory focus:outline-none focus:border-gold/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-silver mb-1 block">Subhead</label>
                <textarea value={subhead} onChange={(e) => setSubhead(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-obsidian border border-ash text-ivory focus:outline-none focus:border-gold/30 transition-all resize-none" rows={3} />
              </div>
              <div>
                <label className="text-xs text-silver mb-1 block">CTA Button</label>
                <input value={cta} onChange={(e) => setCta(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-obsidian border border-ash text-ivory focus:outline-none focus:border-gold/30 transition-all" />
              </div>
            </div>
          </div>

          {/* Format selector */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Output Format</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(AD_FORMATS) as AdFormat[]).map((fmt) => (
                <button key={fmt} onClick={() => setFormat(fmt)}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    format === fmt ? "glass-gold border-gold/30 text-gold font-medium" : "glass text-silver hover:text-ivory"
                  }`}>
                  {AD_FORMATS[fmt].label}
                  <span className="block text-[10px] text-silver mt-0.5">{AD_FORMATS[fmt].width}x{AD_FORMATS[fmt].height}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand colors preview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Brand Colors</h3>
            <div className="flex gap-3">
              {Object.entries(brandColors).map(([key, color]) => (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl border border-ivory/10" style={{ background: color }} />
                  <span className="text-[10px] text-silver capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleRegenerate} disabled={isRegenerating}
              className="flex-1 py-4 rounded-xl border border-gold/30 text-gold font-semibold text-sm hover:bg-gold/10 transition-colors disabled:opacity-50">
              {isRegenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Re-rendering...
                </span>
              ) : "Re-render with Changes"}
            </button>
            <button onClick={handleSave}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.4)] transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
