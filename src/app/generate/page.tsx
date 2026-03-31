"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { StepBrandSetup, UploadedAsset } from "@/components/generate/StepBrandSetup";
import { StepDnaReview } from "@/components/generate/StepDnaReview";
import { StepResearch } from "@/components/generate/StepResearch";
import { StepBriefs } from "@/components/generate/StepBriefs";
import { StepGenerating } from "@/components/generate/StepGenerating";
import { StepResults } from "@/components/generate/StepResults";
import { StepEditor } from "@/components/generate/StepEditor";
import {
  Step, BusinessType, BrandDna, ClassifiedAsset, AgentState,
  CreativeBrief, GeneratedAd, SavedCampaign, AGENTS,
} from "@/lib/types";
import { AdFormat } from "@/lib/templates";

export default function GeneratePage() {
  // Workflow state
  const [step, setStep] = useState<Step>("input");

  // Step 1: Brand input
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [product, setProduct] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("service");
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

  // Step 2: Brand DNA
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [classifiedAssets, setClassifiedAssets] = useState<ClassifiedAsset[]>([]);
  const [processedAssets, setProcessedAssets] = useState<Record<string, string>>({});

  // Step 3: Research
  const [agents, setAgents] = useState<AgentState[]>(AGENTS.map((a) => ({ ...a })));
  const [allFindings, setAllFindings] = useState<Record<string, string[]>>({});
  const [userNotes, setUserNotes] = useState("");

  // Step 4: Briefs
  const [briefs, setBriefs] = useState<CreativeBrief[]>([]);
  const [selectedBriefs, setSelectedBriefs] = useState<number[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<AdFormat[]>(["feed"]);

  // Step 5-6: Generation + Results
  const [generated, setGenerated] = useState<GeneratedAd[]>([]);
  const [genIndex, setGenIndex] = useState(0);
  const abortRef = useRef(false);

  // Step 7: Editor
  const [editingAd, setEditingAd] = useState<GeneratedAd | null>(null);

  // General
  const [error, setError] = useState("");
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [savedBrandId, setSavedBrandId] = useState<string | null>(null);
  const [savedBrands, setSavedBrands] = useState<{ id: string; name: string; website: string; business_type: string; logo_url: string | null }[]>([]);

  // Load saved brands from Supabase on mount
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (data.brands) setSavedBrands(data.brands);
      })
      .catch(() => {});

    // Also load campaigns
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => {
        if (data.campaigns) {
          const mapped = data.campaigns.map((c: { id: string; brand_id: string; created_at: string; adforge_brands?: { name: string } }) => ({
            brandName: c.adforge_brands?.name || "Unknown",
            date: c.created_at,
            ads: [], // ads loaded on demand
            campaignId: c.id,
          }));
          setSavedCampaigns(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Save brand to Supabase after scrape
  const saveBrandToDb = useCallback(async (name: string, dna: BrandDna, bType: string, logo: string | null, assets: ClassifiedAsset[]) => {
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          website: brandUrl,
          product,
          businessType: bType,
          brandDna: dna,
          logoUrl: logo,
          colors: dna.visualIdentity,
          assets: assets.map((a) => ({ url: a.url, type: a.type, usability: a.usability })),
        }),
      });
      const data = await res.json();
      if (data.brandId) setSavedBrandId(data.brandId);
    } catch {}
  }, [brandUrl, product]);

  // Save campaign to Supabase after generation
  const saveCampaign = useCallback(async (name: string, ads: GeneratedAd[]) => {
    if (savedBrandId && ads.length > 0) {
      try {
        await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId: savedBrandId,
            agentFindings: allFindings,
            userNotes,
            formats: selectedFormats,
            ads: ads.map((a) => ({
              briefId: a.briefId,
              templateId: a.templateId,
              headline: a.headline,
              subhead: a.subhead,
              cta: a.cta,
              category: a.category,
              imageUrl: a.imageUrl,
              bgImageUrl: a.bgImageUrl,
              primaryAssetUrl: a.primaryAssetUrl,
              format: a.format,
              qualityScore: a.qualityScore,
              qualityPass: a.qualityPass,
              compliance: a.compliance,
            })),
          }),
        });
      } catch {}
    }
    // Also keep localStorage as fallback
    try {
      const saved = localStorage.getItem("adforge_campaigns");
      const campaigns = saved ? JSON.parse(saved) : [];
      const campaign = { brandName: name, date: new Date().toISOString(), ads };
      const idx = campaigns.findIndex((c: SavedCampaign) => c.brandName === name);
      if (idx >= 0) campaigns[idx] = campaign;
      else campaigns.unshift(campaign);
      localStorage.setItem("adforge_campaigns", JSON.stringify(campaigns.slice(0, 10)));
    } catch {}
  }, [savedBrandId, allFindings, userNotes, selectedFormats]);

  // ── Step 1 → 2: Scrape website ──
  const startScrape = async () => {
    if (!brandName.trim()) return;
    setError("");
    setStep("scraping");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: brandUrl.startsWith("http") ? brandUrl : `https://${brandUrl}`,
          brandName,
          product,
          businessType,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBrandDna(data.brandDna);

      // Merge scraped images with user-uploaded assets
      const scrapedImages = data.productImages || [];
      const uploadedImageUrls = uploadedAssets.map((a) => a.url);
      const allImages = [...uploadedImageUrls, ...scrapedImages];
      setProductImages(allImages);

      // Use uploaded logo if available, otherwise scraped logo
      const uploadedLogo = uploadedAssets.find((a) => a.type === "logo");
      if (uploadedLogo) setLogoUrl(uploadedLogo.url);
      else if (data.logoUrl) setLogoUrl(data.logoUrl);

      if (data.businessType) setBusinessType(data.businessType);

      // Merge uploaded asset classifications with scraped ones
      const uploadedClassified: ClassifiedAsset[] = uploadedAssets.map((a) => ({
        url: a.url,
        type: a.type as ClassifiedAsset["type"],
        usability: 9, // user-uploaded assets are high quality by default
      }));

      // Process scraped assets in parallel, then merge
      if (allImages.length > 0) {
        processAssets(scrapedImages, data.businessType || businessType, uploadedClassified);
      } else if (uploadedClassified.length > 0) {
        setClassifiedAssets(uploadedClassified);
      }

      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape website");
      setStep("input");
    }
  };

  // Process and classify assets
  const processAssets = async (images: string[], bType: string, preclassified: ClassifiedAsset[] = []) => {
    try {
      const res = await fetch("/api/process-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: images, brandName, businessType: bType }),
      });
      const data = await res.json();
      const scrapedAssets = data.assets || [];
      // Merge: user uploads first (higher priority), then scraped
      setClassifiedAssets([...preclassified, ...scrapedAssets]);
      if (data.processedAssets) setProcessedAssets(data.processedAssets);
    } catch {
      // If processing fails, still keep pre-classified uploads
      if (preclassified.length > 0) setClassifiedAssets(preclassified);
    }
  };

  // ── Step 2 → 3: Confirm DNA, start research ──
  const confirmDna = () => {
    // Save brand to Supabase when user confirms DNA
    saveBrandToDb(brandName, brandDna!, businessType, logoUrl, classifiedAssets);
    runAgents(brandDna!);
  };

  // ── Step 3: Run agents ──
  const runAgents = async (dna: BrandDna) => {
    setStep("research");
    const agentIds = ["pain", "psych", "copy", "creative", "market"];
    const findings: Record<string, string[]> = {};

    for (let batch = 0; batch < agentIds.length; batch += 2) {
      const batchIds = agentIds.slice(batch, batch + 2);

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
            body: JSON.stringify({ agentType: agentId, brandDna: dna, businessType }),
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
              ag.id === agentId ? { ...ag, status: "done", findings: agentFindings } : ag
            )
          );
        } else {
          const failedId = batchIds[batchResults.indexOf(result)];
          setAgents((prev) =>
            prev.map((ag) =>
              ag.id === failedId ? { ...ag, status: "error", findings: ["Research failed — using defaults"] } : ag
            )
          );
        }
      }
    }

    setAllFindings(findings);
  };

  const agentsComplete = agents.every((a) => a.status === "done" || a.status === "error");

  // ── Step 3 → 4: Generate briefs ──
  const generateBriefs = async () => {
    setStep("briefs");
    setError("");

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDna,
          agentFindings: allFindings,
          businessType,
          classifiedAssets: classifiedAssets.filter((a) => a.usability >= 5),
          userNotes: userNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBriefs(data.briefs);
      setSelectedBriefs(data.briefs.slice(0, 12).map((b: CreativeBrief) => b.id));
      setStep("selecting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brief generation failed");
      setStep("research");
    }
  };

  // ── Step 4 → 5: Generate ads ──
  const generateAds = async () => {
    if (selectedBriefs.length === 0 || selectedFormats.length === 0) return;
    setStep("generating");
    setGenerated([]);
    abortRef.current = false;

    const selected = briefs.filter((b) => selectedBriefs.includes(b.id));
    const totalCount = selected.length * selectedFormats.length;
    let genCount = 0;

    for (const brief of selected) {
      if (abortRef.current) break;

      // Generate background if needed
      let bgImageUrl: string | undefined;
      if (brief.bg_prompt) {
        try {
          const bgRes = await fetch("/api/background", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: brief.bg_prompt,
              aspectRatio: "4:5",
            }),
          });
          const bgData = await bgRes.json();
          if (bgData.imageUrl) bgImageUrl = bgData.imageUrl;
        } catch {}
      }

      // Determine primary asset
      let primaryAssetUrl = brief.primary_asset_url || undefined;
      if (primaryAssetUrl && processedAssets[primaryAssetUrl]) {
        primaryAssetUrl = processedAssets[primaryAssetUrl]; // Use bg-removed version
      }

      // Render each format
      for (const format of selectedFormats) {
        if (abortRef.current) break;
        setGenIndex(genCount);

        try {
          const renderRes = await fetch("/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateId: brief.templateId,
              headline: brief.headline,
              subhead: brief.subhead,
              cta: brief.cta,
              bgImageUrl,
              primaryAssetUrl,
              logoUrl,
              brandColors: brandDna ? {
                primary: brandDna.visualIdentity.primaryColor,
                secondary: brandDna.visualIdentity.secondaryColor,
                accent: brandDna.visualIdentity.accentColor,
                background: brandDna.visualIdentity.backgroundColor,
              } : undefined,
              format,
            }),
          });

          if (renderRes.ok) {
            const blob = await renderRes.blob();
            const imageUrl = URL.createObjectURL(blob);

            const newAd: GeneratedAd = {
              briefId: brief.id,
              templateId: brief.templateId,
              templateName: brief.templateId,
              headline: brief.headline,
              subhead: brief.subhead,
              cta: brief.cta,
              category: brief.category,
              imageUrl,
              bgImageUrl,
              primaryAssetUrl,
              format,
              qualityPass: true, // optimistic default
            };

            // Run quality gate in background — update score when ready
            setGenerated((prev) => [...prev, newAd]);

            // Non-blocking quality check
            fetch("/api/quality-check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl,
                headline: brief.headline,
                category: brief.category,
                brandColors: brandDna ? {
                  primary: brandDna.visualIdentity.primaryColor,
                  secondary: brandDna.visualIdentity.secondaryColor,
                } : undefined,
              }),
            })
              .then((r) => r.json())
              .then((qData) => {
                setGenerated((prev) =>
                  prev.map((a) =>
                    a.briefId === brief.id && a.format === format
                      ? { ...a, qualityScore: qData.overall, qualityPass: qData.pass, qualityIssues: qData.issues, compliance: qData.compliance }
                      : a
                  )
                );
              })
              .catch(() => {}); // never block generation on quality check failure
          }
        } catch (err) {
          console.error(`Failed to render: ${brief.templateId} ${format}`, err);
        }

        genCount++;
        // Small delay to avoid overwhelming the server
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    setStep("done");
    setGenerated((current) => {
      saveCampaign(brandName, current);
      return current;
    });
  };

  // ── Re-render a single ad (from editor) ──
  const regenerateAd = async (ad: GeneratedAd) => {
    // Regenerate background
    let bgImageUrl = ad.bgImageUrl;
    const brief = briefs.find((b) => b.id === ad.briefId);

    if (brief?.bg_prompt) {
      try {
        const bgRes = await fetch("/api/background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: brief.bg_prompt, aspectRatio: "4:5" }),
        });
        const bgData = await bgRes.json();
        if (bgData.imageUrl) bgImageUrl = bgData.imageUrl;
      } catch {}
    }

    try {
      const renderRes = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: ad.templateId,
          headline: ad.headline,
          subhead: ad.subhead,
          cta: ad.cta,
          bgImageUrl,
          primaryAssetUrl: ad.primaryAssetUrl,
          brandColors: brandDna ? {
            primary: brandDna.visualIdentity.primaryColor,
            secondary: brandDna.visualIdentity.secondaryColor,
            accent: brandDna.visualIdentity.accentColor,
            background: brandDna.visualIdentity.backgroundColor,
          } : undefined,
          format: ad.format,
        }),
      });

      if (renderRes.ok) {
        const blob = await renderRes.blob();
        const imageUrl = URL.createObjectURL(blob);

        const updatedAd = { ...ad, imageUrl, bgImageUrl };
        setGenerated((prev) =>
          prev.map((a) => (a.briefId === ad.briefId && a.format === ad.format ? updatedAd : a))
        );
        setEditingAd(updatedAd);
      }
    } catch (err) {
      console.error("Re-render failed:", err);
    }
  };

  // ── Brief editing helpers ──
  const toggleBrief = (id: number) => {
    setSelectedBriefs((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const updateBrief = (id: number, updates: Partial<CreativeBrief>) => {
    setBriefs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const toggleFormat = (format: AdFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  // ── Reset ──
  const newCampaign = () => {
    setStep("input");
    setGenerated([]);
    setBrandName("");
    setBrandUrl("");
    setProduct("");
    setBusinessType("service");
    setUploadedAssets([]);
    setBrandDna(null);
    setProductImages([]);
    setLogoUrl(null);
    setClassifiedAssets([]);
    setProcessedAssets({});
    setAgents(AGENTS.map((a) => ({ ...a })));
    setAllFindings({});
    setUserNotes("");
    setBriefs([]);
    setSelectedBriefs([]);
    setSelectedFormats(["feed"]);
    setEditingAd(null);
  };

  // ── Progress bar ──
  const stepKeys: Step[] = ["input", "scraping", "review", "research", "briefs", "selecting", "generating", "done"];
  const stepIndex = stepKeys.indexOf(step === "editing" ? "done" : step);
  const stepLabels = [
    { key: 0, label: "Brand Setup" },
    { key: 2, label: "Review DNA" },
    { key: 3, label: "Research" },
    { key: 5, label: "Select Ads" },
    { key: 6, label: "Generate" },
    { key: 7, label: "Results" },
  ];

  const totalGenCount = selectedBriefs.length * selectedFormats.length;

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
              <button onClick={() => setError("")} className="ml-auto text-xs text-gold hover:text-gold-light">Dismiss</button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Brand Input */}
            {step === "input" && (
              <StepBrandSetup
                brandName={brandName} setBrandName={setBrandName}
                brandUrl={brandUrl} setBrandUrl={setBrandUrl}
                product={product} setProduct={setProduct}
                businessType={businessType} setBusinessType={setBusinessType}
                uploadedAssets={uploadedAssets} setUploadedAssets={setUploadedAssets}
                onStart={startScrape}
                savedCampaigns={savedCampaigns}
                onLoadCampaign={(c) => { setBrandName(c.brandName); setGenerated(c.ads); setStep("done"); }}
                savedBrands={savedBrands}
                onLoadBrand={async (brand) => {
                  // Load full brand from Supabase
                  try {
                    const res = await fetch(`/api/brands?id=${brand.id}`);
                    const data = await res.json();
                    if (data.brand) {
                      const b = data.brand;
                      setBrandName(b.name);
                      setBrandUrl(b.website || "");
                      setProduct(b.product || "");
                      setBusinessType(b.business_type || "service");
                      setBrandDna(b.brand_dna);
                      setLogoUrl(b.logo_url);
                      setSavedBrandId(b.id);
                      if (b.adforge_assets) {
                        setClassifiedAssets(b.adforge_assets.map((a: { url: string; asset_type: string; usability: number }) => ({
                          url: a.url, type: a.asset_type, usability: a.usability,
                        })));
                      }
                      // Skip scrape — go straight to review
                      setStep("review");
                    }
                  } catch {}
                }}
              />
            )}

            {/* Scraping loader */}
            {step === "scraping" && (
              <div className="glass rounded-2xl p-12 max-w-2xl text-center glow-gold-subtle">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-ivory mb-3">Analyzing {brandName}</h2>
                <p className="text-silver">Scraping website, extracting brand identity, classifying assets...</p>
                <div className="mt-6 shimmer h-1 rounded-full" />
              </div>
            )}

            {/* Step 2: Review Brand DNA */}
            {step === "review" && brandDna && (
              <StepDnaReview
                brandDna={brandDna} onUpdateDna={setBrandDna}
                classifiedAssets={classifiedAssets} onUpdateAssets={setClassifiedAssets}
                businessType={businessType} onUpdateBusinessType={setBusinessType}
                onConfirm={confirmDna}
              />
            )}

            {/* Step 3: Research */}
            {step === "research" && brandDna && (
              <StepResearch
                brandName={brandName} brandDna={brandDna}
                agents={agents} productImages={productImages}
                isComplete={agentsComplete}
                userNotes={userNotes} setUserNotes={setUserNotes}
                onContinue={generateBriefs}
              />
            )}

            {/* Generating briefs loader */}
            {step === "briefs" && (
              <div className="glass rounded-2xl p-12 max-w-2xl text-center glow-gold-subtle">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-obsidian animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-ivory mb-3">Generating Ad Concepts</h2>
                <p className="text-silver">Creating structured creative briefs from research findings...</p>
                <div className="mt-6 shimmer h-1 rounded-full" />
              </div>
            )}

            {/* Step 4: Select Briefs */}
            {step === "selecting" && (
              <StepBriefs
                briefs={briefs} selectedBriefs={selectedBriefs}
                onToggleBrief={toggleBrief}
                onSelectAll={() => setSelectedBriefs(briefs.map((b) => b.id))}
                onDeselectAll={() => setSelectedBriefs([])}
                onUpdateBrief={updateBrief}
                selectedFormats={selectedFormats} onToggleFormat={toggleFormat}
                onGenerate={generateAds}
              />
            )}

            {/* Step 5: Generating */}
            {step === "generating" && (
              <StepGenerating
                generated={generated} totalCount={totalGenCount}
                currentTemplate={briefs.find((b) => b.id === selectedBriefs[Math.floor(genIndex / selectedFormats.length)])?.templateId || "..."}
                onAbort={() => { abortRef.current = true; }}
              />
            )}

            {/* Step 6: Results */}
            {step === "done" && !editingAd && (
              <StepResults
                brandName={brandName} generated={generated}
                onEditAd={setEditingAd}
                onNewCampaign={newCampaign}
                onRegenerateAd={regenerateAd}
              />
            )}

            {/* Step 7: Editor */}
            {(step === "done" || step === "editing") && editingAd && (
              <StepEditor
                ad={editingAd}
                brandColors={brandDna ? {
                  primary: brandDna.visualIdentity.primaryColor,
                  secondary: brandDna.visualIdentity.secondaryColor,
                  accent: brandDna.visualIdentity.accentColor,
                  background: brandDna.visualIdentity.backgroundColor,
                } : { primary: "#2563EB", secondary: "#1E40AF", accent: "#F59E0B", background: "#FFFFFF" }}
                onSave={(updated) => {
                  setGenerated((prev) => prev.map((a) =>
                    a.briefId === updated.briefId && a.format === updated.format ? updated : a
                  ));
                  setEditingAd(null);
                }}
                onRegenerate={regenerateAd}
                onBack={() => setEditingAd(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
