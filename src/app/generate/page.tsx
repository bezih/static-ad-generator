"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Nav } from "@/components/Nav";

type Step = "input" | "scraping" | "research" | "prompts" | "selecting" | "generating" | "done" | "video-select" | "video-prompts" | "video-generating" | "video-done";

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

interface GeneratedVideo {
  adIndex: number;
  templateName: string;
  headline: string;
  sourceImageUrl: string;
  videoUrl: string;
  duration: number;
}

type VideoStyle = "product-showcase" | "lifestyle" | "cinematic" | "social-media" | "unboxing";

const VIDEO_STYLES: { id: VideoStyle; name: string; icon: string; desc: string; price: string }[] = [
  { id: "product-showcase", name: "Product Showcase", icon: "📦", desc: "Elegant camera orbit around your product", price: "~$0.10/5s" },
  { id: "lifestyle", name: "Lifestyle", icon: "🌿", desc: "Product in a natural lifestyle setting", price: "~$0.10/5s" },
  { id: "cinematic", name: "Cinematic", icon: "🎬", desc: "Dramatic lighting and slow-motion reveal", price: "~$0.10/5s" },
  { id: "social-media", name: "Social Media", icon: "📱", desc: "Fast, punchy motion for TikTok/Reels", price: "~$0.10/5s" },
  { id: "unboxing", name: "Unboxing Reveal", icon: "🎁", desc: "Premium reveal and anticipation build", price: "~$0.10/5s" },
];

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
  const [previewVideo, setPreviewVideo] = useState<GeneratedVideo | null>(null);
  const [error, setError] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState("");
  const abortRef = useRef(false);
  // Video state
  const [videoStyle, setVideoStyle] = useState<VideoStyle>("product-showcase");
  const [withAudio, setWithAudio] = useState(false);
  const [selectedVideoAds, setSelectedVideoAds] = useState<number[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [videoGenIndex, setVideoGenIndex] = useState(0);
  const videoAbortRef = useRef(false);
  const [savedCampaigns, setSavedCampaigns] = useState<
    { brandName: string; date: string; ads: GeneratedAd[] }[]
  >([]);

  // Load saved campaigns from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adforge_campaigns");
      if (saved) {
        const campaigns = JSON.parse(saved);
        setSavedCampaigns(campaigns);
      }
    } catch {}
  }, []);

  // Save campaign when generation completes
  const saveCampaign = useCallback((name: string, ads: GeneratedAd[]) => {
    try {
      const saved = localStorage.getItem("adforge_campaigns");
      const campaigns = saved ? JSON.parse(saved) : [];
      const campaign = {
        brandName: name,
        date: new Date().toISOString(),
        ads,
      };
      // Replace if same brand, otherwise add
      const idx = campaigns.findIndex((c: { brandName: string }) => c.brandName === name);
      if (idx >= 0) campaigns[idx] = campaign;
      else campaigns.unshift(campaign);
      // Keep last 10 campaigns
      const trimmed = campaigns.slice(0, 10);
      localStorage.setItem("adforge_campaigns", JSON.stringify(trimmed));
      setSavedCampaigns(trimmed);
    } catch {}
  }, []);

  // Load a saved campaign
  const loadCampaign = (campaign: { brandName: string; ads: GeneratedAd[] }) => {
    setBrandName(campaign.brandName);
    setGenerated(campaign.ads);
    setStep("done");
  };

  // Download all generated images as individual files
  const downloadAll = async (ads: GeneratedAd[]) => {
    for (const ad of ads) {
      try {
        const res = await fetch(ad.imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${ad.templateName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Small delay between downloads so browser doesn't block them
        await new Promise((r) => setTimeout(r, 300));
      } catch {}
    }
  };

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
        body: JSON.stringify({ brandDna: dna, agentFindings: findings, hasProductImages: productImages.length > 0 }),
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
          body: JSON.stringify({
            prompt: template.prompt,
            imageUrls: productImages.length > 0 ? productImages.slice(0, 3) : undefined,
          }),
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
    // Save to localStorage
    setGenerated((current) => {
      saveCampaign(brandName, current);
      return current;
    });
  };

  const toggleTemplate = (id: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // --- Video prompt generation ---
  const generateVideoPrompts = async () => {
    if (selectedVideoAds.length === 0) return;
    setStep("video-prompts");
    setError("");

    const adsToAnimate = selectedVideoAds.map((idx) => generated[idx]);

    try {
      const res = await fetch("/api/video-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDna,
          ads: adsToAnimate,
          videoStyle,
          withAudio,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Start generating videos with the prompts
      await generateVideos(adsToAnimate, data.videoPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video prompt generation failed");
      setStep("video-select");
    }
  };

  // --- Video generation ---
  const generateVideos = async (
    adsToAnimate: GeneratedAd[],
    videoPrompts: { adIndex: number; videoPrompt: string; suggestedDuration: number }[]
  ) => {
    setStep("video-generating");
    setGeneratedVideos([]);
    videoAbortRef.current = false;

    for (let i = 0; i < videoPrompts.length; i++) {
      if (videoAbortRef.current) break;
      const vp = videoPrompts[i];
      const ad = adsToAnimate[vp.adIndex];
      setVideoGenIndex(i);

      try {
        const res = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: ad.imageUrl,
            prompt: vp.videoPrompt,
            duration: String(vp.suggestedDuration),
            aspectRatio: "9:16",
          }),
        });

        const data = await res.json();
        if (data.videoUrl) {
          setGeneratedVideos((prev) => [
            ...prev,
            {
              adIndex: vp.adIndex,
              templateName: ad.templateName,
              headline: ad.headline,
              sourceImageUrl: ad.imageUrl,
              videoUrl: data.videoUrl,
              duration: vp.suggestedDuration,
            },
          ]);
        }
      } catch {
        console.error(`Failed to generate video for: ${ad.templateName}`);
      }
    }
    setStep("video-done");
  };

  const toggleVideoAd = (idx: number) => {
    setSelectedVideoAds((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const downloadVideo = async (video: GeneratedVideo) => {
    try {
      const res = await fetch(video.videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.templateName}_video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const allSteps = ["input", "scraping", "research", "prompts", "selecting", "generating", "done", "video-select", "video-prompts", "video-generating", "video-done"];
  const stepIndex = allSteps.indexOf(step);
  const stepLabels = [
    { key: 0, label: "Brand Input" },
    { key: 2, label: "Agent Research" },
    { key: 4, label: "Select Templates" },
    { key: 5, label: "Generate" },
    { key: 7, label: "Video Ads" },
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

                {/* Saved Campaigns */}
                {savedCampaigns.length > 0 && (
                  <div className="mt-10 max-w-2xl">
                    <h3 className="text-sm text-silver font-medium mb-4 tracking-wider uppercase">Previous Campaigns</h3>
                    <div className="space-y-2">
                      {savedCampaigns.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => loadCampaign(c)}
                          className="w-full flex items-center justify-between p-4 rounded-xl glass hover:border-gold/20 transition-all text-left"
                        >
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
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <h1 className="font-display text-4xl text-ivory mb-2">Your campaign is ready.</h1>
                        <p className="text-silver">{generated.length} ads generated for <span className="text-gold">{brandName}</span></p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => downloadAll(generated)}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.4)] transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download All
                        </button>
                        <button
                          onClick={() => { setStep("input"); setGenerated([]); setGeneratedVideos([]); setBrandName(""); setBrandUrl(""); setProduct(""); setAgents(AGENTS.map((a) => ({ ...a }))); }}
                          className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors"
                        >
                          New Campaign
                        </button>
                      </div>
                    </div>
                    {/* Video Ads CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-gold rounded-2xl p-6 mb-10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber flex items-center justify-center text-2xl">
                          <svg className="w-6 h-6 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-ivory font-semibold">Turn your ads into video</h3>
                          <p className="text-sm text-silver">Generate 5-10 second video ads with Kling AI via fal.ai</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedVideoAds([]); setStep("video-select"); }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.4)] transition-all whitespace-nowrap"
                      >
                        Create Video Ads
                      </button>
                    </motion.div>
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
            {/* Video Select — choose ads to animate + style */}
            {step === "video-select" && (
              <motion.div key="video-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="font-display text-4xl text-ivory mb-2">Create video ads.</h1>
                <p className="text-silver mb-8">Select which ads to animate and choose a video style.</p>

                {/* Video Style Selection */}
                <div className="mb-10">
                  <h3 className="text-sm text-pearl font-medium mb-4 tracking-wider uppercase">Video Style</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {VIDEO_STYLES.map((style) => (
                      <motion.button key={style.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setVideoStyle(style.id)}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          videoStyle === style.id ? "glass-gold border-gold/30" : "glass border-transparent hover:border-ivory/10"
                        }`}>
                        <div className="text-2xl mb-2">{style.icon}</div>
                        <p className="text-sm font-medium text-ivory">{style.name}</p>
                        <p className="text-xs text-silver mt-1">{style.desc}</p>
                        <p className="text-xs text-gold/60 mt-2">{style.price}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Audio Toggle */}
                <div className="glass rounded-2xl p-5 mb-10 flex items-center justify-between max-w-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{withAudio ? "🔊" : "🔇"}</span>
                    <div>
                      <p className="text-sm font-medium text-ivory">Add audio/sound</p>
                      <p className="text-xs text-silver">Ambient sound effects for your videos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWithAudio(!withAudio)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${withAudio ? "bg-gold" : "bg-ash"}`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ left: withAudio ? "26px" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Ad Selection Grid */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-pearl font-medium tracking-wider uppercase">Select Ads to Animate</h3>
                    <p className="text-xs text-silver mt-1">
                      {selectedVideoAds.length} selected
                      <span className="text-gold ml-2">~${(selectedVideoAds.length * 0.10).toFixed(2)} estimated</span>
                    </p>
                  </div>
                  <button onClick={() => setSelectedVideoAds(selectedVideoAds.length === generated.length ? [] : generated.map((_, i) => i))}
                    className="text-sm text-gold hover:text-gold-light transition-colors">
                    {selectedVideoAds.length === generated.length ? "Deselect All" : `Select All ${generated.length}`}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
                  {generated.map((ad, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toggleVideoAd(i)}
                      className={`relative rounded-xl overflow-hidden border transition-all ${
                        selectedVideoAds.includes(i) ? "border-gold/40 ring-1 ring-gold/20" : "border-transparent hover:border-ivory/10"
                      }`}>
                      <div className="relative aspect-[4/5]">
                        <Image src={ad.imageUrl} alt={ad.headline} fill className="object-cover" sizes="200px" unoptimized />
                        {/* Checkbox overlay */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedVideoAds.includes(i) ? "bg-gold border-gold" : "border-white/50 bg-black/30 backdrop-blur-sm"
                        }`}>
                          {selectedVideoAds.includes(i) && (
                            <svg className="w-3.5 h-3.5 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-graphite/80">
                        <p className="text-xs text-ivory truncate">{ad.templateName.replace(/_/g, " ")}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={generateVideoPrompts} disabled={selectedVideoAds.length === 0}
                    className="flex-1 py-5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]">
                    Generate {selectedVideoAds.length} Video{selectedVideoAds.length !== 1 ? "s" : ""}
                  </button>
                  <button onClick={() => setStep("done")}
                    className="px-6 py-5 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors">
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* Video Prompts Loading */}
            {step === "video-prompts" && (
              <motion.div key="video-prompts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass rounded-2xl p-12 max-w-2xl text-center glow-gold-subtle">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl text-ivory mb-3">Video Prompt Agent Working</h2>
                  <p className="text-silver">Crafting motion prompts optimized for {VIDEO_STYLES.find((s) => s.id === videoStyle)?.name.toLowerCase()} style...</p>
                  <p className="text-xs text-silver/60 mt-2">Our video prompt specialist ensures your product stays pixel-perfect in every frame</p>
                  <div className="mt-6 shimmer h-1 rounded-full" />
                </div>
              </motion.div>
            )}

            {/* Video Generating + Video Done */}
            {(step === "video-generating" || step === "video-done") && (
              <motion.div key="video-gen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {step === "video-generating" && (
                  <div className="glass rounded-2xl p-8 mb-10 glow-gold-subtle">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                        <svg className="w-5 h-5 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-ivory font-medium">Generating video ({generatedVideos.length + 1} of {selectedVideoAds.length})</p>
                        <p className="text-sm text-silver">This may take 1-2 minutes per video — Kling is rendering frames</p>
                      </div>
                      <button onClick={() => { videoAbortRef.current = true; }} className="ml-auto text-xs text-silver hover:text-amber transition-colors">Stop</button>
                    </div>
                    <div className="w-full h-1.5 bg-graphite rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                        animate={{ width: `${(generatedVideos.length / selectedVideoAds.length) * 100}%` }}
                        transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                )}

                {step === "video-done" && (
                  <div className="mb-10 flex items-end justify-between">
                    <div>
                      <h1 className="font-display text-4xl text-ivory mb-2">Video ads ready.</h1>
                      <p className="text-silver">{generatedVideos.length} video{generatedVideos.length !== 1 ? "s" : ""} generated for <span className="text-gold">{brandName}</span></p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("done")}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors"
                      >
                        Back to Images
                      </button>
                      <button
                        onClick={() => { setStep("input"); setGenerated([]); setGeneratedVideos([]); setBrandName(""); setBrandUrl(""); setProduct(""); setAgents(AGENTS.map((a) => ({ ...a }))); }}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-silver border border-ivory/10 hover:bg-ivory/5 transition-colors"
                      >
                        New Campaign
                      </button>
                    </div>
                  </div>
                )}

                {generatedVideos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedVideos.map((video, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="group rounded-2xl overflow-hidden glass border-transparent hover:border-gold/20 transition-all">
                        <div className="relative aspect-[9/16] bg-graphite cursor-pointer" onClick={() => setPreviewVideo(video)}>
                          <video
                            src={video.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                            poster={video.sourceImageUrl}
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 group-hover:opacity-0 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {/* Duration badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white">
                            {video.duration}s
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">{video.templateName.replace(/_/g, " ")}</p>
                          <p className="text-sm text-ivory leading-snug line-clamp-2">{video.headline}</p>
                          <button onClick={() => downloadVideo(video)}
                            className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-gold/20 to-gold-dark/20 text-gold text-xs font-medium hover:from-gold/30 hover:to-gold-dark/30 transition-all">
                            Download MP4
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Image Lightbox */}
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

          {/* Video Lightbox */}
          <AnimatePresence>
            {previewVideo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setPreviewVideo(null)}>
                <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.15 }}
                  className="relative max-w-sm w-full glass rounded-3xl overflow-hidden glow-gold" onClick={(e) => e.stopPropagation()}>
                  <div className="relative aspect-[9/16] bg-black">
                    <video
                      src={previewVideo.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                      playsInline
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-gold/60 font-medium uppercase tracking-wider mb-1">{previewVideo.templateName.replace(/_/g, " ")}</p>
                    <h3 className="font-display text-ivory text-xl leading-snug">{previewVideo.headline}</h3>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => downloadVideo(previewVideo)}
                        className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-obsidian text-center py-3 rounded-xl font-semibold text-sm">
                        Download MP4
                      </button>
                      <button onClick={() => setPreviewVideo(null)}
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
