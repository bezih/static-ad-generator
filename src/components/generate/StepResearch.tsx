"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentState, BrandDna } from "@/lib/types";
import Image from "next/image";

interface Props {
  brandName: string;
  brandDna: BrandDna;
  agents: AgentState[];
  productImages: string[];
  isComplete: boolean;
  userNotes: string;
  setUserNotes: (v: string) => void;
  onContinue: () => void;
}

export function StepResearch({
  brandName, brandDna, agents, productImages,
  isComplete, userNotes, setUserNotes, onContinue,
}: Props) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h1 className="font-display text-4xl text-ivory mb-2">
        Agents researching <span className="text-gradient-gold">{brandName}</span>
      </h1>
      <p className="text-silver mb-4">Industry: {brandDna?.brandOverview?.industry || "Analyzing..."}</p>

      {/* Brand DNA Summary */}
      {brandDna && (
        <div className="glass-gold rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-gold font-semibold text-sm tracking-wider uppercase">Brand DNA Extracted</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-silver mb-1">Voice</p>
              <p className="text-ivory">{brandDna.brandOverview.voiceTone}</p>
            </div>
            <div>
              <p className="text-silver mb-1">Audience</p>
              <p className="text-ivory text-xs">{brandDna.brandOverview.targetAudience.slice(0, 60)}</p>
            </div>
            <div>
              <p className="text-silver mb-1">Colors</p>
              <div className="flex gap-1.5">
                {[brandDna.visualIdentity.primaryColor, brandDna.visualIdentity.secondaryColor, brandDna.visualIdentity.accentColor].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-md border border-ivory/10" style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-silver mb-1">Advantage</p>
              <p className="text-ivory text-xs">{brandDna.advertisingStyle.uniqueAdvantage.slice(0, 60)}</p>
            </div>
          </div>
          {productImages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gold/10">
              <p className="text-silver text-xs mb-2">{productImages.length} images found</p>
              <div className="flex gap-2 overflow-x-auto">
                {productImages.slice(0, 6).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-graphite">
                    <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agent Cards */}
      <div className="space-y-4">
        {agents.map((agent) => (
          <motion.div key={agent.id} layout
            className={`glass rounded-2xl p-6 transition-all ${agent.status === "running" ? "border-gold/30 glow-gold-subtle" : ""}`}>
            <div
              className="flex items-center gap-4 mb-3 cursor-pointer"
              onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
            >
              <div className="text-2xl">{agent.icon}</div>
              <div className="flex-1"><h3 className="text-ivory font-medium">{agent.name}</h3></div>
              {agent.status === "waiting" && <span className="text-xs text-ash">Waiting...</span>}
              {agent.status === "running" && (
                <span className="flex items-center gap-2 text-xs text-gold">
                  <span className="relative w-2 h-2 rounded-full bg-gold pulse-ring" />Researching
                </span>
              )}
              {agent.status === "done" && (
                <span className="text-xs text-emerald flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>Complete
                </span>
              )}
              {agent.status === "error" && <span className="text-xs text-amber">Failed</span>}
              {agent.status === "done" && (
                <svg className={`w-4 h-4 text-silver transition-transform ${expandedAgent === agent.id ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            <AnimatePresence>
              {(agent.status === "running" || expandedAgent === agent.id) && agent.findings.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 ml-10 overflow-hidden">
                  {agent.findings.map((finding, i) => (
                    <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                      className="text-sm text-pearl">
                      → {finding}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* User Notes (visible once agents complete) */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
          <div className="glass rounded-2xl p-6">
            <label className="block text-sm text-pearl mb-2 font-medium">Anything else we should know?</label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="E.g., 'We just opened a second location', 'Our main competitor is XYZ', 'Focus on our free consultation offer'..."
              className="w-full px-4 py-3 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all resize-none text-sm"
              rows={3}
            />
          </div>
          <button onClick={onContinue}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
            Generate Ad Concepts
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
