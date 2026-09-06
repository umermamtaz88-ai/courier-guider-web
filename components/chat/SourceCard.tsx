"use client";

import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Globe } from "lucide-react";
import { Badge, freshnessToBadge, authorityToBadge } from "@/components/shared/Badge";
import { Reveal } from "@/components/shared/Reveal";
import type { Source } from "@/types/api";

interface SourceCardProps {
  source: Source;
  index?: number;
  onClick?: () => void;
  compact?: boolean;
}

function tierBadge(tier?: Source["tier"] | null): { label: string; className: string } {
  switch (tier) {
    case "official":
      return {
        label: "Official",
        className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    case "internal_doc":
      return {
        label: "Document",
        className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
      };
    case "third_party":
      return {
        label: "Unofficial",
        className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    default:
      return {
        label: "Source",
        className: "bg-surface-elevated text-muted border-border/50",
      };
  }
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

function carrierLabel(source: Source): string | null {
  return source.carrier || source.provider || source.publisher || null;
}

export function SourceCard({
  source,
  index,
  onClick,
  compact = false,
}: SourceCardProps) {
  const freshness = freshnessToBadge(source.freshness);
  const authority = authorityToBadge(source.authority_level);
  const host = hostLabel(source);
  const tier = tierBadge(source.tier);
  const carrier = carrierLabel(source);
  const canOpen = Boolean(source.url);
  const tooltip = [carrier, host, source.date, tier.label].filter(Boolean).join(" · ");

  const openSource = () => {
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
      return;
    }
    onClick?.();
  };

  return (
    <Reveal delay={(index ?? 0) * 0.05}>
      <button
        type="button"
        onClick={openSource}
        disabled={!canOpen && !onClick}
        title={tooltip}
        className={cn(
          "group w-full text-left rounded border border-border/50 bg-surface-elevated/30 p-2.5",
          "transition-colors duration-200 hover:border-brass/25 hover:bg-surface-elevated/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
          compact && "p-2",
          !canOpen && "opacity-90",
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded bg-brass/10 p-1.5">
            {canOpen ? (
              <Globe className="h-3.5 w-3.5 text-brass" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-brass" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {source.id ? (
                <span className="font-mono text-[9px] text-muted/60 uppercase tracking-widest">
                  [{source.id}]
                </span>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
                  tier.className,
                )}
              >
                {tier.label}
              </span>
              {carrier ? (
                <span className="text-[10px] text-muted">{carrier}</span>
              ) : null}
            </div>
            <p className="text-sm text-foreground leading-snug mt-0.5 line-clamp-2">
              {source.title}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {source.publisher}
              {host ? ` · ${host}` : null}
            </p>
            {(source.date || source.page) && (
              <p className="text-[11px] text-muted/70 mt-1">
                {source.date ? `Updated / Effective: ${source.date}` : null}
                {source.date && source.page ? " · " : null}
                {source.page ? `Page ${source.page}` : null}
              </p>
            )}
            {!compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant={authority.variant}>{authority.label}</Badge>
                <Badge variant={freshness.variant}>{freshness.label}</Badge>
                {source.relevance && (
                  <Badge variant="muted">{source.relevance} relevance</Badge>
                )}
              </div>
            )}
            {canOpen ? (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-brass group-hover:text-brass-light">
                Open source
                <ExternalLink className="h-3 w-3" />
              </span>
            ) : (
              <span className="mt-2 inline-flex text-[11px] text-muted/50">
                No public URL for this knowledge entry
              </span>
            )}
          </div>
        </div>
      </button>
    </Reveal>
  );
}

interface SourceListProps {
  sources: Source[];
  onSourceClick?: (source: Source) => void;
  compact?: boolean;
}

export function SourceList({ sources, onSourceClick, compact }: SourceListProps) {
  if (sources.length === 0) return null;

  const grouped = new Map<string, Source[]>();
  for (const source of sources) {
    const key = (source.carrier || source.provider || "Other").toString();
    const list = grouped.get(key) || [];
    list.push(source);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([carrier, items]) => (
        <div key={carrier} className="space-y-2">
          <p className="px-0.5 text-[10px] font-medium uppercase tracking-widest text-muted/60">
            {carrier}
          </p>
          {items.map((source, i) => (
            <SourceCard
              key={`${source.id || source.url || source.title}-${i}`}
              source={source}
              index={i}
              onClick={() => onSourceClick?.(source)}
              compact={compact}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Compact citation chip with tier text label + accessible focus ring. */
export function CitationPill({
  source,
  index,
  className,
}: {
  source: Source;
  index: number;
  className?: string;
}) {
  const tier = tierBadge(source.tier);
  const label =
    source.carrier ||
    source.provider ||
    source.publisher ||
    source.domain ||
    `Source ${index}`;
  const short = label.length > 18 ? `${label.slice(0, 16)}…` : label;
  const host = hostLabel(source);
  const tooltip = [source.title, host, source.date, tier.label].filter(Boolean).join(" · ");

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      title={tooltip}
      aria-label={`${tier.label} source: ${label}${host ? ` (${host})` : ""}`}
      className={cn(
        "mx-0.5 inline-flex items-center gap-1 align-middle rounded-full",
        "border px-1.5 py-0.5 text-[10px] font-medium max-w-[180px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "transition-colors",
        tier.className,
        !source.url && "opacity-60 cursor-default",
        className,
      )}
    >
      <Globe className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">{short}</span>
      <span className="shrink-0 opacity-80">{tier.label}</span>
    </button>
  );
}
