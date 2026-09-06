"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, PanelRightOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/lib/hooks/useAuth";

interface HeaderProps {
  inConversation?: boolean;
  onOpenSidebar?: () => void;
  onOpenEvidence?: () => void;
  onDeleteChat?: () => void;
  evidenceCount?: number;
  evidenceOpen?: boolean;
  knowledgeStatus?: "current" | "live_web" | "unavailable";
}

export function Header({
  inConversation = false,
  onOpenSidebar,
  onOpenEvidence,
  onDeleteChat,
  evidenceCount = 0,
  evidenceOpen,
  knowledgeStatus = "current",
}: HeaderProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const statusLabel =
    knowledgeStatus === "live_web"
      ? "Live web search"
      : knowledgeStatus === "unavailable"
        ? "Knowledge unavailable"
        : "Knowledge base";

  return (
    <header className="flex items-center justify-between border-b border-border/50 bg-surface/80 px-3 py-2 shrink-0 h-11">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 shrink-0"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[15px] text-foreground">
              Courier Guider
            </span>
            {!inConversation && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    knowledgeStatus === "current" && "bg-success",
                    knowledgeStatus === "live_web" && "bg-brass",
                    knowledgeStatus === "unavailable" && "bg-error",
                  )}
                  aria-hidden
                />
                {statusLabel}
              </span>
            )}
          </div>
          {inConversation && (
            <p className="text-[11px] text-muted truncate">Research session</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {inConversation && onDeleteChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteChat}
            className="h-7 text-[11px] px-2 text-muted hover:text-error"
            aria-label="Delete this chat"
            title="Delete chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">Delete</span>
          </Button>
        )}
        {evidenceCount > 0 && !evidenceOpen && inConversation && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEvidence}
            className="hidden sm:inline-flex h-7 text-[11px] px-2"
          >
            <PanelRightOpen className="h-3 w-3" />
            Sources · {evidenceCount}
          </Button>
        )}

        {!isLoading && (
          <>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[12px] text-muted truncate max-w-[120px]">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-[12px] text-muted hover:text-foreground transition-colors px-1"
                >
                  Sign in
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="h-7 text-[11px] px-3">
                    Create account
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {inConversation && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenEvidence}
            className="sm:hidden h-8 w-8"
            aria-label="Open evidence"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
