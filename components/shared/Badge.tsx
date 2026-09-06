import { cn } from "@/lib/utils";

type BadgeVariant =
  | "official"
  | "current"
  | "verified"
  | "warning"
  | "muted"
  | "demo";

const variants: Record<BadgeVariant, string> = {
  official: "bg-brass/15 text-brass border-brass/25",
  current: "bg-success/10 text-success border-success/20",
  verified: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/25",
  muted: "bg-surface-elevated text-muted border-border",
  demo: "bg-purple/10 text-purple border-purple/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function freshnessToBadge(
  freshness: string,
): { label: string; variant: BadgeVariant } {
  switch (freshness) {
    case "current":
      return { label: "Current", variant: "current" };
    case "outdated":
      return { label: "Outdated", variant: "warning" };
    default:
      return { label: "Requires verification", variant: "warning" };
  }
}

export function authorityToBadge(level: number): {
  label: string;
  variant: BadgeVariant;
} {
  if (level === 1) return { label: "Official", variant: "official" };
  if (level === 2) return { label: "Verified", variant: "verified" };
  return { label: "Reference", variant: "muted" };
}
