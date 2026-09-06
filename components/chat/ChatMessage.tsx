"use client";

import { Bookmark, Copy, Check, Pencil } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { ProviderComparison } from "@/components/comparison/ProviderComparison";
import { WebResearchSummary } from "@/components/chat/WebResearchSummary";
import { KnowledgeBadge } from "@/components/chat/SourceChip";
import { CitedMarkdown } from "@/components/chat/CitedMarkdown";
import { useReducedMotion } from "@/lib/hooks/useScrollBehavior";
import type { ChatMessage as ChatMessageType, Source } from "@/types/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { messageVariants, buttonPress, scaleIn } from "@/lib/animations";

const ANSWER_TYPE_LABELS: Record<string, string> = {
  provider_comparison: "Courier comparison",
  shipping_estimate: "Price estimate",
  policy_explanation: "Policy",
  documentation_checklist: "Documents",
  customs_question: "Customs",
  problem_resolution: "Problem help",
  general_answer: "General",
  greeting: "Welcome",
};

function researchKind(
  message: ChatMessageType,
): "none" | "no_results" | "failed" | "complete" {
  if (message.researchKind) return message.researchKind;
  if (message.webSearchUsed) return "complete";
  if (message.ragUsed && message.sources && message.sources.length > 0) {
    return "complete";
  }
  return "none";
}

function knowledgeKind(
  message: ChatMessageType,
): "current" | "web" | "verified" | "document" | "unofficial" | null {
  if (message.webSearchUsed) return "web";
  if (message.ragUsed) return "verified";
  return null;
}

/** Quiet research notes only — drop duplicate loud warning lines. */
function quietWarnings(warnings: string[] | undefined): string[] {
  if (!warnings?.length) return [];
  const skip = [
    /couldn't verify the latest web/i,
    /no current official web pages/i,
    /configure llm_api_key/i,
    /unstructured llm/i,
  ];
  return warnings.filter((w) => !skip.some((re) => re.test(w)));
}

interface ChatMessageProps {
  message: ChatMessageType;
  onOpenEvidence?: () => void;
  onOpenSource?: (source: Source) => void;
  onEditPrompt?: (messageId: string, content: string) => void;
  streamingContent?: string;
}

export function ChatMessage({
  message,
  onOpenEvidence,
  onOpenSource,
  onEditPrompt,
  streamingContent,
}: ChatMessageProps) {
  const reduced = useReducedMotion();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const content = streamingContent ?? message.content;
  const sourceCount = message.sources?.length ?? 0;
  const warnings = quietWarnings(message.warnings);
  const kind = researchKind(message);
  const badge = knowledgeKind(message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <motion.div
      variants={reduced ? {} : messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "group/msg flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[min(720px,92%)]",
          isUser ? "ml-8" : "mr-4",
        )}
      >
        {!isUser && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {message.answerType ? (
              <Badge variant="muted">
                {ANSWER_TYPE_LABELS[message.answerType] ?? message.answerType}
              </Badge>
            ) : null}
            {badge ? <KnowledgeBadge kind={badge} /> : null}
          </div>
        )}

        {!isUser && !message.isStreaming && (kind !== "none" || sourceCount > 0 || message.researchNote) ? (
          <div className="mb-2.5">
            <WebResearchSummary
              sources={message.sources ?? []}
              kind={kind}
              note={message.researchNote}
              onOpenSources={onOpenEvidence}
              onOpenSource={onOpenSource}
            />
          </div>
        ) : null}

        <div
          className={cn(
            "rounded-md px-3 py-2.5",
            isUser
              ? "bg-brass/8 border border-brass/15 text-foreground"
              : "bg-surface-elevated/50 border border-border/40",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div>
              <CitedMarkdown content={content} sources={message.sources ?? []} />
              {message.isStreaming && (
                <span
                  className="inline-block w-0.5 h-4 bg-brass ml-0.5 align-middle animate-pulse"
                  aria-hidden
                />
              )}
            </div>
          )}
        </div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className={cn(
            "mt-1.5 flex items-center gap-1",
            isUser ? "justify-end" : "justify-start",
            "opacity-100 sm:opacity-0 sm:group-hover/msg:opacity-100 transition-opacity",
          )}
        >
          <motion.div variants={buttonPress} whileHover="hover" whileTap="press">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </motion.div>
          {isUser && onEditPrompt && !message.isStreaming && (
            <motion.div variants={buttonPress} whileHover="hover" whileTap="press">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-muted"
                onClick={() => onEditPrompt(message.id, content)}
                aria-label="Edit prompt"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="ml-1">Edit</span>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {!isUser && warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {warnings.map((w) => (
              <p key={w} className="text-[12px] text-muted/75 leading-relaxed">
                {w}
              </p>
            ))}
          </div>
        )}

        {!isUser && message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-4">
            <ProviderComparison
              recommendations={message.recommendations}
              onShowEvidence={onOpenEvidence}
            />
          </div>
        )}

        {!isUser && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-2 flex items-center gap-3"
          >
            <motion.div variants={buttonPress} whileHover="hover" whileTap="press">
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2"
                onClick={() => setSaved(!saved)}
                aria-pressed={saved}
              >
                <motion.div
                  animate={{ scale: saved ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brass text-brass")} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
