"use client";

import { motion } from "framer-motion";
import { loadingContainer, loadingDot } from "@/lib/animations";

export function TypingIndicator() {
  return (
    <motion.div
      variants={loadingContainer}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-1 px-3 py-2"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={loadingDot}
          className="h-2 w-2 rounded-full bg-brass/60"
        />
      ))}
    </motion.div>
  );
}