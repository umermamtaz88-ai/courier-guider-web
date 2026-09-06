"use client";

import { cn } from "@/lib/utils";
import {
  GitCompare,
  DollarSign,
  Globe,
  FileText,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, buttonPress, hoverScale } from "@/lib/animations";

const ACTIONS = [
  {
    id: "compare",
    label: "Compare couriers",
    prompt: "I have 8kg clothes from Lahore to Karachi. Which courier is better?",
    icon: GitCompare,
  },
  {
    id: "cost",
    label: "Check shipping cost",
    prompt: "What is the shipping cost for 5kg from Lahore to Karachi?",
    icon: DollarSign,
  },
  {
    id: "international",
    label: "International shipping",
    prompt: "Compare DHL and Leopards for international shipping.",
    icon: Globe,
  },
  {
    id: "documents",
    label: "Documents & customs",
    prompt: "I want to send clothes to Dubai. What paperwork do I need?",
    icon: FileText,
  },
  {
    id: "cod",
    label: "COD & returns",
    prompt: "My customer refused a COD parcel. What happens next?",
    icon: RotateCcw,
  },
];

interface SuggestedActionsProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

export function SuggestedActions({ onSelect, className }: SuggestedActionsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {ACTIONS.map(({ id, label, prompt, icon: Icon }, index) => (
        <motion.button
          key={id}
          type="button"
          variants={fadeInUp}
          whileHover={hoverScale.hover}
          whileTap={buttonPress.press}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(prompt)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border/70",
            "bg-surface-elevated/50 px-3 py-1.5 text-[13px] text-muted",
            "transition-colors hover:border-brass/30 hover:text-foreground hover:bg-surface-elevated",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-brass/70" />
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
}
