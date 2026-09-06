import { apiFetch, setConversationId } from "./client";
import type { Attachment, ChatResponse, Priority } from "@/types/api";

export interface ConversationRow {
  id: string;
  title: string;
  status?: string;
  updated_at: string | null;
}

export interface StoredMessage {
  id: string;
  role: string;
  content: string;
  created_at: string | null;
}

const PINNED_KEY = "cg_pinned_chats";

export function getPinnedChatIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function setPinnedChatIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids));
}

export function togglePinnedChatId(id: string): string[] {
  const current = getPinnedChatIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [id, ...current];
  setPinnedChatIds(next);
  return next;
}

export async function listConversations() {
  return apiFetch<ConversationRow[]>("/api/v1/ai/conversations");
}

export async function loadConversationMessages(conversationId: string) {
  return apiFetch<StoredMessage[]>(`/api/v1/ai/conversations/${conversationId}/messages`);
}

export async function deleteConversation(conversationId: string) {
  return apiFetch<{ ok: boolean; id: string }>(
    `/api/v1/ai/conversations/${conversationId}`,
    { method: "DELETE" },
  );
}

export async function updateConversation(
  conversationId: string,
  patch: { title?: string; status?: "active" | "archived" },
) {
  return apiFetch<ConversationRow>(`/api/v1/ai/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function sendChatMessage(
  message: string,
  conversationId?: string | null,
  priority: Priority = "balanced",
) {
  const data = await apiFetch<ChatResponse>("/api/v1/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
      shipment_id: null,
      preferences: { priority },
    }),
  });
  setConversationId(data.conversation_id);
  return data;
}

export async function uploadAttachment(
  file: File,
  conversationId?: string | null,
) {
  const form = new FormData();
  form.append("file", file);
  if (conversationId) form.append("conversation_id", conversationId);

  return apiFetch<Attachment>("/api/v1/ai/attachments", {
    method: "POST",
    body: form,
  });
}

export async function listAttachments(conversationId: string) {
  return apiFetch<Attachment[]>(
    `/api/v1/ai/attachments/${conversationId}`,
  );
}
