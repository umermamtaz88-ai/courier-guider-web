import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brass/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brass text-ink shadow hover:bg-brass/80",
        secondary: "border-transparent bg-surface-elevated text-foreground hover:bg-surface-elevated/80",
        destructive: "border-transparent bg-error text-destructive-foreground shadow hover:bg-error/80",
        outline: "text-foreground",
        muted: "border-border bg-surface-elevated/50 text-muted",
        brass: "border-brass/30 bg-brass/10 text-brass",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }