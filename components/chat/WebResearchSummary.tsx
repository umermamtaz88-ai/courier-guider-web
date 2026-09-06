"use client";

import { cn } from "@/lib/utils";
import type { Source } from "@/types/api";
import { SourceChip } from "@/components/chat/SourceChip";

export type ResearchNoteKind = "none" | "no_results" | "failed" | "complete";

interface WebResearchSummaryProps {
  sources: Source[];
  kind?: ResearchNoteKind;
  note?: string | null;
  onOpenSources?: () => void;
  onOpenSource?: (source: Source) => void;
  className?: string;
}

function countOfficial(sources: Source[]): number {
  return sources.filter((s) => s.tier === "official" || s.source_type === "official").length;
}

export function WebResearchSummary({
  sources,
  kind = "complete",
  note,
  onOpenSources,
  onOpenSource,
  className,
}: WebResearchSummaryProps) {
  const count = sources.length;
  const official = countOfficial(sources);

  if (kind === "none" && count === 0 && !note) return null;

  const statusLine =
    kind === "no_results"
      ? "◇ No relevant web sources found"
      : kind === "failed"
        ? "◇ Web research is temporarily unavailable"
        : count > 0
          ? `Research complete · ${count} source${count !== 1 ? "s" : ""}`
          : null;

  const meta =
    kind === "complete" && count > 0 && official > 0
      ? `${official} official`
      : null;

  return (
    <div className={cn("space-y-2", className)}>
      {statusLine ? (
        <button
          type="button"
          onClick={onOpenSources}
          disabled={!onOpenSources || count === 0}
          className={cn(
            "group inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded px-0.5 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
            count > 0 && onOpenSources
              ? "cursor-pointer hover:text-brass-light"
              : "cursor-default",
          )}
          aria-label={count > 0 ? `${statusLine}. Open sources.` : statusLine}
        >
          <span
            className={cn(
              "font-serif text-[12px] tracking-wide",
              kind === "failed" ? "text-error/80" : "text-muted",
            )}
          >
            {statusLine}
          </span>
          {meta ? (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted/55">
              {meta}
            </span>
          ) : null}
        </button>
      ) : null}

      {note ? (
        <p className="text-[12px] leading-relaxed text-muted/80">{note}</p>
      ) : null}

      {count > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {sources.slice(0, 6).map((source, i) => (
            <SourceChip
              key={`${source.id || source.url || source.title}-${i}`}
              source={source}
              index={i + 1}
              onClick={() => {
                onOpenSource?.(source);
                onOpenSources?.();
              }}
            />
          ))}
          {count > 6 ? (
            <button
              type="button"
              onClick={onOpenSources}
              className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
            >
              +{count - 6} more
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
