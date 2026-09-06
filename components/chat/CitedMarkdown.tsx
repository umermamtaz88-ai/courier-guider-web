"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { Source } from "@/types/api";
import { CitationPill } from "@/components/chat/SourceCard";
import type { ReactNode } from "react";

const CITATION_RE = /\[(S?\d+)\]/gi;

function resolveSource(token: string, sources: Source[]): { source?: Source; index: number } {
  const raw = token.toUpperCase();
  const byId = sources.findIndex((s) => {
    const id = (s.id || "").toString().toUpperCase().replace(/^\[|\]$/g, "");
    return id === raw || id === raw.replace(/^S/, "") || `S${id}` === raw;
  });
  if (byId >= 0) return { source: sources[byId], index: byId + 1 };

  const num = Number(raw.replace(/^S/i, ""));
  if (Number.isFinite(num) && num >= 1 && num <= sources.length) {
    return { source: sources[num - 1], index: num };
  }
  return { index: num || 0 };
}

function renderTextWithCitations(
  text: string,
  sources: Source[],
): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(CITATION_RE.source, "gi");
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const { source, index } = resolveSource(match[1], sources);
    if (source) {
      parts.push(
        <CitationPill
          key={`cite-${match.index}-${match[1]}`}
          source={source}
          index={index}
        />,
      );
    } else {
      parts.push(match[0]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts;
}

function walkChildren(children: ReactNode, sources: Source[]): ReactNode {
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, i) => {
            if (typeof child === "string") {
              return (
                <span key={i}>{renderTextWithCitations(child, sources)}</span>
              );
            }
            return child;
          })
        : typeof children === "string"
          ? renderTextWithCitations(children, sources)
          : children}
    </>
  );
}

interface CitedMarkdownProps {
  content: string;
  sources?: Source[];
}

export function CitedMarkdown({ content, sources = [] }: CitedMarkdownProps) {
  const components: Components = {
    p: ({ children }) => (
      <p className="mb-3 last:mb-0">{walkChildren(children, sources)}</p>
    ),
    li: ({ children }) => <li>{walkChildren(children, sources)}</li>,
    strong: ({ children }) => (
      <strong className="font-medium text-foreground">
        {walkChildren(children, sources)}
      </strong>
    ),
    em: ({ children }) => <em>{walkChildren(children, sources)}</em>,
    h2: ({ children }) => (
      <h2 className="font-serif text-base mt-4 mb-2 first:mt-0">
        {walkChildren(children, sources)}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-medium mt-3 mb-1.5">
        {walkChildren(children, sources)}
      </h3>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brass underline underline-offset-2 hover:text-brass-light break-all"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="prose-cg text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
