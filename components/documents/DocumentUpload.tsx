"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { useReducedMotion } from "@/lib/hooks/useScrollBehavior";

interface DocumentUploadProps {
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  className?: string;
}

export function DocumentUploadProgress({
  filename,
  progress,
  status,
  className,
}: DocumentUploadProps) {
  return (
    <div className={cn("rounded-lg border border-border/60 p-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-brass" />
        <span className="text-sm text-foreground truncate">{filename}</span>
      </div>
      <div className="h-1 rounded-full bg-surface-elevated overflow-hidden">
        <motion.div
          className="h-full bg-brass/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-[10px] text-muted mt-1 capitalize">{status}…</p>
    </div>
  );
}

const PROCESSING_STEPS = [
  "Document detected",
  "Text extracted",
  "Tables detected",
  "Comparing information",
];

interface DocumentAnalysisProps {
  activeStep: number;
  className?: string;
}

export function DocumentAnalysis({ activeStep, className }: DocumentAnalysisProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-surface-elevated/40 overflow-hidden",
        className,
      )}
    >
      {/* Scan line animation */}
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brass/50 to-transparent z-10"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="p-4">
        <div className="aspect-[3/4] max-h-48 rounded border border-border/40 bg-surface flex items-center justify-center relative">
          <FileText className="h-12 w-12 text-muted/20" />
          {!reduced && (
            <motion.div
              className="absolute inset-0 bg-brass/5"
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        <ul className="mt-3 space-y-1.5">
          {PROCESSING_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i < activeStep
                    ? "bg-success"
                    : i === activeStep
                      ? "bg-brass animate-pulse"
                      : "bg-muted/30",
                )}
              />
              <span
                className={cn(
                  i <= activeStep ? "text-foreground" : "text-muted/50",
                )}
              >
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface DocumentConflictProps {
  conflicts: { field: string; values: string[] }[];
}

export function DocumentConflict({ conflicts }: DocumentConflictProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-xs font-medium text-warning">Document conflicts</span>
      </div>
      {conflicts.map((c) => (
        <div key={c.field} className="text-xs text-muted mt-1">
          <span className="text-foreground">{c.field}:</span>{" "}
          {c.values.join(" vs ")}
        </div>
      ))}
    </div>
  );
}

export function DocumentViewer({
  excerpt,
  page,
  confidence,
}: {
  excerpt?: string;
  page?: number;
  confidence?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-[#1a1816] p-4 max-h-64 overflow-y-auto scrollbar-thin font-mono text-xs text-muted leading-relaxed">
      {page && (
        <Badge variant="muted" className="mb-2">
          Page {page}
        </Badge>
      )}
      {confidence && (
        <Badge variant="verified" className="mb-2 ml-1">
          {confidence} confidence
        </Badge>
      )}
      <p className="whitespace-pre-wrap">{excerpt ?? "No preview available."}</p>
    </div>
  );
}
