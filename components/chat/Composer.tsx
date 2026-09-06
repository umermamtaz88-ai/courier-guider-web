"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Plus,
  Globe,
  GitCompare,
  Mic,
  MicOff,
  X,
  FileText,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { extractContextChips } from "@/lib/context-parser";
import type { ContextChip, Priority } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn, buttonPress, fadeInUp } from "@/lib/animations";

const COMPARE_PROMPT =
  "Compare TCS and Leopards for my shipment — which is better for my priorities?";

const RESEARCH_PROMPT =
  "Check current courier information and compare available options for ";

interface ComposerProps {
  onSend: (message: string, priority: Priority) => void;
  onAttach?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  variant?: "default" | "welcome";
  /** When draftKey changes, seed the composer with draftSeed (edit prompt). */
  draftSeed?: string;
  draftKey?: number;
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: { length: number; [index: number]: { isFinal: boolean; 0: { transcript: string } } };
  }) => void) | null;
};

function getSpeechRecognition():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function Composer({
  onSend,
  onAttach,
  disabled,
  placeholder = "Ask Courier Guider anything about shipping…",
  variant = "default",
  draftSeed,
  draftKey = 0,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [chips, setChips] = useState<ContextChip[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [priority] = useState<Priority>("balanced");
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isWelcome = variant === "welcome";

  useEffect(() => {
    if (draftKey <= 0 || draftSeed == null) return;
    setValue(draftSeed);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(draftSeed.length, draftSeed.length);
    });
  }, [draftKey, draftSeed]);

  useEffect(() => {
    if (value.length > 10) {
      setChips(extractContextChips(value));
    } else {
      setChips([]);
    }
  }, [value]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const focusComposer = useCallback((text: string) => {
    setValue(text);
    setMenuOpen(false);
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(text.length, text.length);
    }, 0);
  }, []);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) return;
    setSending(true);
    onSend(trimmed, priority);
    setValue("");
    setChips([]);
    setAttachment(null);
    setMenuOpen(false);
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      onAttach?.(file);
      setMenuOpen(false);
    }
  };

  const handleCompare = () => {
    setVoiceNotice(null);
    if (!value.trim()) focusComposer(COMPARE_PROMPT);
    else focusComposer(`${value.trim()}\n\nPlease compare couriers for this shipment.`);
  };

  const handleResearchWeb = () => {
    setVoiceNotice(null);
    if (!value.trim()) focusComposer(RESEARCH_PROMPT);
    else focusComposer(`${value.trim()}\n\nPlease check current provider information.`);
  };

  const handleVoice = () => {
    setVoiceNotice(null);
    setMenuOpen(false);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceNotice("Voice not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;
        if (event.error === "not-allowed") {
          setVoiceNotice("Microphone access denied.");
        } else if (event.error !== "aborted") {
          setVoiceNotice("Could not capture voice.");
        }
      };
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setValue((prev) => {
            const spacer = prev && !prev.endsWith(" ") ? " " : "";
            return `${prev}${spacer}${transcript}`.trimStart();
          });
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceNotice("Voice input failed to start.");
      setIsListening(false);
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative px-3 py-3 overflow-hidden",
        "bg-gradient-to-t from-background via-background to-transparent",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="composer-glow-ambient" aria-hidden />
      <div className="composer-glow-ambient-secondary" aria-hidden />

      <div className={cn("relative z-10 mx-auto", isWelcome ? "max-w-[720px]" : "max-w-3xl")}>
        <AnimatePresence mode="wait">
          {chips.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-wrap gap-1 mb-2 px-1"
            >
              {chips.map((chip) => (
                <motion.span
                  key={chip.id}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="inline-flex items-center gap-1 rounded-full border border-brass/20 bg-surface-elevated px-2 py-0.5 text-[11px] text-brass"
                >
                  {chip.label}
                  <motion.button
                    type="button"
                    variants={buttonPress}
                    whileHover="hover"
                    whileTap="press"
                    onClick={() =>
                      setChips((prev) => prev.filter((c) => c.id !== chip.id))
                    }
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </motion.button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {attachment && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex items-center gap-2 mb-2 px-1"
            >
              <motion.span
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface-elevated px-2.5 py-1 text-[11px] text-muted"
              >
                {attachment.type.startsWith("image/") ? (
                  <ImageIcon className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                {attachment.name}
                <motion.button
                  type="button"
                  variants={buttonPress}
                  whileHover="hover"
                  whileTap="press"
                  onClick={() => setAttachment(null)}
                >
                  <X className="h-2.5 w-2.5 hover:text-foreground" />
                </motion.button>
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <div
            className={cn(
              "composer-glow-pill",
              (focused || isListening || hasText) && "composer-glow-pill--active",
            )}
            aria-hidden
          />
          <div
            className={cn(
              "relative z-10 flex items-end gap-1 rounded-[28px] px-2 py-1.5 transition-colors duration-200",
              "bg-[#1a1917]/95 backdrop-blur-sm border",
              focused ? "border-brass/30" : "border-border/30",
            )}
          >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleFile}
          />

          <motion.div className="relative shrink-0" ref={menuRef}>
            <motion.button
              type="button"
              variants={buttonPress}
              whileHover="hover"
              whileTap="press"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-elevated/80 transition-colors"
              aria-label="More actions"
              aria-expanded={menuOpen}
            >
              <motion.div
                animate={{ rotate: menuOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-4 w-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-0 mb-2 w-44 rounded-lg border border-border bg-surface-elevated py-1 shadow-elevated z-10"
                >
                  <MenuItem
                    icon={Paperclip}
                    label="Attach file"
                    onClick={() => fileRef.current?.click()}
                  />
                  <MenuItem icon={Globe} label="Research web" onClick={handleResearchWeb} />
                  <MenuItem icon={GitCompare} label="Compare couriers" onClick={handleCompare} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Message input"
            className={cn(
              "flex-1 resize-none bg-transparent py-2 px-1",
              "text-[14px] text-foreground placeholder:text-muted/50",
              "focus:outline-none min-h-[36px] max-h-[96px] leading-relaxed",
            )}
          />

          {hasText ? (
            <motion.button
              type="button"
              variants={buttonPress}
              whileHover="hover"
              whileTap="press"
              onClick={handleSend}
              disabled={disabled || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-ink hover:bg-brass-light transition-colors disabled:opacity-40"
              aria-label="Send message"
            >
              <motion.div
                animate={sending ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 0.5, repeat: sending ? Infinity : 0 }}
              >
                <Send className="h-4 w-4" />
              </motion.div>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              variants={buttonPress}
              whileHover="hover"
              whileTap="press"
              onClick={handleVoice}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                isListening
                  ? "bg-brass/15 text-brass border border-brass/30"
                  : "text-muted hover:text-foreground hover:bg-surface-elevated/80",
              )}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </motion.div>
            </motion.button>
          )}
          </div>
        </div>

        {(voiceNotice || isListening) && (
          <p
            className={cn(
              "mt-1.5 px-2 text-[10px]",
              voiceNotice ? "text-warning" : "text-brass/80",
            )}
            role="status"
          >
            {voiceNotice ?? "Listening… speak your shipping question"}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={buttonPress}
      whileHover="hover"
      whileTap="press"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-muted hover:text-foreground hover:bg-surface transition-colors text-left"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </motion.button>
  );
}
