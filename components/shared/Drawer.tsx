"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
  title?: string;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  side = "left",
  title,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const slideVariants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };

  const positionClasses = {
    left: "left-0 top-0 h-full w-[min(320px,85vw)]",
    right: "right-0 top-0 h-full w-[min(400px,90vw)]",
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-50 flex flex-col bg-surface border-border shadow-elevated",
              side === "bottom" ? "border-t" : side === "left" ? "border-r" : "border-l",
              positionClasses[side],
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="font-serif text-sm text-foreground">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded p-1 text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
