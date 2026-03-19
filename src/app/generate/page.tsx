"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import templates from "@/data/templates.json";

type Step = "input" | "research" | "prompts" | "generating" | "done";

interface AgentState {
  id: string;
  name: string;
  icon: string;
  status: "waiting" | "running" | "done";
  findings: string[];
}

interface GeneratedAd {
  templateName: string;
  headline: string;
  imageUrl: string;
}

const initialAgents: AgentState[] = [
  { id: "pain", name: "Pain Point Analyst", icon: "🔍", status: "waiting", findings: [] },
  { id: "psych", name: "Behavioral Psychologist", icon: "🧠", status: "waiting", findings: [] },
  { id: "copy", name: "Conversion Copywriter", icon: "✍️", status: "waiting", findings: [] },
  { id: "creative", name: "Creative Director", icon: "🎨", status: "waiting", findings: [] },
  { id: "market", name: "Market Intelligence", icon: "📊", status: "waiting", findings: [] },
];

const agentFindings: Record<string, string[]> = {
  pain: [
    "Analyzing Reddit r/pharmacy for chain complaints...",
    "Top pain: 45-minute waits for 'ready' prescriptions",
    "Lost prescriptions trigger immediate switching",
    "Phone hold times average 20+ minutes at chains",
    "Staff turnover means nobody knows the patient",
    "Price surprises at counter cause rage and distrust",
  ],
  psych: [
    "Researching switching behavior triggers...",
    "Final straw: prescription not ready after being told it was (2x+)",
    "Biggest barrier: patients think transferring is complicated",
    "Key hook: 'We handle everything — one phone call'",
    "'I wish I switched years ago' — #1 post-switch sentiment",
    "Free delivery eliminates the last convenience objection",
  ],
  copy: [
    "Analyzing high-converting healthcare ad formulas...",
    "Headline formula: Lead with frustration, not features",
    "PAS framework: Problem → Agitate → Solve",
    "Specificity beats generality: '5 minutes' > 'fast service'",
    "One ad = one message = one CTA for max conversion",
    "10-15% CTR achievable with proper targeting + copy",
  ],
  creative: [
    "Reviewing brand assets and template effectiveness...",
    "Kill generic taglines — they convert at near zero",
    "Myth-buster and how-it-works templates rank highest",
    "Us-vs-them comparison layouts drive emotional response",
    "Typography-only ads outperform stock imagery for bold claims",
    "Insurance messaging addresses the #1 silent objection",
  ],
  market: [
    "Analyzing local market demographics and competitors...",
    "Identifying pharmacy deserts in surrounding areas",
    "Chain closures (Rite Aid bankruptcy, CVS/Walgreens cuts) = displaced patients",
    "Working-class demographic responds to trust and affordability messaging",
    "Co-location advantages are unique and defensible differentiators",
    "Local geographic callouts build instant credibility",
  ],
};

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("input");
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [product, setProduct] = useState("");
  const [agents, setAgents] = useState<AgentState[]>(initialAgents);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [generated, setGenerated] = useState<GeneratedAd[]>([]);
  const [genIndex, setGenIndex] = useState(0);
  const [previewAd, setPreviewAd] = useState<GeneratedAd | null>(null);

  const runAgents = useCallback(async () => {
    setStep("research");
    const agentIds = ["pain", "psych", "copy", "creative", "market"];

    for (let a = 0; a < agentIds.length; a++) {
      const agentId = agentIds[a];

      setAgents((prev) =>
        prev.map((ag) =>
          ag.id === agentId ? { ...ag, status: "running" } : ag
        )
      );

      const findings = agentFindings[agentId];
      for (let f = 0; f < findings.length; f++) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        setAgents((prev) =>
          prev.map((ag) =>
            ag.id === agentId
              ? { ...ag, findings: findings.slice(0, f + 1) }
              : ag
          )
        );
      }

      setAgents((prev) =>
        prev.map((ag) =>
          ag.id === agentId ? { ...ag, status: "done" } : ag
        )
      );
    }

    await new Promise((r) => setTimeout(r, 800));
    setStep("prompts");
  }, []);

  const generateImages = async () => {
    if (selectedTemplates.length === 0) return;
    setStep("generating");
    setGenerated([]);

    const selected = templates.filter((t) => selectedTemplates.includes(t.id));

    for (let i = 0; i < selected.length; i++) {
      const template = selected[i];
      setGenIndex(i);

      try {
        let prompt = template.prompt;
        if (brandName) {
          prompt = prompt.replace(/Cherry Ruff Pharmacy/g, brandName);
          prompt = prompt.replace(/Cherry Ruff/g, brandName);
        }

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (data.imageUrl) {
          setGenerated((prev) => [
            ...prev,
            {
              templateName: template.template_name,
              headline: template.headline_text,
              imageUrl: data.imageUrl,
            },
          ]);
        }
      } catch {
        console.error(`Failed: ${template.template_name}`);
      }

      if (i < selected.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    setStep("done");
  };

  const toggleTemplate = (id: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (step === "prompts" && selectedTemplates.length === 0) {
      setSelectedTemplates(templates.slice(0, 15).map((t) => t.id));
    }
  }, [step, selectedTemplates.length]);

  return (
    <>
      <Nav />
      <div className="mesh-gradient grid-lines min-h-screen pt-24">
        <div className="max-w-6xl mx-auto px-8 pb-24">

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-16">
            {(["input", "research", "prompts", "generating"] as const).map((s, i) => {
              const labels = ["Brand Input", "Agent Research", "Select Templates", "Generate"];
              const isActive = ["input", "research", "prompts", "generating", "done"].indexOf(step) >= i;
              const isCurrent = step === s || (step === "done" && s === "generating");
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={`w-8 h-px ${isActive ? "bg-gold/40" : "bg-ash"}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-gold text-obsidian"
                          : isActive
                          ? "bg-gold/20 text-gold"
                          : "bg-graphite text-silver"
                      }`}
                    >
                      {isActive && !isCurrent ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-sm hidden sm:block ${
                        isCurrent ? "text-gold font-medium" : isActive ? "text-ivory" : "text-silver"
                      }`}
                    >
                      {labels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Brand Input */}
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="font-display text-4xl md:text-5xl text-ivory mb-3">
                  Tell us about your brand.
                </h1>
                <p className="text-silver text-lg mb-12 max-w-xl">
                  Our agents will research your market, analyze competitors, and
                  build conversion-optimized ad copy.
                </p>

                <div className="glass rounded-2xl p-8 max-w-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-pearl mb-2 font-medium">
                        Brand Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Acme Pharmacy"
                        className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-pearl mb-2 font-medium">
                        Website URL
                      </label>
                      <input
                        type="text"
                        value={brandUrl}
                        onChange={(e) => setBrandUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-pearl mb-2 font-medium">
                        Product / Service
                      </label>
                      <input
                        type="text"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Prescription transfer and delivery service"
                        className="w-full px-5 py-4 rounded-xl bg-obsidian border border-ash text-ivory placeholder:text-ash focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={runAgents}
                    disabled={!brandName.trim()}
                    className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]"
                  >
                    Deploy Research Agents
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Agent Research */}
            {step === "research" && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="font-display text-4xl text-ivory mb-2">
                  Agents are researching{" "}
                  <span className="text-gradient-gold">{brandName}</span>
                </h1>
                <p className="text-silver mb-12">
                  Analyzing competitors, pain points, conversion triggers, and market data.
                </p>

                <div className="space-y-4">
                  {agents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      layout
                      className={`glass rounded-2xl p-6 transition-all ${
                        agent.status === "running" ? "border-gold/30 glow-gold-subtle" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-2xl">{agent.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-ivory font-medium">{agent.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.status === "waiting" && (
                            <span className="text-xs text-ash">Waiting...</span>
                          )}
                          {agent.status === "running" && (
                            <span className="relative flex items-center gap-2 text-xs text-gold">
                              <span className="relative w-2 h-2 rounded-full bg-gold pulse-ring" />
                              Researching
                            </span>
                          )}
                          {agent.status === "done" && (
                            <span className="text-xs text-emerald flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Complete
                            </span>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {agent.findings.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="space-y-1.5 ml-10"
                          >
                            {agent.findings.map((finding, i) => (
                              <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`text-sm ${
                                  i === 0 ? "text-silver" : "text-pearl"
                                }`}
                              >
                                {i === 0 ? "" : "→ "}
                                {finding}
                              </motion.p>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Template Selection */}
            {step === "prompts" && (
              <motion.div
                key="prompts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h1 className="font-display text-4xl text-ivory mb-2">
                      Select your templates.
                    </h1>
                    <p className="text-silver">
                      {selectedTemplates.length} of {templates.length} selected
                      <span className="text-gold ml-2">
                        ~${(selectedTemplates.length * 0.08).toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedTemplates(
                        selectedTemplates.length === templates.length
                          ? []
                          : templates.map((t) => t.id)
                      )
                    }
                    className="text-sm text-gold hover:text-gold-light transition-colors"
                  >
                    {selectedTemplates.length === templates.length
                      ? "Deselect All"
                      : "Select All 40"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-10">
                  {templates.map((t) => (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTemplate(t.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedTemplates.includes(t.id)
                          ? "glass-gold border-gold/30"
                          : "glass border-transparent hover:border-ivory/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            selectedTemplates.includes(t.id)
                              ? "bg-gold border-gold"
                              : "border-ash"
                          }`}
                        >
                          {selectedTemplates.includes(t.id) && (
                            <svg className="w-3 h-3 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ivory capitalize">
                            {t.template_name.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-silver mt-1 line-clamp-2">
                            {t.headline_text}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={generateImages}
                  disabled={selectedTemplates.length === 0}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]"
                >
                  Generate {selectedTemplates.length} Ad
                  {selectedTemplates.length !== 1 ? "s" : ""}
                </button>
              </motion.div>
            )}

            {/* Step 4: Generating */}
            {(step === "generating" || step === "done") && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {step === "generating" && (
                  <div className="glass rounded-2xl p-8 mb-10 glow-gold-subtle">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                        <svg className="w-5 h-5 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-ivory font-medium">
                          Generating ({generated.length + 1} of {selectedTemplates.length})
                        </p>
                        <p className="text-sm text-silver">
                          {templates
                            .find((t) => t.id === selectedTemplates[genIndex])
                            ?.template_name.replace(/_/g, " ") || "..."}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-graphite rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(generated.length / selectedTemplates.length) * 100}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <div className="mb-10">
                    <h1 className="font-display text-4xl text-ivory mb-2">
                      Your campaign is ready.
                    </h1>
                    <p className="text-silver">
                      {generated.length} ads generated for{" "}
                      <span className="text-gold">{brandName}</span>
                    </p>
                  </div>
                )}

                {generated.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {generated.map((ad, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => setPreviewAd(ad)}
                        className="group cursor-pointer rounded-2xl overflow-hidden glass border-transparent hover:border-gold/20 transition-all"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <Image
                            src={ad.imageUrl}
                            alt={ad.headline}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            unoptimized
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">
                            {ad.templateName.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-ivory leading-snug line-clamp-2">
                            {ad.headline}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lightbox */}
          <AnimatePresence>
            {previewAd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                onClick={() => setPreviewAd(null)}
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
                      src={previewAd.imageUrl}
                      alt={previewAd.headline}
                      fill
                      className="object-cover"
                      sizes="512px"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">
                      {previewAd.templateName.replace(/_/g, " ")}
                    </p>
                    <h3 className="font-display text-ivory text-xl leading-snug">
                      {previewAd.headline}
                    </h3>
                    <div className="flex gap-3 mt-6">
                      <a
                        href={previewAd.imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3 rounded-xl font-semibold text-sm"
                      >
                        Download PNG
                      </a>
                      <button
                        onClick={() => setPreviewAd(null)}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors"
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
      </div>
    </>
  );
}
