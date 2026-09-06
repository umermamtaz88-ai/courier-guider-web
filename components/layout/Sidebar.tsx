"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  BookOpen,
  Bookmark,
  Settings,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  Pencil,
} from "lucide-react";
import type { ConversationSummary } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn, fadeInUp, slideInFromLeft, buttonPress } from "@/lib/animations";

interface SidebarProps {
  conversations?: ConversationSummary[];
  onNewChat?: () => void;
  onSearch?: () => void;
  onSelectConversation?: (id: string) => void;
  onRequestDeleteConversation?: (id: string, title: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onNavigate?: (section: "knowledge" | "saved" | "settings") => void;
  activeConversationId?: string | null;
  className?: string;
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={buttonPress}
      whileHover="hover"
      whileTap="press"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded px-2 py-1.5 text-[13px] transition-colors w-full text-left",
        active
          ? "bg-surface-elevated text-foreground"
          : "text-muted hover:text-foreground hover:bg-surface-elevated/50",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

function ConversationItem({
  conversation,
  active,
  onClick,
  onRequestDelete,
  onRename,
  onPin,
  onArchive,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onClick: () => void;
  onRequestDelete?: () => void;
  onRename?: (title: string) => void;
  onPin?: () => void;
  onArchive?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftTitle(conversation.title);
  }, [conversation.title]);

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

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  const commitRename = () => {
    const next = draftTitle.trim();
    setRenaming(false);
    if (!next || next === conversation.title) {
      setDraftTitle(conversation.title);
      return;
    }
    onRename?.(next);
  };

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={cn(
        "group/conv relative flex items-center rounded",
        active
          ? "bg-surface-elevated text-foreground"
          : "text-muted hover:text-foreground hover:bg-surface-elevated/40",
      )}
    >
      {renaming ? (
        <form
          className="flex-1 px-2 py-1"
          onSubmit={(e) => {
            e.preventDefault();
            commitRename();
          }}
        >
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraftTitle(conversation.title);
                setRenaming(false);
              }
            }}
            className="w-full rounded border border-brass/40 bg-background px-2 py-1 text-[13px] text-foreground outline-none"
            aria-label="Rename chat"
          />
        </form>
      ) : (
        <motion.button
          type="button"
          variants={buttonPress}
          whileHover="hover"
          whileTap="press"
          onClick={onClick}
          className="min-w-0 flex-1 text-left rounded px-2 py-1.5"
        >
          <div className="flex items-center gap-1.5 pr-7">
            {conversation.pinned ? (
              <motion.div
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <Pin className="h-3 w-3 shrink-0 text-brass" />
              </motion.div>
            ) : (
              <MessageSquare className="h-3 w-3 shrink-0 opacity-50" />
            )}
            <span className="text-[13px] truncate">{conversation.title}</span>
          </div>
        </motion.button>
      )}

      <div className="absolute right-1 top-1/2 -translate-y-1/2" ref={menuRef}>
        <motion.button
          type="button"
          variants={buttonPress}
          whileHover="hover"
          whileTap="press"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className={cn(
            "rounded p-1 text-muted hover:text-foreground hover:bg-background/60",
            "opacity-100 sm:opacity-0 sm:group-hover/conv:opacity-100 transition-opacity",
            menuOpen && "opacity-100 bg-background/60",
          )}
          aria-label="Chat options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <motion.div
            animate={{ rotate: menuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              role="menu"
              className={cn(
                "absolute right-0 top-full z-40 mt-1 w-[168px] overflow-hidden rounded-xl",
                "border border-border/70 bg-surface-elevated shadow-xl py-1",
              )}
            >
              <motion.button
                type="button"
                role="menuitem"
                variants={buttonPress}
                whileHover="hover"
                whileTap="press"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-background/50"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5 opacity-80" />
                Rename
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                variants={buttonPress}
                whileHover="hover"
                whileTap="press"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-background/50"
                onClick={() => {
                  setMenuOpen(false);
                  onPin?.();
                }}
              >
                <Pin className="h-3.5 w-3.5 opacity-80" />
                {conversation.pinned ? "Unpin chat" : "Pin chat"}
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                variants={buttonPress}
                whileHover="hover"
                whileTap="press"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-background/50"
                onClick={() => {
                  setMenuOpen(false);
                  onArchive?.();
                }}
              >
                <Archive className="h-3.5 w-3.5 opacity-80" />
                Archive
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                variants={buttonPress}
                whileHover="hover"
                whileTap="press"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-error hover:bg-error/10"
                onClick={() => {
                  setMenuOpen(false);
                  onRequestDelete?.();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Sidebar({
  conversations = [],
  onNewChat,
  onSearch,
  onSelectConversation,
  onRequestDeleteConversation,
  onRenameConversation,
  onPinConversation,
  onArchiveConversation,
  onNavigate,
  activeConversationId,
  className,
}: SidebarProps) {
  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col border-r border-border bg-surface shrink-0",
        className,
      )}
    >
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-brass/25 bg-brass/8">
            <span className="font-serif text-[11px] text-brass">CG</span>
          </div>
          <span className="font-serif text-[14px] text-foreground leading-none">
            Courier Guider
          </span>
        </div>
      </div>

      <div className="px-2 py-2 space-y-0.5">
        <NavItem icon={Plus} label="New Chat" onClick={() => onNewChat?.()} />
        <NavItem icon={Search} label="Search" onClick={() => onSearch?.()} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {pinned.length > 0 && (
          <>
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted/55">
              Pinned
            </p>
            <div className="space-y-0.5 mb-3">
              {pinned.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  active={activeConversationId === conv.id}
                  onClick={() => onSelectConversation?.(conv.id)}
                  onRequestDelete={
                    onRequestDeleteConversation
                      ? () => onRequestDeleteConversation(conv.id, conv.title)
                      : undefined
                  }
                  onRename={
                    onRenameConversation
                      ? (title) => onRenameConversation(conv.id, title)
                      : undefined
                  }
                  onPin={
                    onPinConversation
                      ? () => onPinConversation(conv.id)
                      : undefined
                  }
                  onArchive={
                    onArchiveConversation
                      ? () => onArchiveConversation(conv.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}

        <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted/55">
          Recent
        </p>
        <div className="space-y-0.5 mb-3">
          {recent.length === 0 ? (
            <p className="px-2 py-1 text-[12px] text-muted/70">No saved chats yet</p>
          ) : (
            recent.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={activeConversationId === conv.id}
                onClick={() => onSelectConversation?.(conv.id)}
                onRequestDelete={
                  onRequestDeleteConversation
                    ? () => onRequestDeleteConversation(conv.id, conv.title)
                    : undefined
                }
                onRename={
                  onRenameConversation
                    ? (title) => onRenameConversation(conv.id, title)
                    : undefined
                }
                onPin={
                  onPinConversation
                    ? () => onPinConversation(conv.id)
                    : undefined
                }
                onArchive={
                  onArchiveConversation
                    ? () => onArchiveConversation(conv.id)
                    : undefined
                }
              />
            ))
          )}
        </div>

        <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted/55">
          Knowledge
        </p>
        <div className="space-y-0.5">
          <NavItem
            icon={BookOpen}
            label="Knowledge"
            onClick={() => onNavigate?.("knowledge")}
          />
          <NavItem
            icon={Bookmark}
            label="Saved"
            onClick={() => onNavigate?.("saved")}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            onClick={() => onNavigate?.("settings")}
          />
        </div>
      </div>
    </aside>
  );
}
