"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, MessageSquare, Sparkles } from "lucide-react";
import type { ConversationSummary } from "@/types/api";

const SUGGESTED_PROMPTS = [
  "I have 8kg clothes from Lahore to Karachi. Which courier is better?",
  "Compare TCS and Leopards for e-commerce COD shipments.",
  "What paperwork do I need to ship clothes to Dubai?",
  "Search the web for the latest Leopards shipping services.",
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  onSelectConversation: (id: string) => void;
  conversations?: ConversationSummary[];
}

export function CommandPalette({
  open,
  onClose,
  onSelectPrompt,
  onSelectConversation,
  conversations = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const filteredRecent = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [query, conversations]);

  const filteredPrompts = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return SUGGESTED_PROMPTS;
    return SUGGESTED_PROMPTS.filter((p) => p.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search conversations"
        className="relative w-full max-w-lg rounded-lg border border-border bg-surface shadow-elevated overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats, topics, couriers…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] text-muted/50 border border-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin">
          {filteredRecent.length > 0 && (
            <section className="mb-2">
              <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted/55">
                Saved chats
              </p>
              {filteredRecent.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] text-foreground truncate">{conv.title}</p>
                    <p className="text-[11px] text-muted truncate">{conv.preview}</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {filteredPrompts.length > 0 && (
            <section>
              <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted/55">
                Ask about
              </p>
              {filteredPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    onSelectPrompt(prompt);
                    onClose();
                  }}
                  className="flex w-full items-start gap-2 rounded px-2 py-2 text-left hover:bg-surface-elevated transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brass/70 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-muted line-clamp-2">{prompt}</span>
                </button>
              ))}
            </section>
          )}

          {filteredRecent.length === 0 && filteredPrompts.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
