"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useScrollBehavior";
import { Button } from "@/components/shared/Button";
import { Sparkles } from "lucide-react";

interface SurrealEmptyStateProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function SurrealEmptyState({
  prompts,
  onSelectPrompt,
}: SurrealEmptyStateProps) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Surreal floating box illustration */}
      <div className="relative w-48 h-48 mb-8">
        {/* Orbital route lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <ellipse cx="100" cy="100" rx="90" ry="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brass" />
          <ellipse cx="100" cy="100" rx="70" ry="55" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brass" transform="rotate(45 100 100)" />
          <ellipse cx="100" cy="100" rx="85" ry="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brass" transform="rotate(-30 100 100)" />
        </svg>

        {/* Marble pedestal */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-gradient-to-r from-transparent via-brass/20 to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-lg border border-brass/15 bg-surface-elevated/80" />

        {/* Floating box */}
        <motion.div
          animate={
            reduced
              ? {}
              : {
                  y: [0, -8, 0],
                  rotateY: [0, 5, 0, -5, 0],
                }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-6 left-1/2 -translate-x-1/2"
        >
          <div className="relative w-16 h-14 rounded-sm border border-brass/30 bg-gradient-to-br from-surface-elevated to-surface shadow-lg">
            <div className="absolute inset-x-2 top-2 h-0.5 bg-brass/40" />
            <div className="absolute left-2 top-4 text-[6px] font-mono text-muted/60 uppercase tracking-widest">
              Fragile
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border border-brass/20 bg-brass/5" />
          </div>
        </motion.div>

        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <h2 className="font-serif text-2xl text-foreground mb-2">
        Your logistics research desk
      </h2>
      <p className="text-sm text-muted max-w-md mb-8 leading-relaxed">
        Ask about couriers, rates, policies, documentation, or upload a rate card.
        Every answer is grounded in cited evidence.
      </p>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-4 w-4 text-brass" />
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Try an example question
        </span>
      </div>

      <div className="grid gap-2 w-full max-w-lg">
        {prompts.map((prompt, i) => (
          <motion.div
            key={prompt}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-3 px-4 text-left justify-start text-xs text-muted hover:text-foreground whitespace-normal"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
