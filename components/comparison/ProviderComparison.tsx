"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { Check } from "lucide-react";
import type { Recommendation } from "@/types/api";

interface ProviderCardProps {
  recommendation: Recommendation;
  isBestMatch?: boolean;
  onShowEvidence?: () => void;
}

function ProviderCard({
  recommendation,
  isBestMatch,
  onShowEvidence,
}: ProviderCardProps) {
  const showPrice =
    recommendation.price.amount > 0 &&
    recommendation.price_label !== "REQUIRES_VERIFICATION";

  const features: string[] = [];
  if (recommendation.cod) features.push("COD ✓");
  if (recommendation.tracking) features.push("Tracking ✓");
  if (recommendation.returns) features.push("Returns ✓");
  if (recommendation.international) features.push("International");

  return (
    <div
      className={cn(
        "rounded-md border bg-surface-elevated/40 p-3 min-w-[160px] flex-1",
        isBestMatch ? "border-brass/35" : "border-border/50",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-serif text-[15px] text-foreground">
            {recommendation.provider}
          </span>
          {recommendation.service && (
            <p className="text-[11px] text-muted mt-0.5">{recommendation.service}</p>
          )}
        </div>
        {isBestMatch && (
          <Badge variant="official" className="text-[8px] shrink-0">
            Best match
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {features.map((f) => (
          <span key={f} className="text-[11px] text-muted">
            {f}
          </span>
        ))}
      </div>

      {showPrice && (
        <p className="font-mono text-[12px] text-foreground mb-1">
          {formatCurrency(
            recommendation.price.amount,
            recommendation.price.currency,
          )}
        </p>
      )}

      {recommendation.why[0] && (
        <p className="text-[10px] text-muted/70 flex items-start gap-1">
          <Check className="h-2.5 w-2.5 text-success shrink-0 mt-0.5" />
          {recommendation.why[0]}
        </p>
      )}

      {onShowEvidence && (
        <button
          type="button"
          onClick={onShowEvidence}
          className="mt-2 text-[10px] text-brass/80 hover:text-brass transition-colors"
        >
          View evidence →
        </button>
      )}
    </div>
  );
}

interface ProviderComparisonProps {
  recommendations: Recommendation[];
  onShowEvidence?: () => void;
  className?: string;
}

export function ProviderComparison({
  recommendations,
  onShowEvidence,
  className,
}: ProviderComparisonProps) {
  if (recommendations.length === 0) return null;

  const sorted = [...recommendations].sort((a, b) => a.rank - b.rank);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-muted/60">
          Provider comparison
        </span>
        <span className="text-[10px] text-brass/70 uppercase tracking-wide">
          Best match for your priority
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
        {sorted.map((rec) => (
          <ProviderCard
            key={rec.provider}
            recommendation={rec}
            isBestMatch={rec.rank === 1}
            onShowEvidence={onShowEvidence}
          />
        ))}
      </div>
    </div>
  );
}
