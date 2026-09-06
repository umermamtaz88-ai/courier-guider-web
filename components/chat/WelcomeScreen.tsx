"use client";

import { cn } from "@/lib/utils";
import { SuggestedActions } from "@/components/chat/SuggestedActions";
import { SubtleArtwork } from "@/components/chat/SubtleArtwork";
import type { ConversationSummary } from "@/types/api";
import Link from "next/link";
import { MessageSquare, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  onSelectConversation?: (id: string) => void;
  conversations?: ConversationSummary[];
  isAuthenticated?: boolean;
}

const features = [
  {
    icon: Globe,
    title: "Live Web Research",
    description: "Real-time courier information from official sources",
  },
  {
    icon: Shield,
    title: "Verified Knowledge",
    description: "Your trusted documents and shipping data",
  },
  {
    icon: Zap,
    title: "Smart Comparisons",
    description: "AI-powered courier analysis and recommendations",
  },
];

export function WelcomeScreen({
  onSelectPrompt,
  onSelectConversation,
  conversations = [],
  isAuthenticated = false,
}: WelcomeScreenProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[960px] px-4 pt-4 pb-6"
    >
      <div className="flex items-start justify-between gap-8">
        <motion.div variants={fadeInUp} className="flex-1 min-w-0 text-left">
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-2 mb-4"
          >
            <Sparkles className="h-4 w-4 text-brass" />
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brass/80">
              AI Logistics Research
            </p>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] text-foreground font-medium max-w-[520px]"
          >
            How can Courier Guider help?
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-[15px] leading-relaxed text-muted max-w-[480px]"
          >
            Compare couriers with live web research plus your stored knowledge base.
          </motion.p>

          {!isAuthenticated && (
            <motion.div variants={fadeInUp} className="mt-4">
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Sign in to unlock live research
                </Button>
              </Link>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="mt-8">
            <p className="text-[11px] uppercase tracking-widest text-muted/60 mb-3">
              Suggested actions
            </p>
            <SuggestedActions onSelect={onSelectPrompt} />
          </motion.div>

          {isAuthenticated && conversations.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <p className="text-[11px] uppercase tracking-widest text-muted/60 mb-3">
                Recent chats
              </p>
              <div className="flex flex-col gap-0.5">
                {conversations.slice(0, 4).map((conv, index) => (
                  <motion.button
                    key={conv.id}
                    type="button"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelectConversation?.(conv.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-left",
                      "text-[13px] text-muted hover:text-foreground hover:bg-surface-elevated/60",
                      "transition-colors w-full max-w-sm",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    <span className="truncate">{conv.title}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={scaleIn} className="hidden lg:block">
          <SubtleArtwork />
        </motion.div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-border/40 bg-surface-elevated/30 hover:bg-surface-elevated/50 transition-colors cursor-default">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
