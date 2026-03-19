"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import manifest from "@/data/manifest.json";

interface Ad {
  id: string;
  file: string;
  headline: string;
  category: string;
  tags: string[];
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const ads = manifest.ads as Ad[];
  const categories = manifest.categories as Record<string, string>;

  const filtered =
    activeCategory === "all"
      ? ads
      : ads.filter((ad) => ad.category === activeCategory);

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
              {manifest.brand}
            </h1>
            <p className="mt-4 text-silver text-lg">
              {manifest.ads.length} conversion-optimized static ads &middot;{" "}
              {manifest.location}
            </p>
          </motion.div>

          {/* Filters */}
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
            {Object.entries(categories).map(([key, label]) => {
              const count = ads.filter((a) => a.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === key
                      ? "bg-gold text-obsidian shadow-lg shadow-gold/20"
                      : "glass text-silver hover:text-ivory"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </motion.div>

          {/* Grid */}
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
                    <Image
                      src={ad.file}
                      alt={ad.headline}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-ivory leading-snug line-clamp-2">
                      {ad.headline}
                    </p>
                    <span className="inline-block mt-3 text-xs text-gold/60 bg-gold/5 border border-gold/10 px-2.5 py-1 rounded-full">
                      {categories[ad.category]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
                  <Image
                    src={selectedAd.file}
                    alt={selectedAd.headline}
                    fill
                    className="object-cover"
                    sizes="512px"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-ivory text-xl leading-snug mb-3">
                    {selectedAd.headline}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedAd.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-silver bg-graphite px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={selectedAd.file}
                      download={`${selectedAd.id}.png`}
                      className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.4)]"
                    >
                      Download PNG
                    </a>
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
