"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-cherry/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-cherry flex items-center justify-center text-cream text-sm font-display">
            CR
          </div>
          <span className="font-display text-cherry text-lg tracking-tight">
            Ad Generator
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-cherry text-cream"
                : "text-bark hover:bg-cherry/5"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/generate"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/generate"
                ? "bg-cherry text-cream"
                : "text-bark hover:bg-cherry/5"
            }`}
          >
            Generate
          </Link>
        </div>
      </div>
    </nav>
  );
}
