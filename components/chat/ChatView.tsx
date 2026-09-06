"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { generateId } from "@/lib/utils";
import {
  sendChatMessage,
  uploadAttachment,
  listConversations,
  loadConversationMessages,
  deleteConversation,
  updateConversation,
  getPinnedChatIds,
  setPinnedChatIds,
  togglePinnedChatId,
} from "@/lib/api/chat";
import { chatResponseToMessage } from "@/lib/chat-utils";
import { clearTokens, getConversationId, mapApiError, mapChatResponseStatus, setConversationId } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type {
  ChatMessage,
  ConversationSummary,
  Source,
  Attachment,
  Priority,
} from "@/types/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  EvidencePanel,
  EvidencePanelMobile,
} from "@/components/layout/EvidencePanel";
import { Drawer } from "@/components/shared/Drawer";
import { ChatMessage as ChatMessageComponent } from "@/components/chat/ChatMessage";
import { Composer } from "@/components/chat/Composer";
import { NewMessageButton } from "@/components/chat/NewMessageButton";
import { WebResearchStatus, type ResearchStep } from "@/components/chat/WebResearchStatus";
import { ErrorState, SOFT_RESEARCH_ERROR_TYPES, type ErrorType } from "@/components/shared/Status";
import { useScrollBehavior } from "@/lib/hooks/useScrollBehavior";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { DeleteChatDialog } from "@/components/chat/DeleteChatDialog";

const RESEARCH_MESSAGES = [
  "Researching current courier information",
  "Checking official provider sources",
  "Reviewing verified knowledge",
  "Comparing relevant information",
];

function simulateStreaming(
  fullText: string,
  onChunk: (text: string) => void,
  onDone: () => void,
) {
  let i = 0;
  const chunkSize = 8;
  const interval = setInterval(() => {
    i += chunkSize;
    onChunk(fullText.slice(0, i));
    if (i >= fullText.length) {
      clearInterval(interval);
      onDone();
    }
  }, 25);
  return () => clearInterval(interval);
}

export function ChatView() {
  const { isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [researchMessage, setResearchMessage] = useState(RESEARCH_MESSAGES[0]);
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<{ type: ErrorType; message?: string } | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [conversationId, setConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [liveWebSearch, setLiveWebSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState("");
  const [draftKey, setDraftKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string | null;
    title: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const inFlightRef = useRef<string | null>(null);

  const inConversation = messages.length > 0 || isResearching;

  const messageDeps = [messages.length, streamingContent, isResearching];
  const {
    containerRef,
    showNewMessageButton,
    scrollToBottom,
    handleScroll,
    onNewContent,
  } = useScrollBehavior(messageDeps, inConversation);

  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }
    try {
      const rows = await listConversations();
      const pinned = new Set(getPinnedChatIds());
      const mapped: ConversationSummary[] = rows.map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        preview: c.title,
        status: c.status,
        pinned: pinned.has(c.id),
      }));
      mapped.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      setConversations(mapped);
    } catch {
      setConversations([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const stored = getConversationId();
    if (stored) setConvId(stored);
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (isResearching) {
      const steps: ResearchStep[] = [
        { id: "1", label: "Searching Courier Guider knowledge", status: "done" },
        { id: "2", label: "Checking official provider sources", status: "active" },
        { id: "3", label: "Comparing relevant information", status: "pending" },
      ];
      setResearchSteps(steps);
      setResearchMessage(RESEARCH_MESSAGES[0]);

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setResearchMessage(RESEARCH_MESSAGES[step % RESEARCH_MESSAGES.length]);
        setResearchSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status:
              i < Math.min(step, prev.length - 1)
                ? "done"
                : i === Math.min(step, prev.length - 1)
                  ? "active"
                  : ("pending" as const),
          })),
        );
      }, 1400);

      return () => clearInterval(interval);
    }
  }, [isResearching]);

  const openEvidence = useCallback((sources: Source[]) => {
    setActiveSources(sources);
    setEvidenceOpen(true);
  }, []);

  const handleSend = useCallback(
    async (text: string, priority: Priority) => {
      if (inFlightRef.current) return;
      if (!isAuthenticated) {
        setError({ type: "auth_required" });
        return;
      }

      const requestId = generateId();
      inFlightRef.current = requestId;
      setError(null);
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      onNewContent();
      setIsResearching(true);

      try {
        const response = await sendChatMessage(text, conversationId, priority);
        setConvId(response.conversation_id);
        setConversationId(response.conversation_id);
        setLiveWebSearch(Boolean(response.web_search_used));
        await refreshConversations();

        setIsResearching(false);

        const llmStatus = mapChatResponseStatus(response);
        // Soft web-research outcomes live on the message — not a chat-level alert panel.
        if (
          llmStatus.showLlmWarning &&
          llmStatus.warningType &&
          !SOFT_RESEARCH_ERROR_TYPES.has(llmStatus.warningType as ErrorType)
        ) {
          setError({
            type: llmStatus.warningType,
            message: llmStatus.message,
          });
        } else {
          setError(null);
        }

        const assistantMsg = chatResponseToMessage(response);
        setActiveSources(response.sources);
        setMessages((prev) => [
          ...prev,
          { ...assistantMsg, content: "", isStreaming: true },
        ]);
        setStreamingId(assistantMsg.id);
        setStreamingContent("");

        cleanupRef.current = simulateStreaming(
          response.answer,
          (chunk) => {
            setStreamingContent(chunk);
            onNewContent();
          },
          () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...assistantMsg, isStreaming: false }
                  : m,
              ),
            );
            setStreamingId(null);
            setStreamingContent("");
            onNewContent();
          },
        );
      } catch (err) {
        setIsResearching(false);
        const mapped = mapApiError(err);
        if (mapped.type === "auth_required" || mapped.type === "session_expired") {
          clearTokens();
          logout();
        }
        setError({ type: mapped.type, message: mapped.message });
      } finally {
        inFlightRef.current = null;
      }
    },
    [conversationId, isAuthenticated, logout, onNewContent, refreshConversations],
  );

  const handleAttach = useCallback(
    async (file: File) => {
      if (!isAuthenticated) {
        setError({ type: "auth_required" });
        return;
      }
      try {
        const att = await uploadAttachment(file, conversationId);
        setAttachments((prev) => [...prev, att]);
      } catch (err) {
        const mapped = mapApiError(err);
        setError({ type: mapped.type, message: mapped.message });
      }
    },
    [conversationId, isAuthenticated],
  );

  const handleNewChat = () => {
    setMessages([]);
    setConvId(null);
    setConversationId(null);
    setActiveSources([]);
    setAttachments([]);
    setError(null);
    setLiveWebSearch(false);
    setEvidenceOpen(false);
    setSidebarOpen(false);
    setSearchOpen(false);
    setComposerDraft("");
    setDraftKey(0);
  };

  const requestDeleteConversation = useCallback(
    (id: string, title: string) => {
      if (!isAuthenticated) {
        setError({ type: "auth_required" });
        return;
      }
      setDeleteTarget({ id, title: title || "Untitled" });
    },
    [isAuthenticated],
  );

  const confirmDeleteConversation = useCallback(async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    if (!id) {
      setDeleteTarget(null);
      handleNewChat();
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteConversation(id);
      setPinnedChatIds(getPinnedChatIds().filter((x) => x !== id));
      setDeleteTarget(null);
      if (conversationId === id) {
        handleNewChat();
      }
      await refreshConversations();
    } catch (err) {
      const mapped = mapApiError(err);
      setError({ type: mapped.type, message: mapped.message });
    } finally {
      setDeleteBusy(false);
    }
  }, [conversationId, deleteTarget, refreshConversations]);

  const handleDeleteCurrentChat = useCallback(() => {
    if (conversationId) {
      const title =
        conversations.find((c) => c.id === conversationId)?.title || "Untitled";
      requestDeleteConversation(conversationId, title);
      return;
    }
    if (messages.length > 0) {
      setDeleteTarget({ id: null, title: "this chat" });
    }
  }, [conversationId, conversations, messages.length, requestDeleteConversation]);

  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      if (!isAuthenticated) {
        setError({ type: "auth_required" });
        return;
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      );
      try {
        await updateConversation(id, { title });
        await refreshConversations();
      } catch (err) {
        const mapped = mapApiError(err);
        setError({ type: mapped.type, message: mapped.message });
        await refreshConversations();
      }
    },
    [isAuthenticated, refreshConversations],
  );

  const handlePinConversation = useCallback(
    (id: string) => {
      togglePinnedChatId(id);
      void refreshConversations();
    },
    [refreshConversations],
  );

  const handleArchiveConversation = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError({ type: "auth_required" });
        return;
      }
      try {
        await updateConversation(id, { status: "archived" });
        if (conversationId === id) {
          handleNewChat();
        }
        await refreshConversations();
      } catch (err) {
        const mapped = mapApiError(err);
        setError({ type: mapped.type, message: mapped.message });
      }
    },
    [conversationId, isAuthenticated, refreshConversations],
  );

  const handleEditPrompt = useCallback(
    (messageId: string, content: string) => {
      if (isResearching) return;
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx < 0) return;
      setMessages((prev) => prev.slice(0, idx));
      setError(null);
      setActiveSources([]);
      setComposerDraft(content);
      setDraftKey((k) => k + 1);
    },
    [isResearching, messages],
  );

  const handleSelectConversation = useCallback(async (id: string) => {
    setConvId(id);
    setConversationId(id);
    setSidebarOpen(false);
    setError(null);

    if (!isAuthenticated) return;

    try {
      const rows = await loadConversationMessages(id);
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.created_at ? new Date(m.created_at) : new Date(),
        })),
      );
    } catch (err) {
      const mapped = mapApiError(err);
      setError({ type: mapped.type, message: mapped.message });
    }
  }, [isAuthenticated]);

  const handleSidebarNavigate = (section: "knowledge" | "saved" | "settings") => {
    setSidebarOpen(false);
    const prompts: Record<string, string> = {
      knowledge: "What courier knowledge sources do you have available?",
      saved: "Show my saved shipping answers and recommendations.",
      settings: "What settings can I configure for courier research?",
    };
    handleSend(prompts[section], "balanced");
  };

  const handleRetry = () => {
    setError(null);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
      handleSend(lastUser.content, "balanced");
    }
  };

  const allSources = messages.flatMap((m) => m.sources ?? []);
  const uniqueSources = allSources.filter(
    (s, i, arr) => arr.findIndex((x) => x.title === s.title) === i,
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <div className="hidden lg:block shrink-0">
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSearch={() => setSearchOpen(true)}
          onNavigate={handleSidebarNavigate}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onRequestDeleteConversation={requestDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onPinConversation={handlePinConversation}
          onArchiveConversation={handleArchiveConversation}
        />
      </div>

      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        side="left"
        title="Courier Guider"
      >
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSearch={() => {
            setSearchOpen(true);
            setSidebarOpen(false);
          }}
          onNavigate={handleSidebarNavigate}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onRequestDeleteConversation={requestDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onPinConversation={handlePinConversation}
          onArchiveConversation={handleArchiveConversation}
          className="w-full border-0"
        />
      </Drawer>

      <main className="flex flex-1 flex-col min-w-0">
        <Header
          inConversation={inConversation}
          knowledgeStatus={liveWebSearch ? "live_web" : "current"}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenEvidence={() => setEvidenceOpen(true)}
          onDeleteChat={handleDeleteCurrentChat}
          evidenceCount={uniqueSources.length}
          evidenceOpen={evidenceOpen}
        />

        <div className="relative flex-1 min-h-0 flex flex-col">
          {!inConversation ? (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <WelcomeScreen
                onSelectPrompt={(prompt) => handleSend(prompt, "balanced")}
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                isAuthenticated={isAuthenticated}
              />
            </div>
          ) : (
            <div className="relative flex-1 min-h-0">
              <div
                ref={containerRef}
                onScroll={handleScroll}
                className="absolute inset-0 overflow-y-auto px-4 py-4 scrollbar-thin"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                <div className="mx-auto max-w-[720px] space-y-4 pb-4">
                  {messages.map((msg) => (
                    <ChatMessageComponent
                      key={msg.id}
                      message={msg}
                      streamingContent={
                        msg.id === streamingId ? streamingContent : undefined
                      }
                      onOpenEvidence={() =>
                        openEvidence(msg.sources ?? uniqueSources)
                      }
                      onOpenSource={() =>
                        openEvidence(msg.sources ?? uniqueSources)
                      }
                      onEditPrompt={handleEditPrompt}
                    />
                  ))}

                  {isResearching && (
                    <WebResearchStatus
                      phase="searching"
                      statusMessage={researchMessage}
                      detail="Checking official provider sources..."
                      steps={researchSteps}
                    />
                  )}

                  {error && (
                    <ErrorState
                      type={error.type}
                      message={error.message}
                      onRetry={handleRetry}
                      onViewSources={() => openEvidence(activeSources.length > 0 ? activeSources : uniqueSources)}
                      retryDisabled={isResearching}
                    />
                  )}
                </div>
              </div>

              <NewMessageButton
                visible={showNewMessageButton}
                onClick={() => scrollToBottom(true)}
              />
            </div>
          )}
        </div>

        <Composer
          onSend={handleSend}
          onAttach={handleAttach}
          disabled={isResearching || !isAuthenticated}
          variant={inConversation ? "default" : "welcome"}
          draftSeed={composerDraft}
          draftKey={draftKey}
        />
      </main>

      <EvidencePanel
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        sources={activeSources.length > 0 ? activeSources : uniqueSources}
        attachments={attachments}
      />

      <EvidencePanelMobile
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        sources={activeSources.length > 0 ? activeSources : uniqueSources}
        attachments={attachments}
      />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        onSelectPrompt={(prompt) => handleSend(prompt, "balanced")}
        onSelectConversation={handleSelectConversation}
      />

      <DeleteChatDialog
        open={!!deleteTarget}
        chatTitle={deleteTarget?.title || "Untitled"}
        busy={deleteBusy}
        onCancel={() => {
          if (!deleteBusy) setDeleteTarget(null);
        }}
        onConfirm={() => {
          void confirmDeleteConversation();
        }}
      />
    </div>
  );
}
