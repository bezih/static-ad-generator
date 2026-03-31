"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import JSZip from "jszip";
import { GeneratedAd } from "@/lib/types";
import { AD_FORMATS, AdFormat } from "@/lib/templates";

interface Props {
  brandName: string;
  generated: GeneratedAd[];
  onEditAd: (ad: GeneratedAd) => void;
  onNewCampaign: () => void;
  onRegenerateAd: (ad: GeneratedAd) => void;
}

export function StepResults({ brandName, generated, onEditAd, onNewCampaign, onRegenerateAd }: Props) {
  const [previewAd, setPreviewAd] = useState<GeneratedAd | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [isZipping, setIsZipping] = useState(false);

  const categories = ["all", ...new Set(generated.map((a) => a.category))];
  const formats = ["all", ...new Set(generated.map((a) => a.format))];

  const filtered = generated.filter((ad) => {
    if (filterCategory !== "all" && ad.category !== filterCategory) return false;
    if (filterFormat !== "all" && ad.format !== filterFormat) return false;
    return true;
  });

  const downloadAd = async (ad: GeneratedAd) => {
    try {
      const res = await fetch(ad.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ad.templateName}-${ad.format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const downloadAll = async () => {
    if (filtered.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(brandName.replace(/\s+/g, "-").toLowerCase()) || zip;

      await Promise.all(
        filtered.map(async (ad) => {
          try {
            const res = await fetch(ad.imageUrl);
            const blob = await res.blob();
            const filename = `${ad.category}-${ad.templateName}-${ad.format}.png`;
            folder.file(filename, blob);
          } catch {}
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brandName.replace(/\s+/g, "-").toLowerCase()}-ads.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP export failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ivory mb-2">Your campaign is ready.</h1>
          <p className="text-silver">{generated.length} ads generated for <span className="text-gold">{brandName}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadAll} disabled={isZipping}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.4)] transition-all disabled:opacity-60">
            {isZipping ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Zipping...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download ZIP ({filtered.length})
              </>
            )}
          </button>
          <button onClick={onNewCampaign}
            className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors">
            New Campaign
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-silver">Category:</span>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                filterCategory === cat ? "bg-gold text-obsidian font-medium" : "glass text-silver hover:text-ivory"
              }`}>
              {cat}
            </button>
          ))}
        </div>
        {formats.length > 2 && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-silver">Format:</span>
            {formats.map((fmt) => (
              <button key={fmt} onClick={() => setFilterFormat(fmt)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  filterFormat === fmt ? "bg-gold text-obsidian font-medium" : "glass text-silver hover:text-ivory"
                }`}>
                {fmt === "all" ? "All" : AD_FORMATS[fmt as AdFormat]?.label || fmt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ad grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((ad, i) => (
          <motion.div key={`${ad.briefId}-${ad.format}-${i}`}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-2xl overflow-hidden glass border-transparent hover:border-gold/20 transition-all">
            <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => setPreviewAd(ad)}>
              <Image src={ad.imageUrl} alt={ad.headline} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" unoptimized />
              {/* Quality score badge */}
              {ad.qualityScore !== undefined && (
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold ${
                  ad.qualityPass ? "bg-emerald/90 text-white" : "bg-amber/90 text-obsidian"
                }`}>
                  {ad.qualityScore.toFixed(1)} {ad.qualityPass ? "✓" : "⚠"}
                </div>
              )}
              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button onClick={(e) => { e.stopPropagation(); onEditAd(ad); }}
                  className="px-4 py-2 rounded-lg bg-ivory/90 text-obsidian text-xs font-semibold hover:bg-ivory transition-colors">
                  Customize
                </button>
                <button onClick={(e) => { e.stopPropagation(); downloadAd(ad); }}
                  className="px-4 py-2 rounded-lg bg-gold/90 text-obsidian text-xs font-semibold hover:bg-gold transition-colors">
                  Download
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gold/10 text-gold/70 font-medium capitalize">{ad.category}</span>
                <span className="text-[10px] text-ash">{AD_FORMATS[ad.format as AdFormat]?.label || ad.format}</span>
              </div>
              <p className="text-sm text-ivory leading-snug line-clamp-2">{ad.headline}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {previewAd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setPreviewAd(null)}>
            <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.15 }}
              className="relative max-w-lg w-full glass rounded-3xl overflow-hidden glow-gold" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-[4/5]">
                <Image src={previewAd.imageUrl} alt={previewAd.headline} fill className="object-cover" sizes="512px" unoptimized />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gold/10 text-gold/70 font-medium capitalize">{previewAd.category}</span>
                  <span className="text-xs text-ash">{previewAd.templateName.replace(/-/g, " ")}</span>
                </div>
                <h3 className="font-display text-ivory text-xl leading-snug">{previewAd.headline}</h3>
                <p className="text-sm text-silver mt-1">{previewAd.subhead}</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { onEditAd(previewAd); setPreviewAd(null); }}
                    className="flex-1 py-3 rounded-xl border border-gold/30 text-gold text-center font-semibold text-sm hover:bg-gold/10 transition-colors">
                    Customize
                  </button>
                  <button onClick={() => downloadAd(previewAd)}
                    className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3 rounded-xl font-semibold text-sm">
                    Download PNG
                  </button>
                  <button onClick={() => setPreviewAd(null)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
