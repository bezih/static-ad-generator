"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BusinessType, BUSINESS_TYPES, SavedCampaign } from "@/lib/types";

export interface UploadedAsset {
  url: string;
  name: string;
  type: string; // logo, product, portrait, facility, other
}

interface Props {
  brandName: string;
  setBrandName: (v: string) => void;
  brandUrl: string;
  setBrandUrl: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  businessType: BusinessType;
  setBusinessType: (v: BusinessType) => void;
  uploadedAssets: UploadedAsset[];
  setUploadedAssets: (v: UploadedAsset[]) => void;
  onStart: () => void;
  savedCampaigns: SavedCampaign[];
  onLoadCampaign: (campaign: SavedCampaign) => void;
}

export function StepBrandSetup({
  brandName, setBrandName, brandUrl, setBrandUrl,
  product, setProduct, businessType, setBusinessType,
  uploadedAssets, setUploadedAssets,
  onStart, savedCampaigns, onLoadCampaign,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of imageFiles) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.uploaded) {
        setUploadedAssets([...uploadedAssets, ...data.uploaded]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setIsUploading(false);
  };

  const removeAsset = (index: number) => {
    setUploadedAssets(uploadedAssets.filter((_, i) => i !== index));
  };

  const cycleType = (index: number) => {
    const types = ["logo", "product", "portrait", "facility", "other"];
    const current = uploadedAssets[index].type;
    const nextIdx = (types.indexOf(current) + 1) % types.length;
    const updated = [...uploadedAssets];
    updated[index] = { ...updated[index], type: types[nextIdx] };
    setUploadedAssets(updated);
  };

  return (
    <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mb-3">Tell us about your business.</h1>
      <p className="text-silver text-lg mb-12 max-w-xl">
        We&apos;ll analyze your brand, research your market, and generate high-converting ad creatives.
      </p>

      <div className="glass rounded-2xl p-8 max-w-2xl">
        {/* Business Type Selector */}
        <div className="mb-8">
          <label className="block text-sm text-pearl mb-3 font-medium">Business Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                onClick={() => setBusinessType(bt.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                  businessType === bt.value
                    ? "glass-gold border-gold/30"
                    : "border-transparent hover:border-ivory/10 hover:bg-ivory/3"
                }`}
              >
                <span className="text-xl">{bt.icon}</span>
                <span className="text-xs font-medium text-ivory">{bt.label}</span>
                <span className="text-[10px] text-silver leading-tight">{bt.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-pearl mb-2 font-medium">Brand Name <span className="text-gold">*</span></label>
            <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Bright Smile Dental"
              className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm text-pearl mb-2 font-medium">Website URL <span className="text-gold">*</span></label>
            <input type="text" value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} placeholder="https://example.com"
              className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm text-pearl mb-2 font-medium">Product / Service</label>
            <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Optional — we'll infer from your site"
              className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all" />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-pearl mb-2 font-medium">Brand Assets</label>
            <p className="text-xs text-silver mb-3">Upload logo, product photos, team headshots, facility images. Click labels to reclassify.</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-gold/50 bg-gold/5"
                  : "border-ash/50 hover:border-ivory/20 hover:bg-ivory/2"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-gold">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-sm text-silver">Drop images here or <span className="text-gold">browse</span></span>
                  <span className="text-[10px] text-ash">PNG, JPG, WebP up to 10MB each</span>
                </div>
              )}
            </div>

            {/* Uploaded assets grid */}
            {uploadedAssets.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                {uploadedAssets.map((asset, i) => (
                  <div key={i} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-graphite">
                      <Image src={asset.url} alt={asset.name} width={120} height={120} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); cycleType(i); }}
                      className="mt-1.5 w-full text-[10px] px-2 py-1 rounded-md bg-graphite text-pearl hover:bg-gold/20 hover:text-gold transition-all text-center capitalize"
                    >
                      {asset.type}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAsset(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-obsidian border border-ash text-silver hover:text-red-400 hover:border-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={onStart} disabled={!brandName.trim() || !brandUrl.trim()}
          className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
          Analyze Brand
        </button>
      </div>

      {/* Saved Campaigns */}
      {savedCampaigns.length > 0 && (
        <div className="mt-10 max-w-2xl">
          <h3 className="text-sm text-silver font-medium mb-4 tracking-wider uppercase">Previous Campaigns</h3>
          <div className="space-y-2">
            {savedCampaigns.map((c, i) => (
              <button key={i} onClick={() => onLoadCampaign(c)}
                className="w-full flex items-center justify-between p-4 rounded-xl glass hover:border-gold/20 transition-all text-left">
                <div>
                  <p className="text-ivory font-medium">{c.brandName}</p>
                  <p className="text-xs text-silver">{c.ads.length} ads &middot; {new Date(c.date).toLocaleDateString()}</p>
                </div>
                <svg className="w-4 h-4 text-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
