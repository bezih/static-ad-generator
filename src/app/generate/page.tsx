"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Nav } from "@/components/Nav";

type Step = "input" | "scraping" | "research" | "prompts" | "selecting" | "generating" | "done";

interface BrandDna {
  brandOverview: {
    name: string;
    website: string;
    tagline: string;
    mission: string;
    targetAudience: string;
    voiceTone: string;
    industry: string;
  };
  visualIdentity: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontStyle: string;
    mood: string;
  };
  productDetails: {
    productName: string;
    category: string;
    keyFeatures: string[];
    keyBenefits: string[];
    pricePoint: string;
    packagingDescription: string;
  };
  advertisingStyle: {
    adTone: string;
    messagingThemes: string[];
    competitors: string[];
    uniqueAdvantage: string;
  };
}

interface AgentState {
  id: string;
  name: string;
  icon: string;
  status: "waiting" | "running" | "done" | "error";
  findings: string[];
}

interface PromptData {
  id: number;
  template_name: string;
  prompt: string;
  headline_text: string;
  category: string;
}

interface GeneratedAd {
  templateName: string;
  headline: string;
  imageUrl: string;
  category: string;
}

const AGENTS: AgentState[] = [
  { id: "pain", name: "Pain Point Analyst", icon: "🔍", status: "waiting", findings: [] },
  { id: "psych", name: "Behavioral Psychologist", icon: "🧠", status: "waiting", findings: [] },
  { id: "copy", name: "Conversion Copywriter", icon: "✍️", status: "waiting", findings: [] },
  { id: "creative", name: "Creative Director", icon: "🎨", status: "waiting", findings: [] },
  { id: "market", name: "Market Intelligence", icon: "📊", status: "waiting", findings: [] },
];

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("input");
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [product, setProduct] = useState("");
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [agents, setAgents] = useState<AgentState[]>(AGENTS.map((a) => ({ ...a })));
  const [allFindings, setAllFindings] = useState<Record<string, string[]>>({});
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [generated, setGenerated] = useState<GeneratedAd[]>([]);
  const [genIndex, setGenIndex] = useState(0);
  const [previewAd, setPreviewAd] = useState<GeneratedAd | null>(null);
  const [error, setError] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState("");
  const abortRef = useRef(false);

  // --- Step 1: Scrape website + build brand DNA ---
  const startScrape = async () => {
    if (!brandName.trim()) return;
    setError("");
    setStep("scraping");
    setScrapeStatus("Fetching website and analyzing brand identity...");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: brandUrl.startsWith("http") ? brandUrl : `https://${brandUrl}`,
          brandName,
          product,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBrandDna(data.brandDna);
      setProductImages(data.productImages || []);
      setScrapeStatus("");

      // Move to agent research
      runAgents(data.brandDna);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape website");
      setStep("input");
    }
  };

  // --- Step 2: Run all 5 agents ---
  const runAgents = async (dna: BrandDna) => {
    setStep("research");
    const agentIds = ["pain", "psych", "copy", "creative", "market"];
    const findings: Record<string, string[]> = {};

    // Run agents in parallel (2-3 at a time to avoid rate limits)
    for (let batch = 0; batch < agentIds.length; batch += 2) {
      const batchIds = agentIds.slice(batch, batch + 2);

      // Mark batch as running
      setAgents((prev) =>
        prev.map((ag) =>
          batchIds.includes(ag.id) ? { ...ag, status: "running", findings: ["Analyzing..."] } : ag
        )
      );

      const batchResults = await Promise.allSettled(
        batchIds.map(async (agentId) => {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentType: agentId, brandDna: dna }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          return { agentId, findings: data.findings };
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          const { agentId, findings: agentFindings } = result.value;
          findings[agentId] = agentFindings;
          setAgents((prev) =>
            prev.map((ag) =>
              ag.id === agentId
                ? { ...ag, status: "done", findings: agentFindings }
                : ag
            )
          );
        } else {
          const failedId = batchIds[batchResults.indexOf(result)];
          setAgents((prev) =>
            prev.map((ag) =>
              ag.id === failedId
                ? { ...ag, status: "error", findings: ["Research failed — using defaults"] }
                : ag
            )
          );
        }
      }
    }

    setAllFindings(findings);

    // Move to prompt generation
    await generatePrompts(dna, findings);
  };

  // --- Step 3: Generate prompts ---
  const generatePrompts = async (dna: BrandDna, findings: Record<string, string[]>) => {
    setStep("prompts");

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDna: dna, agentFindings: findings }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPrompts(data.prompts);
      setSelectedTemplates(data.prompts.slice(0, 15).map((p: PromptData) => p.id));
      setStep("selecting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt generation failed");
    }
  };

  // --- Step 4: Generate images ---
  const generateImages = async () => {
    if (selectedTemplates.length === 0) return;
    setStep("generating");
    setGenerated([]);
    abortRef.current = false;

    const selected = prompts.filter((p) => selectedTemplates.includes(p.id));

    for (let i = 0; i < selected.length; i++) {
      if (abortRef.current) break;
      const template = selected[i];
      setGenIndex(i);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: template.prompt }),
        });

        const data = await res.json();
        if (data.imageUrl) {
          setGenerated((prev) => [
            ...prev,
            {
              templateName: template.template_name,
              headline: template.headline_text,
              imageUrl: data.imageUrl,
              category: template.category,
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

  const stepIndex = ["input", "scraping", "research", "prompts", "selecting", "generating", "done"].indexOf(step);
  const stepLabels = [
    { key: 0, label: "Brand Input" },
    { key: 2, label: "Agent Research" },
    { key: 4, label: "Select Templates" },
    { key: 5, label: "Generate" },
  ];

  return (
    <>
      <Nav />
      <div className="mesh-gradient grid-lines min-h-screen pt-24">
        <div className="max-w-6xl mx-auto px-8 pb-24">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-16">
            {stepLabels.map((s, i) => {
              const isActive = stepIndex >= s.key;
              const isCurrent = stepIndex >= s.key && (i === stepLabels.length - 1 || stepIndex < stepLabels[i + 1].key);
              return (
                <div key={s.key} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-8 h-px ${isActive ? "bg-gold/40" : "bg-ash"}`} />}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCurrent ? "bg-gold text-obsidian" : isActive ? "bg-gold/20 text-gold" : "bg-graphite text-silver"
                    }`}>
                      {isActive && !isCurrent ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm hidden sm:block ${
                      isCurrent ? "text-gold font-medium" : isActive ? "text-ivory" : "text-silver"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="glass-gold rounded-xl p-4 mb-8 flex items-center gap-3">
              <span className="text-amber">⚠</span>
              <p className="text-sm text-amber">{error}</p>
              <button onClick={() => { setError(""); setStep("input"); }} className="ml-auto text-xs text-gold hover:text-gold-light">
                Try Again
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Brand Input */}
            {step === "input" && (
              <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="font-display text-4xl md:text-5xl text-ivory mb-3">Tell us about your brand.</h1>
                <p className="text-silver text-lg mb-12 max-w-xl">
                  We&apos;ll scrape your website, analyze your brand identity, and deploy 5 research agents to build your campaign.
                </p>

                <div className="glass rounded-2xl p-8 max-w-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-pearl mb-2 font-medium">Brand Name <span className="text-gold">*</span></label>
                      <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Acme Inc."
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
                  <button onClick={startScrape} disabled={!brandName.trim() || !brandUrl.trim()}
                    className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
                    Deploy Research Agents
                  </button>
                </div>
              </motion.div>
            )}

            {/* Scraping */}
            {step === "scraping" && (
              <motion.div key="scraping" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass rounded-2xl p-12 max-w-2xl text-center glow-gold-subtle">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl text-ivory mb-3">Analyzing {brandName}</h2>
                  <p className="text-silver">{scrapeStatus}</p>
                  <div className="mt-6 shimmer h-1 rounded-full" />
                </div>
              </motion.div>
            )}

            {/* Agent Research */}
            {step === "research" && (
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
                        <p className="text-silver text-xs mb-2">{productImages.length} product images found</p>
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
                      <div className="flex items-center gap-4 mb-3">
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
                      </div>
                      <AnimatePresence>
                        {agent.findings.length > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-1.5 ml-10">
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
              </motion.div>
            )}

            {/* Generating Prompts */}
            {step === "prompts" && (
              <motion.div key="prompts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass rounded-2xl p-12 max-w-2xl text-center glow-gold-subtle">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl text-ivory mb-3">Generating 40 Ad Prompts</h2>
                  <p className="text-silver">Merging brand DNA with research findings...</p>
                  <div className="mt-6 shimmer h-1 rounded-full" />
                </div>
              </motion.div>
            )}

            {/* Template Selection */}
            {step === "selecting" && (
              <motion.div key="selecting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h1 className="font-display text-4xl text-ivory mb-2">Select your templates.</h1>
                    <p className="text-silver">
                      {selectedTemplates.length} of {prompts.length} selected
                      <span className="text-gold ml-2">~${(selectedTemplates.length * 0.08).toFixed(2)}</span>
                    </p>
                  </div>
                  <button onClick={() => setSelectedTemplates(selectedTemplates.length === prompts.length ? [] : prompts.map((p) => p.id))}
                    className="text-sm text-gold hover:text-gold-light transition-colors">
                    {selectedTemplates.length === prompts.length ? "Deselect All" : `Select All ${prompts.length}`}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-10">
                  {prompts.map((p) => (
                    <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTemplate(p.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedTemplates.includes(p.id) ? "glass-gold border-gold/30" : "glass border-transparent hover:border-ivory/10"
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          selectedTemplates.includes(p.id) ? "bg-gold border-gold" : "border-ash"
                        }`}>
                          {selectedTemplates.includes(p.id) && (
                            <svg className="w-3 h-3 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ivory capitalize">{p.template_name.replace(/_/g, " ")}</p>
                          <p className="text-xs text-silver mt-1 line-clamp-2">{p.headline_text}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button onClick={generateImages} disabled={selectedTemplates.length === 0}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
                  Generate {selectedTemplates.length} Ad{selectedTemplates.length !== 1 ? "s" : ""}
                </button>
              </motion.div>
            )}

            {/* Generating + Done */}
            {(step === "generating" || step === "done") && (
              <motion.div key="gen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                        <p className="text-ivory font-medium">Generating ({generated.length + 1} of {selectedTemplates.length})</p>
                        <p className="text-sm text-silver">{prompts.find((p) => p.id === selectedTemplates[genIndex])?.template_name.replace(/_/g, " ") || "..."}</p>
                      </div>
                      <button onClick={() => { abortRef.current = true; }} className="ml-auto text-xs text-silver hover:text-amber transition-colors">Stop</button>
                    </div>
                    <div className="w-full h-1.5 bg-graphite rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                        animate={{ width: `${(generated.length / selectedTemplates.length) * 100}%` }}
                        transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <div className="mb-10">
                    <h1 className="font-display text-4xl text-ivory mb-2">Your campaign is ready.</h1>
                    <p className="text-silver">{generated.length} ads generated for <span className="text-gold">{brandName}</span></p>
                  </div>
                )}

                {generated.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {generated.map((ad, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => setPreviewAd(ad)} className="group cursor-pointer rounded-2xl overflow-hidden glass border-transparent hover:border-gold/20 transition-all">
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <Image src={ad.imageUrl} alt={ad.headline} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" unoptimized />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">{ad.templateName.replace(/_/g, " ")}</p>
                          <p className="text-sm text-ivory leading-snug line-clamp-2">{ad.headline}</p>
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
                    <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">{previewAd.templateName.replace(/_/g, " ")}</p>
                    <h3 className="font-display text-ivory text-xl leading-snug">{previewAd.headline}</h3>
                    <div className="flex gap-3 mt-6">
                      <a href={previewAd.imageUrl} download target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3 rounded-xl font-semibold text-sm">
                        Download PNG
                      </a>
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
        </div>
      </div>
    </>
  );
}
