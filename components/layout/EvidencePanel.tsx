"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, PanelRightClose, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import type { Source, Attachment } from "@/types/api";

interface EvidencePanelProps {
  open: boolean;
  onClose: () => void;
  sources: Source[];
  attachments?: Attachment[];
  className?: string;
}

function hostLabel(source: Source): string | null {
  if (source.domain) return source.domain;
  if (!source.url) return null;
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function SourcePreview({ source, index }: { source: Source; index: number }) {
  const host = hostLabel(source);
  const unofficial = source.tier === "third_party";
  const title =
    source.carrier || source.provider || source.publisher || source.title;

  return (
    <article className="rounded border border-border/45 bg-surface-elevated/25 p-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-muted/55">
          {String(index).padStart(2, "0")}
        </span>
        <h4 className="text-[13px] text-foreground leading-snug">{title}</h4>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {unofficial
          ? "Unofficial third-party source"
          : source.tier === "internal_doc"
            ? "Verified knowledge document"
            : "Official provider source"}
        {host ? ` · ${host}` : null}
      </p>
      {source.date ? (
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted/55">
          Updated {source.date}
        </p>
      ) : null}
      {source.title && source.title !== title ? (
        <p className="mt-1.5 text-[11px] text-muted/80 line-clamp-2">{source.title}</p>
      ) : null}
      {unofficial ? (
        <span className="mt-2 inline-flex rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-amber-300/90">
          Unofficial
        </span>
      ) : null}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-brass hover:text-brass-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 rounded"
        >
          Open source
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </article>
  );
}

function SourceSections({ sources }: { sources: Source[] }) {
  const official = sources.filter(
    (s) =>
      s.tier === "official" ||
      s.source_type === "official" ||
      s.source_type === "government",
  );
  const docs = sources.filter(
    (s) =>
      s.tier === "internal_doc" ||
      (!s.tier && !s.url && s.source_type !== "official"),
  );
  const third = sources.filter(
    (s) =>
      s.tier === "third_party" ||
      (!official.includes(s) && !docs.includes(s)),
  );
  const leftover =
    official.length + docs.length + third.length > 0
      ? sources.filter(
          (s) => !official.includes(s) && !docs.includes(s) && !third.includes(s),
        )
      : sources;

  let n = 1;
  return (
    <div className="space-y-4">
      {official.length > 0 && (
        <section>
          <h3 className="mb-2 font-serif text-[11px] tracking-wide text-brass/80">
            Official sources
          </h3>
          <div className="space-y-2">
            {official.map((s) => (
              <SourcePreview key={`o-${s.id || s.url || n}`} source={s} index={n++} />
            ))}
          </div>
        </section>
      )}
      {docs.length > 0 && (
        <section>
          <h3 className="mb-2 font-serif text-[11px] tracking-wide text-muted">
            Verified knowledge
          </h3>
          <div className="space-y-2">
            {docs.map((s) => (
              <SourcePreview key={`d-${s.id || s.title || n}`} source={s} index={n++} />
            ))}
          </div>
        </section>
      )}
      {third.length > 0 && (
        <section>
          <h3 className="mb-2 font-serif text-[11px] tracking-wide text-amber-300/80">
            Third-party sources
          </h3>
          <div className="space-y-2">
            {third.map((s) => (
              <SourcePreview key={`t-${s.id || s.url || n}`} source={s} index={n++} />
            ))}
          </div>
        </section>
      )}
      {leftover.length > 0 && official.length + docs.length + third.length === 0 && (
        <div className="space-y-2">
          {leftover.map((s) => (
            <SourcePreview key={`a-${s.id || s.url || n}`} source={s} index={n++} />
          ))}
        </div>
      )}
    </div>
  );
}

export function EvidencePanel({
  open,
  onClose,
  sources,
  attachments = [],
  className,
}: EvidencePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "hidden lg:flex h-full flex-col border-l border-border bg-surface overflow-hidden shrink-0",
            className,
          )}
          aria-label="Sources"
        >
          <PanelContent
            onClose={onClose}
            sources={sources}
            attachments={attachments}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function EvidencePanelMobile({
  open,
  onClose,
  sources,
  attachments = [],
}: EvidencePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] flex flex-col rounded-t-lg border-t border-border bg-surface"
            role="dialog"
            aria-label="Sources"
          >
            <PanelContent
              onClose={onClose}
              sources={sources}
              attachments={attachments}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  onClose,
  sources,
  attachments,
}: {
  onClose: () => void;
  sources: Source[];
  attachments: Attachment[];
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 shrink-0">
        <div>
          <h2 className="font-serif text-[13px] text-foreground tracking-wide">
            Sources
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted/55 mt-0.5">
            {sources.length} source{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted hover:text-foreground hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          aria-label="Close sources"
        >
          <X className="h-3.5 w-3.5 lg:hidden" />
          <PanelRightClose className="h-3.5 w-3.5 hidden lg:block" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {sources.length > 0 ? (
          <SourceSections sources={sources} />
        ) : (
          <p className="text-[12px] text-muted italic">
            Sources appear when research cites evidence.
          </p>
        )}

        {attachments.length > 0 && (
          <section>
            <h3 className="mb-2 font-serif text-[11px] tracking-wide text-muted">
              Documents
            </h3>
            {attachments.map((att) => (
              <div
                key={att.id}
                className="rounded border border-border/50 bg-surface-elevated/30 p-2 mb-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-brass" />
                  <span className="text-[12px] text-foreground truncate">
                    {att.filename}
                  </span>
                </div>
                <Badge variant="muted" className="mt-1">
                  {att.processing_status}
                </Badge>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
