"use client";

import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { motion, AnimatePresence } from "framer-motion";

interface NewMessageButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function NewMessageButton({ visible, onClick }: NewMessageButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={onClick}
            className="shadow-elevated backdrop-blur-sm bg-surface/90"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            New response
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
