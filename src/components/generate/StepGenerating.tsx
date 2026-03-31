"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GeneratedAd } from "@/lib/types";

interface Props {
  generated: GeneratedAd[];
  totalCount: number;
  currentTemplate: string;
  onAbort: () => void;
}

export function StepGenerating({ generated, totalCount, currentTemplate, onAbort }: Props) {
  return (
    <motion.div key="generating" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass rounded-2xl p-8 mb-10 glow-gold-subtle">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <svg className="w-5 h-5 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <p className="text-ivory font-medium">Generating ({generated.length + 1} of {totalCount})</p>
            <p className="text-sm text-silver">{currentTemplate.replace(/-/g, " ")}</p>
          </div>
          <button onClick={onAbort} className="ml-auto text-xs text-silver hover:text-amber transition-colors">Stop</button>
        </div>
        <div className="w-full h-1.5 bg-graphite rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
            animate={{ width: `${(generated.length / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Live preview of generated ads */}
      {generated.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {generated.map((ad, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="rounded-xl overflow-hidden glass">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={ad.imageUrl} alt={ad.headline} fill className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw" unoptimized />
              </div>
              <div className="p-3">
                <p className="text-[10px] text-gold/60 font-medium uppercase tracking-wider">{ad.templateName.replace(/-/g, " ")}</p>
                <p className="text-xs text-ivory leading-snug line-clamp-1 mt-0.5">{ad.headline}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
