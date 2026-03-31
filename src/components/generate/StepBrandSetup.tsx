"use client";

import { motion } from "framer-motion";
import { BusinessType, BUSINESS_TYPES, SavedCampaign, GeneratedAd } from "@/lib/types";

interface Props {
  brandName: string;
  setBrandName: (v: string) => void;
  brandUrl: string;
  setBrandUrl: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  businessType: BusinessType;
  setBusinessType: (v: BusinessType) => void;
  onStart: () => void;
  savedCampaigns: SavedCampaign[];
  onLoadCampaign: (campaign: SavedCampaign) => void;
}

export function StepBrandSetup({
  brandName, setBrandName, brandUrl, setBrandUrl,
  product, setProduct, businessType, setBusinessType,
  onStart, savedCampaigns, onLoadCampaign,
}: Props) {
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
