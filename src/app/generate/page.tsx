"use client";

import { useState } from "react";
import Image from "next/image";
import templates from "@/data/templates.json";

interface GeneratedAd {
  templateName: string;
  headline: string;
  imageUrl: string;
  prompt: string;
}

type Phase = "idle" | "config" | "generating" | "done";

export default function GeneratePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [product, setProduct] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [generated, setGenerated] = useState<GeneratedAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [previewAd, setPreviewAd] = useState<GeneratedAd | null>(null);

  const toggleTemplate = (id: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map((t) => t.id));
    }
  };

  const fillBrandPlaceholders = (prompt: string) => {
    return prompt
      .replace(/Cherry Ruff Pharmacy/g, brandName || "Cherry Ruff Pharmacy")
      .replace(/Cherry Ruff/g, brandName || "Cherry Ruff");
  };

  const generateAds = async () => {
    if (selectedTemplates.length === 0) {
      setError("Select at least one template");
      return;
    }

    setPhase("generating");
    setGenerated([]);
    setError("");

    const selected = templates.filter((t) => selectedTemplates.includes(t.id));

    for (let i = 0; i < selected.length; i++) {
      const template = selected[i];
      setCurrentIndex(i);

      try {
        const prompt = fillBrandPlaceholders(template.prompt);
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
              prompt,
            },
          ]);
        }
      } catch {
        console.error(`Failed to generate template ${template.id}`);
      }

      // Rate limit
      if (i < selected.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    setPhase("done");
  };

  return (
    <div className="relative noise min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* Header */}
        <div className="animate-fade-up mb-12">
          <p className="text-cherry-light text-sm font-medium tracking-widest uppercase mb-3">
            Phase 3 &middot; Image Generation
          </p>
          <h1 className="font-display text-cherry text-4xl md:text-5xl leading-[1.1]">
            Generate Static Ads
          </h1>
          <p className="mt-4 text-bark/60 text-lg max-w-xl">
            Select templates, customize for your brand, and generate
            high-converting ad images powered by FAL AI.
          </p>
        </div>

        {/* Brand Config */}
        <div
          className="bg-white rounded-2xl border border-cherry/10 p-8 mb-10 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="font-display text-cherry text-xl mb-6">
            Brand Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-bark/70 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Cherry Ruff Pharmacy"
                className="w-full px-4 py-3 rounded-xl border border-cherry/10 bg-cream text-bark placeholder:text-bark/30 focus:outline-none focus:ring-2 focus:ring-cherry/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark/70 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder="cherryruffpharmacy.com"
                className="w-full px-4 py-3 rounded-xl border border-cherry/10 bg-cream text-bark placeholder:text-bark/30 focus:outline-none focus:ring-2 focus:ring-cherry/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark/70 mb-2">
                Product / Service
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Prescription transfer service"
                className="w-full px-4 py-3 rounded-xl border border-cherry/10 bg-cream text-bark placeholder:text-bark/30 focus:outline-none focus:ring-2 focus:ring-cherry/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div
          className="bg-white rounded-2xl border border-cherry/10 p-8 mb-10 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-cherry text-xl">
              Select Templates{" "}
              <span className="text-bark/40 text-base font-body">
                ({selectedTemplates.length} selected)
              </span>
            </h2>
            <button
              onClick={selectAll}
              className="text-sm text-cherry hover:text-cherry-dark transition-colors font-medium"
            >
              {selectedTemplates.length === templates.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTemplate(t.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedTemplates.includes(t.id)
                    ? "border-cherry bg-cherry/5 shadow-sm"
                    : "border-cherry/10 hover:border-cherry/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      selectedTemplates.includes(t.id)
                        ? "bg-cherry border-cherry"
                        : "border-cherry/20"
                    }`}
                  >
                    {selectedTemplates.includes(t.id) && (
                      <svg
                        className="w-3 h-3 text-cream"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bark">
                      {t.template_name.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-bark/40 mt-1 line-clamp-2">
                      {t.headline_text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {error && (
          <p className="text-cherry-light text-sm mb-4">{error}</p>
        )}

        {phase !== "generating" && (
          <button
            onClick={generateAds}
            disabled={selectedTemplates.length === 0}
            className="w-full bg-cherry text-cream py-4 rounded-2xl font-display text-xl hover:bg-cherry-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cherry/20 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            Generate {selectedTemplates.length} Ad
            {selectedTemplates.length !== 1 ? "s" : ""}{" "}
            <span className="text-cream/60 font-body text-sm">
              (~${(selectedTemplates.length * 0.08).toFixed(2)})
            </span>
          </button>
        )}

        {/* Progress */}
        {phase === "generating" && (
          <div className="bg-white rounded-2xl border border-cherry/10 p-8 animate-fade-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full phase-active flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-cream animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-bark">
                  Generating ({generated.length + 1} of{" "}
                  {selectedTemplates.length})
                </p>
                <p className="text-sm text-bark/50">
                  {templates.find((t) => t.id === selectedTemplates[currentIndex])
                    ?.template_name.replace(/_/g, " ") || "..."}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cherry to-cherry-light rounded-full transition-all duration-500"
                style={{
                  width: `${((generated.length) / selectedTemplates.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {generated.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-cherry text-2xl mb-6">
              Generated Ads{" "}
              <span className="text-bark/40 text-lg font-body">
                ({generated.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
              {generated.map((ad, i) => (
                <div
                  key={i}
                  className="ad-card group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm border border-cherry/5 animate-fade-up"
                  onClick={() => setPreviewAd(ad)}
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
                    <p className="text-xs text-cherry/50 font-medium uppercase tracking-wider mb-1">
                      {ad.templateName.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm font-medium text-bark leading-snug line-clamp-2">
                      {ad.headline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Lightbox */}
        {previewAd && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
            onClick={() => setPreviewAd(null)}
          >
            <div className="absolute inset-0 bg-bark/80 backdrop-blur-sm" />
            <div
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-up"
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
                <p className="text-xs text-cherry/50 font-medium uppercase tracking-wider mb-1">
                  {previewAd.templateName.replace(/_/g, " ")}
                </p>
                <h3 className="font-display text-cherry text-xl leading-snug">
                  {previewAd.headline}
                </h3>
                <div className="flex gap-3 mt-6">
                  <a
                    href={previewAd.imageUrl}
                    download={`${previewAd.templateName}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-cherry text-cream text-center py-3 rounded-xl font-medium text-sm hover:bg-cherry-dark transition-colors"
                  >
                    Download PNG
                  </a>
                  <button
                    onClick={() => setPreviewAd(null)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-bark/60 border border-cherry/10 hover:bg-cream transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
