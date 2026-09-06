"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useScrollBehavior";

export function SubtleArtwork() {
  const reduced = useReducedMotion();

  return (
    <div
      className="relative hidden lg:block w-[200px] h-[220px] shrink-0 opacity-[0.55]"
      aria-hidden
    >
      {/* Route label */}
      <span className="absolute top-2 right-0 font-mono text-[9px] uppercase tracking-widest text-brass/40 rotate-3">
        Route / PK → UAE
      </span>

      {/* Archival stamp */}
      <div className="absolute top-10 right-4 w-12 h-12 rounded-full border border-dashed border-brass/20 flex items-center justify-center rotate-12">
        <span className="font-mono text-[6px] text-brass/35 text-center leading-tight">
          RESEARCH
          <br />
          / PROVIDERS
        </span>
      </div>

      {/* Thin route arc */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 220">
        <path
          d="M 20 180 Q 100 40 180 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-brass/25"
          strokeDasharray="3 4"
        />
        <circle cx="20" cy="180" r="2" className="fill-brass/30" />
        <circle cx="180" cy="60" r="2" className="fill-brass/30" />
      </svg>

      {/* Small floating parcel */}
      <motion.div
        animate={reduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-6"
      >
        <div className="w-10 h-8 rounded-sm border border-brass/25 bg-surface-elevated/80 relative">
          <div className="absolute inset-x-1.5 top-1.5 h-px bg-brass/20" />
          <span className="absolute bottom-0.5 left-1 text-[5px] font-mono text-muted/40">
            CASE 0281
          </span>
        </div>
      </motion.div>

      {/* Coordinates */}
      <span className="absolute bottom-4 left-0 font-mono text-[8px] text-muted/30">
        31.5204° N · 74.3587° E
      </span>

      {/* Paper fragment edge */}
      <div className="absolute top-24 left-0 w-16 h-20 border-l border-t border-brass/10 bg-surface-elevated/20 -rotate-6" />
    </div>
  );
}
