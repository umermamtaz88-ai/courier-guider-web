"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn, fadeInUp, loadingContainer, loadingDot } from "@/lib/animations";

export type ResearchPhase =
  | "idle"
  | "searching"
  | "sources_found"
  | "complete"
  | "no_results"
  | "failed";

export type ResearchStep = {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
};

interface WebResearchStatusProps {
  phase?: ResearchPhase;
  statusMessage?: string;
  detail?: string;
  steps?: ResearchStep[];
  className?: string;
}

/**
 * Compact inline research progress — not an alert panel.
 */
export function WebResearchStatus({
  phase = "searching",
  statusMessage = "Researching current information",
  detail = "Checking official provider sources",
  steps = [],
  className,
}: WebResearchStatusProps) {
  if (phase === "idle") return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "rounded-md border border-border/40 bg-surface-elevated/25 px-3 py-2",
        "transition-opacity duration-300",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={statusMessage}
    >
      <div className="flex items-start gap-2">
        <motion.div
          animate={phase === "searching" ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Globe
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0 text-brass/70",
            )}
            aria-hidden
          />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.p
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="text-[12px] text-foreground/90 leading-snug"
          >
            <span className="mr-1.5 inline-block font-serif text-brass/80" aria-hidden>
              {phase === "searching" ? "◌" : phase === "failed" ? "◇" : "◉"}
            </span>
            {statusMessage}
          </motion.p>
          <AnimatePresence mode="wait">
            {detail && (
              <motion.p
                key={detail}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-0.5 text-[11px] text-muted/70 leading-snug"
              >
                {detail}
              </motion.p>
            )}
          </AnimatePresence>

          {steps.length > 0 && (
            <motion.ul
              variants={loadingContainer}
              initial="hidden"
              animate="visible"
              className="mt-1.5 flex flex-col gap-0.5"
            >
              {steps.map((step, index) => (
                <motion.li
                  key={step.id}
                  variants={loadingDot}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center gap-1.5 text-[11px]"
                >
                  {step.status === "done" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.3 }}
                    >
                      <Check className="h-3 w-3 text-success/80" aria-hidden />
                    </motion.div>
                  ) : step.status === "active" ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Circle
                        className="h-2 w-2 fill-brass/40 text-brass"
                        aria-hidden
                      />
                    </motion.div>
                  ) : (
                    <Circle className="h-2 w-2 text-muted/25" aria-hidden />
                  )}
                  <span
                    className={cn(
                      step.status === "done" && "text-muted/70",
                      step.status === "active" && "text-foreground/85",
                      step.status === "pending" && "text-muted/40",
                    )}
                  >
                    {step.label}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
