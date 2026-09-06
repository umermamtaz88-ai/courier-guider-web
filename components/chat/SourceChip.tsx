"use client";

import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import type { Source } from "@/types/api";

function tierMeta(source: Source): { label: string; className: string } {
  switch (source.tier) {
    case "official":
      return {
        label: "Official",
        className: "border-success/25 bg-success/10 text-success",
      };
    case "internal_doc":
      return {
        label: "Document",
        className: "border-border/60 bg-surface-elevated/60 text-muted",
      };
    case "third_party":
      return {
        label: "Unofficial",
        className: "border-amber-500/30 bg-amber-500/10 text-amber-300/90",
      };
    default:
      if (source.source_type === "official" || source.source_type === "government") {
        return {
          label: source.source_type === "government" ? "Gov" : "Official",
          className: "border-success/25 bg-success/10 text-success",
        };
      }
      return {
        label: "Source",
        className: "border-border/50 bg-surface-elevated/40 text-muted",
      };
  }
}

function chipLabel(source: Source): string {
  const raw =
    source.carrier ||
    source.provider ||
    source.publisher ||
    source.domain ||
    source.title ||
    "Source";
  const base = String(raw);
  return base.length > 20 ? `${base.slice(0, 18)}…` : base;
}

function hostLabel(source: Source): string | null {
  if (source.domain) return source.domain;
  if (!source.url) return null;
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface SourceChipProps {
  source: Source;
  index?: number;
  onClick?: () => void;
  className?: string;
}

export function SourceChip({ source, index = 1, onClick, className }: SourceChipProps) {
  const tier = tierMeta(source);
  const label = chipLabel(source);
  const host = hostLabel(source);
  const tooltip = [source.title, host, source.date, tier.label]
    .filter(Boolean)
    .join(" · ");

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-label={`${tier.label} source ${index}: ${label}${host ? ` (${host})` : ""}`}
      className={cn(
        "inline-flex max-w-[160px] items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[10px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        tier.className,
        className,
      )}
    >
      <Globe className="h-2.5 w-2.5 shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{label}</span>
      <span className="shrink-0 opacity-75">{tier.label}</span>
    </button>
  );
}

export function KnowledgeBadge({
  kind,
  className,
}: {
  kind: "current" | "web" | "verified" | "document" | "unofficial";
  className?: string;
}) {
  const map = {
    current: { mark: "●", label: "CURRENT", cls: "text-success/85" },
    web: { mark: "●", label: "WEB RESEARCH", cls: "text-success/85" },
    verified: { mark: "●", label: "VERIFIED KNOWLEDGE", cls: "text-brass/80" },
    document: { mark: "●", label: "DOCUMENT", cls: "text-muted" },
    unofficial: { mark: "◇", label: "UNOFFICIAL", cls: "text-amber-300/85" },
  } as const;
  const item = map[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest",
        item.cls,
        className,
      )}
    >
      <span aria-hidden>{item.mark}</span>
      {item.label}
    </span>
  );
}
