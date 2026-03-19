"use client";

import { useState } from "react";
import Image from "next/image";

interface Ad {
  id: string;
  file: string;
  headline: string;
  category: string;
  tags: string[];
}

interface GalleryProps {
  ads: Ad[];
  categories: Record<string, string>;
}

export function Gallery({ ads, categories }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const filtered =
    activeCategory === "all"
      ? ads
      : ads.filter((ad) => ad.category === activeCategory);

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-10 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === "all"
              ? "bg-cherry text-cream shadow-lg shadow-cherry/20"
              : "bg-cream-warm text-bark/60 hover:text-cherry border border-cherry/10"
          }`}
        >
          All ({ads.length})
        </button>
        {Object.entries(categories).map(([key, label]) => {
          const count = ads.filter((a) => a.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === key
                  ? "bg-cherry text-cream shadow-lg shadow-cherry/20"
                  : "bg-cream-warm text-bark/60 hover:text-cherry border border-cherry/10"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
        {filtered.map((ad) => (
          <div
            key={ad.id}
            className="ad-card group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm border border-cherry/5 animate-fade-up"
            onClick={() => setSelectedAd(ad)}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={ad.file}
                alt={ad.headline}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-bark leading-snug line-clamp-2">
                {ad.headline}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-cherry/60 bg-cherry/5 px-2 py-1 rounded-full">
                  {categories[ad.category]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedAd(null)}
        >
          <div className="absolute inset-0 bg-bark/80 backdrop-blur-sm" />
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={selectedAd.file}
                alt={selectedAd.headline}
                fill
                className="object-cover"
                sizes="512px"
              />
            </div>
            <div className="p-6">
              <h3 className="font-display text-cherry text-xl leading-snug">
                {selectedAd.headline}
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedAd.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-bark/50 bg-cream px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <a
                  href={selectedAd.file}
                  download={`${selectedAd.id}.png`}
                  className="flex-1 bg-cherry text-cream text-center py-3 rounded-xl font-medium text-sm hover:bg-cherry-dark transition-colors"
                >
                  Download PNG
                </a>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-bark/60 border border-cherry/10 hover:bg-cream transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
