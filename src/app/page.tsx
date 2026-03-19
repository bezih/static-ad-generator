import { Gallery } from "@/components/Gallery";
import manifest from "@/data/manifest.json";

export default function Home() {
  return (
    <div className="relative noise">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="animate-fade-up">
          <p className="text-cherry-light text-sm font-medium tracking-widest uppercase mb-3">
            {manifest.brand} &middot; {manifest.location}
          </p>
          <h1 className="font-display text-cherry text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl">
            Your Ad Campaign,
            <br />
            <span className="text-gold">Ready to Deploy.</span>
          </h1>
          <p className="mt-6 text-bark/70 text-lg max-w-xl leading-relaxed">
            {manifest.ads.length} AI-generated static ads built from real
            consumer research, Reddit pain points, and conversion-optimized
            copywriting. Click any ad to preview. Download and deploy.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <Gallery ads={manifest.ads} categories={manifest.categories} />
      </section>
    </div>
  );
}
