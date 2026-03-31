"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Nav } from "@/components/Nav";

interface GalleryAd {
  id: string;
  headline: string;
  subhead?: string;
  category: string;
  template_id: string;
  image_url: string;
  format: string;
  quality_score?: number;
}

interface GalleryCampaign {
  id: string;
  brand_name: string;
  logo_url?: string;
  created_at: string;
  ads: GalleryAd[];
}

export default function GalleryPage() {
  const [campaigns, setCampaigns] = useState<GalleryCampaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAd, setSelectedAd] = useState<GalleryAd | null>(null);
  const [loading, setLoading] = useState(true);

  // Load campaigns from Supabase
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        const data = await res.json();
        if (data.campaigns && data.campaigns.length > 0) {
          // Load full campaign details for each
          const detailed: GalleryCampaign[] = [];
          for (const c of data.campaigns.slice(0, 5)) {
            try {
              const detailRes = await fetch(`/api/campaigns?id=${c.id}`);
              const detailData = await detailRes.json();
              if (detailData.campaign) {
                detailed.push({
                  id: c.id,
                  brand_name: c.adforge_brands?.name || "Campaign",
                  logo_url: c.adforge_brands?.logo_url,
                  created_at: c.created_at,
                  ads: (detailData.campaign.adforge_ads || []).map((a: Record<string, unknown>, i: number) => ({
                    id: `${c.id}-${i}`,
                    headline: a.headline as string,
                    subhead: a.subhead as string,
                    category: a.category as string || "general",
                    template_id: a.template_id as string,
                    image_url: a.image_url as string,
                    format: a.format as string || "feed",
                    quality_score: a.quality_score as number,
                  })),
                });
              }
            } catch {}
          }
          setCampaigns(detailed);
          if (detailed.length > 0) setActiveCampaign(detailed[0].id);
        }
      } catch {}
      setLoading(false);
    }
    loadCampaigns();
  }, []);

  const currentCampaign = campaigns.find((c) => c.id === activeCampaign);
  const ads = currentCampaign?.ads || [];
  const categories = [...new Set(ads.map((a) => a.category))];
  const filtered = activeCategory === "all" ? ads : ads.filter((a) => a.category === activeCategory);

  return (
    <>
      <Nav />
      <div className="mesh-gradient grid-lines min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-8 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">
              Campaign Gallery
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-ivory leading-[1.05]">
              {currentCampaign?.brand_name || "Your Campaigns"}
            </h1>
            <p className="mt-4 text-silver text-lg">
              {ads.length > 0
                ? `${ads.length} ads generated`
                : loading ? "Loading campaigns..." : "No campaigns yet. Generate your first ads."}
            </p>
          </motion.div>

          {/* Campaign tabs */}
          {campaigns.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCampaign(c.id); setActiveCategory("all"); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCampaign === c.id
                      ? "bg-gold text-obsidian"
                      : "glass text-silver hover:text-ivory"
                  }`}
                >
                  {c.brand_name}
                </button>
              ))}
            </div>
          )}

          {/* Category filters */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-gold text-obsidian shadow-lg shadow-gold/20"
                    : "glass text-silver hover:text-ivory"
                }`}
              >
                All ({ads.length})
              </button>
              {categories.map((cat) => {
                const count = ads.filter((a) => a.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all ${
                      activeCategory === cat
                        ? "bg-gold text-obsidian shadow-lg shadow-gold/20"
                        : "glass text-silver hover:text-ivory"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && campaigns.length === 0 && (
            <div className="glass rounded-2xl p-16 text-center max-w-lg mx-auto">
              <div className="text-6xl mb-6">🎨</div>
              <h2 className="font-display text-2xl text-ivory mb-3">No campaigns yet</h2>
              <p className="text-silver mb-6">Generate your first ad campaign to see it here.</p>
              <a href="/generate" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm">
                Start Generating
              </a>
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((ad, i) => (
                  <motion.div
                    key={ad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedAd(ad)}
                    className="group cursor-pointer rounded-2xl overflow-hidden glass border-transparent hover:border-gold/20 transition-colors"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {ad.image_url ? (
                        <Image
                          src={ad.image_url}
                          alt={ad.headline}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-graphite flex items-center justify-center text-silver text-sm">No image</div>
                      )}
                      {/* Quality badge */}
                      {ad.quality_score && (
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold ${
                          ad.quality_score >= 7 ? "bg-emerald/90 text-white" : "bg-amber/90 text-obsidian"
                        }`}>
                          {ad.quality_score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-ivory leading-snug line-clamp-2">
                        {ad.headline}
                      </p>
                      <span className="inline-block mt-3 text-xs text-gold/60 bg-gold/5 border border-gold/10 px-2.5 py-1 rounded-full capitalize">
                        {ad.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedAd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedAd(null)}
            >
              <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.15 }}
                className="relative max-w-lg w-full glass rounded-3xl overflow-hidden glow-gold"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-[4/5]">
                  {selectedAd.image_url && (
                    <Image
                      src={selectedAd.image_url}
                      alt={selectedAd.headline}
                      fill
                      className="object-cover"
                      sizes="512px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-ivory text-xl leading-snug mb-1">
                    {selectedAd.headline}
                  </h3>
                  {selectedAd.subhead && (
                    <p className="text-sm text-silver mb-4">{selectedAd.subhead}</p>
                  )}
                  <div className="flex gap-2 mb-6">
                    <span className="text-xs text-gold/60 bg-gold/5 border border-gold/10 px-2.5 py-1 rounded-full capitalize">{selectedAd.category}</span>
                    <span className="text-xs text-silver bg-graphite px-2.5 py-1 rounded-full">{selectedAd.template_id.replace(/-/g, " ")}</span>
                  </div>
                  <div className="flex gap-3">
                    {selectedAd.image_url && (
                      <a
                        href={selectedAd.image_url}
                        download={`${selectedAd.template_id}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3.5 rounded-xl font-semibold text-sm"
                      >
                        Download PNG
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedAd(null)}
                      className="px-6 py-3.5 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
