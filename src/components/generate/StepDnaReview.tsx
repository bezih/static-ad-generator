"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BrandDna, ClassifiedAsset, BusinessType, BUSINESS_TYPES } from "@/lib/types";

interface Props {
  brandDna: BrandDna;
  onUpdateDna: (dna: BrandDna) => void;
  classifiedAssets: ClassifiedAsset[];
  onUpdateAssets: (assets: ClassifiedAsset[]) => void;
  businessType: BusinessType;
  onUpdateBusinessType: (bt: BusinessType) => void;
  onConfirm: () => void;
}

export function StepDnaReview({
  brandDna, onUpdateDna, classifiedAssets, onUpdateAssets,
  businessType, onUpdateBusinessType, onConfirm,
}: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateColor = (field: string, value: string) => {
    onUpdateDna({
      ...brandDna,
      visualIdentity: { ...brandDna.visualIdentity, [field]: value },
    });
  };

  const updateOverview = (field: string, value: string) => {
    onUpdateDna({
      ...brandDna,
      brandOverview: { ...brandDna.brandOverview, [field]: value },
    });
  };

  const cycleAssetType = (index: number) => {
    const types: ClassifiedAsset["type"][] = ["product", "portrait", "facility", "logo", "screenshot", "other"];
    const current = classifiedAssets[index].type;
    const nextIdx = (types.indexOf(current) + 1) % types.length;
    const updated = [...classifiedAssets];
    updated[index] = { ...updated[index], type: types[nextIdx] };
    onUpdateAssets(updated);
  };

  const removeAsset = (index: number) => {
    onUpdateAssets(classifiedAssets.filter((_, i) => i !== index));
  };

  const colorFields = [
    { key: "primaryColor", label: "Primary" },
    { key: "secondaryColor", label: "Secondary" },
    { key: "accentColor", label: "Accent" },
    { key: "backgroundColor", label: "Background" },
  ];

  return (
    <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h1 className="font-display text-4xl text-ivory mb-2">Review your brand DNA.</h1>
      <p className="text-silver mb-8">Click any field to edit. Fix anything that looks off.</p>

      <div className="space-y-6 max-w-3xl">
        {/* Business Type */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Business Type</h3>
          <div className="flex gap-2 flex-wrap">
            {BUSINESS_TYPES.map((bt) => (
              <button key={bt.value} onClick={() => onUpdateBusinessType(bt.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                  businessType === bt.value ? "glass-gold border-gold/30 text-gold" : "glass text-silver hover:text-ivory"
                }`}>
                <span>{bt.icon}</span>
                <span>{bt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Overview */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Brand Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "voiceTone", label: "Voice & Tone" },
              { key: "targetAudience", label: "Target Audience" },
              { key: "industry", label: "Industry" },
              { key: "tagline", label: "Tagline" },
            ].map(({ key, label }) => (
              <div key={key}>
                <p className="text-silver text-xs mb-1">{label}</p>
                {editingField === key ? (
                  <input
                    autoFocus
                    value={(brandDna.brandOverview as Record<string, string>)[key] || ""}
                    onChange={(e) => updateOverview(key, e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gold/30 text-ivory text-sm focus:outline-none"
                  />
                ) : (
                  <p
                    onClick={() => setEditingField(key)}
                    className="text-ivory text-sm cursor-pointer hover:text-gold transition-colors truncate"
                    title="Click to edit"
                  >
                    {(brandDna.brandOverview as Record<string, string>)[key] || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Brand Colors</h3>
          <div className="flex gap-4 flex-wrap">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={(brandDna.visualIdentity as Record<string, string>)[key] || "#000000"}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-ivory/10 hover:border-gold/40 transition-all"
                    style={{ background: (brandDna.visualIdentity as Record<string, string>)[key] }}
                  />
                </label>
                <div>
                  <p className="text-xs text-silver">{label}</p>
                  <p className="text-xs text-ivory font-mono">{(brandDna.visualIdentity as Record<string, string>)[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unique Advantage */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">Competitive Advantage</h3>
          {editingField === "uniqueAdvantage" ? (
            <textarea
              autoFocus
              value={brandDna.advertisingStyle.uniqueAdvantage}
              onChange={(e) => onUpdateDna({ ...brandDna, advertisingStyle: { ...brandDna.advertisingStyle, uniqueAdvantage: e.target.value } })}
              onBlur={() => setEditingField(null)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gold/30 text-ivory text-sm focus:outline-none resize-none"
              rows={3}
            />
          ) : (
            <p onClick={() => setEditingField("uniqueAdvantage")} className="text-ivory text-sm cursor-pointer hover:text-gold transition-colors">
              {brandDna.advertisingStyle.uniqueAdvantage || "Click to add..."}
            </p>
          )}
        </div>

        {/* Classified Assets */}
        {classifiedAssets.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-gold font-semibold text-sm tracking-wider uppercase mb-4">
              Detected Assets ({classifiedAssets.length})
            </h3>
            <p className="text-silver text-xs mb-4">Click the label to reclassify. Click X to remove.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {classifiedAssets.map((asset, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-graphite">
                    <Image src={asset.url} alt="" width={120} height={120} className="object-cover w-full h-full" unoptimized />
                  </div>
                  <button
                    onClick={() => cycleAssetType(i)}
                    className="mt-1.5 w-full text-[10px] px-2 py-1 rounded-md bg-graphite text-pearl hover:bg-gold/20 hover:text-gold transition-all text-center"
                  >
                    {asset.type}
                  </button>
                  <button
                    onClick={() => removeAsset(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-obsidian border border-ash text-silver hover:text-red-400 hover:border-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onConfirm}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
          Looks Good — Start Research
        </button>
      </div>
    </motion.div>
  );
}
