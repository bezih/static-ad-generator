"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Nav } from "@/components/Nav";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const agents = [
  {
    name: "Consumer Insights",
    desc: "Scours Reddit, forums, and reviews for emotional pain points",
    icon: "🔍",
  },
  {
    name: "Behavioral Psych",
    desc: "Maps switching triggers, barriers, and conversion hooks",
    icon: "🧠",
  },
  {
    name: "Conversion Copy",
    desc: "Studies high-converting ad formulas and headline patterns",
    icon: "✍️",
  },
  {
    name: "Creative Director",
    desc: "Reviews assets, ranks templates, rewrites for impact",
    icon: "🎨",
  },
  {
    name: "Market Intel",
    desc: "Analyzes local demographics, competitors, and opportunities",
    icon: "📊",
  },
];

const steps = [
  { num: "01", title: "Enter Your Brand", desc: "Name, website, product. That's all we need." },
  { num: "02", title: "Agents Research", desc: "5 AI agents analyze your market, competitors, and audience pain points." },
  { num: "03", title: "Prompts Generated", desc: "40 conversion-optimized ad prompts tailored to your brand DNA." },
  { num: "04", title: "Images Created", desc: "FAL AI generates production-ready static ads in seconds." },
];

export default function Home() {
  return (
    <>
      <Nav />
      <div className="mesh-gradient grid-lines min-h-screen">
        {/* Hero */}
        <section className="relative max-w-7xl mx-auto px-8 pt-40 pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-sm font-medium">
                Multi-Agent AI Ad Generation
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
            >
              Static ads that
              <br />
              <span className="text-gradient-gold">actually convert.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-8 text-xl text-silver max-w-2xl leading-relaxed"
            >
              Five AI research agents analyze your competitors, find customer
              pain points, and craft conversion-optimized ad copy. Then we
              generate the images. For any brand. In minutes.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex gap-4 mt-12">
              <Link
                href="/generate"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold text-sm overflow-hidden transition-all hover:shadow-[0_0_40px_-8px_rgba(201,168,76,0.5)]"
              >
                <span className="relative z-10">Start Generating</span>
                <svg
                  className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-ivory/10 text-ivory text-sm font-medium hover:bg-ivory/5 transition-all"
              >
                View Gallery
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating glow */}
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* Divider */}
        <div className="divider-gold max-w-7xl mx-auto" />

        {/* Agents Section */}
        <section className="max-w-7xl mx-auto px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">
              The Research Squad
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ivory leading-tight max-w-2xl">
              Five agents. One mission.
              <br />
              <span className="text-silver">Maximum conversions.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-16">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 group cursor-default hover:border-gold/20 transition-colors"
              >
                <div className="text-3xl mb-4">{agent.icon}</div>
                <h3 className="font-display text-ivory text-lg mb-2">
                  {agent.name}
                </h3>
                <p className="text-silver text-sm leading-relaxed">
                  {agent.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="divider-gold max-w-7xl mx-auto" />

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">
              How It Works
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ivory leading-tight">
              Four phases. Zero effort.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative"
              >
                <span className="font-display text-6xl text-gold/10">
                  {step.num}
                </span>
                <h3 className="font-display text-ivory text-xl mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">
                  {step.desc}
                </p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-ash">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-8 pb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-gold rounded-3xl p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
            <h2 className="relative font-display text-4xl md:text-5xl text-ivory mb-6">
              Ready to forge your ads?
            </h2>
            <p className="relative text-silver text-lg mb-10 max-w-lg mx-auto">
              Enter your brand. Let the agents work. Download your campaign.
            </p>
            <Link
              href="/generate"
              className="relative inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-obsidian font-semibold transition-all hover:shadow-[0_0_60px_-10px_rgba(201,168,76,0.5)]"
            >
              Launch Generator
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-ivory/5 py-8">
          <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-silver/50">
            <span>AdForge &copy; 2026</span>
            <span>Powered by Claude &middot; FAL AI</span>
          </div>
        </footer>
      </div>
    </>
  );
}
