"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, LogIn, BookOpen } from "lucide-react";
import { Button } from "./Button";

export type ErrorType =
  | "auth_required"
  | "session_expired"
  | "forbidden"
  | "live_unavailable"
  | "source_outdated"
  | "rag_unavailable"
  | "rag_unavailable_error"
  | "upload_failed"
  | "rate_limited"
  | "llm_rate_limit"
  | "llm_auth_error"
  | "llm_timeout"
  | "llm_unavailable"
  | "web_search_auth"
  | "web_search_rate_limit"
  | "web_search_timeout"
  | "web_search_unavailable"
  | "web_search_empty"
  | "web_search_not_configured"
  | "backend_unavailable"
  | "generic";

/** Soft research notes stay inline — not red alert panels. */
export const SOFT_RESEARCH_ERROR_TYPES = new Set<ErrorType>([
  "web_search_empty",
  "web_search_auth",
  "web_search_rate_limit",
  "web_search_timeout",
  "web_search_unavailable",
  "web_search_not_configured",
  "live_unavailable",
  "source_outdated",
]);

const errorConfig: Record<
  ErrorType,
  {
    title: string;
    message: string;
    actions: ("retry" | "stored" | "signin" | "sources")[];
    severity: "hard" | "soft";
  }
> = {
  auth_required: {
    title: "Sign in required",
    message: "Sign in to use live courier research and chat with your account.",
    actions: ["signin"],
    severity: "hard",
  },
  session_expired: {
    title: "Session expired",
    message: "Your session has expired. Sign in again to continue.",
    actions: ["signin"],
    severity: "hard",
  },
  forbidden: {
    title: "Access denied",
    message: "You do not have permission to perform this action.",
    actions: ["retry"],
    severity: "hard",
  },
  llm_rate_limit: {
    title: "AI service temporarily busy",
    message:
      "The research was retrieved, but the AI synthesis service is temporarily rate-limited.",
    actions: ["retry", "sources"],
    severity: "hard",
  },
  llm_auth_error: {
    title: "AI configuration error",
    message: "The AI service is not configured correctly. Contact your administrator.",
    actions: ["retry"],
    severity: "hard",
  },
  llm_timeout: {
    title: "AI response timed out",
    message: "The AI service took too long to respond. Please try again.",
    actions: ["retry", "sources"],
    severity: "hard",
  },
  llm_unavailable: {
    title: "AI service unavailable",
    message: "The AI synthesis service is temporarily unavailable.",
    actions: ["retry", "sources"],
    severity: "hard",
  },
  web_search_auth: {
    title: "Web research unavailable",
    message: "◇ Web research is temporarily unavailable. Stored verified knowledge is still available.",
    actions: ["retry"],
    severity: "soft",
  },
  web_search_rate_limit: {
    title: "Web research busy",
    message: "◇ Web research is temporarily unavailable. Stored verified knowledge is still available.",
    actions: ["retry"],
    severity: "soft",
  },
  web_search_timeout: {
    title: "Web research timed out",
    message: "◇ Web research is temporarily unavailable. Stored verified knowledge is still available.",
    actions: ["retry"],
    severity: "soft",
  },
  web_search_unavailable: {
    title: "Web research unavailable",
    message: "◇ Web research is temporarily unavailable. Stored verified knowledge is still available.",
    actions: ["retry"],
    severity: "soft",
  },
  web_search_empty: {
    title: "No web sources",
    message: "◇ No relevant web sources found. Using stored verified knowledge where available.",
    actions: [],
    severity: "soft",
  },
  web_search_not_configured: {
    title: "Web research unavailable",
    message: "◇ Web research is temporarily unavailable. Stored verified knowledge is still available.",
    actions: [],
    severity: "soft",
  },
  live_unavailable: {
    title: "Current data unavailable",
    message: "◇ Current web verification unavailable. Using stored verified knowledge where available.",
    actions: ["retry"],
    severity: "soft",
  },
  source_outdated: {
    title: "Source may be outdated",
    message: "Available knowledge may not reflect recent policy changes.",
    actions: ["retry"],
    severity: "soft",
  },
  rag_unavailable: {
    title: "Research temporarily unavailable",
    message: "Knowledge search is unavailable. Demo responses may be shown.",
    actions: ["retry"],
    severity: "hard",
  },
  rag_unavailable_error: {
    title: "Knowledge search failed",
    message: "Could not retrieve knowledge base sources for this query.",
    actions: ["retry"],
    severity: "hard",
  },
  upload_failed: {
    title: "Upload failed",
    message: "The document could not be processed. Check file size and format.",
    actions: ["retry"],
    severity: "hard",
  },
  rate_limited: {
    title: "Rate limit reached",
    message: "Too many requests. Please wait a moment and try again.",
    actions: ["retry"],
    severity: "hard",
  },
  backend_unavailable: {
    title: "Backend unavailable",
    message: "Cannot reach the research server. Start the backend and try again.",
    actions: ["retry"],
    severity: "hard",
  },
  generic: {
    title: "Something interrupted the request",
    message: "Please try again or continue with stored verified knowledge.",
    actions: ["retry"],
    severity: "hard",
  },
};

interface ErrorStateProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
  onUseStored?: () => void;
  onViewSources?: () => void;
  retryDisabled?: boolean;
  className?: string;
}

/**
 * Soft research notes — quiet inline copy, no red alert panel.
 */
export function ResearchNote({
  type = "web_search_empty",
  message,
  className,
}: {
  type?: ErrorType;
  message?: string;
  className?: string;
}) {
  const config = errorConfig[type] ?? errorConfig.generic;
  const isFailure = type !== "web_search_empty";
  return (
    <p
      role="status"
      className={cn(
        "text-[12px] leading-relaxed",
        isFailure ? "text-error/75" : "text-muted",
        className,
      )}
    >
      {message ?? config.message}
    </p>
  );
}

export function ErrorState({
  type = "generic",
  onRetry,
  onViewSources,
  retryDisabled = false,
  message,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];

  // Soft web-search outcomes render as quiet research notes, not red cards
  if (config.severity === "soft" || SOFT_RESEARCH_ERROR_TYPES.has(type)) {
    return (
      <div className={cn("px-0.5 py-1", className)}>
        <ResearchNote type={type} message={message} />
        {config.actions.includes("retry") && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={retryDisabled}
            className="mt-1 text-[11px] text-brass/80 hover:text-brass underline-offset-2 hover:underline disabled:opacity-40"
          >
            Retry research
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-error/20 bg-error/5 p-4",
        className,
      )}
      role="alert"
    >
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-error mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-error">
            {config.title}
          </p>
          <p className="text-sm text-muted">{message ?? config.message}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {config.actions.includes("signin") && (
              <Link
                href="/login"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:border-brass/40 hover:bg-surface-elevated/50"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
            {config.actions.includes("retry") && onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} disabled={retryDisabled}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {config.actions.includes("sources") && onViewSources && (
              <Button variant="ghost" size="sm" onClick={onViewSources}>
                <BookOpen className="h-3.5 w-3.5" />
                View sources
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
