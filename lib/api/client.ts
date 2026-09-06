const TOKEN_KEY = "cg_access_token";
const REFRESH_KEY = "cg_refresh_token";
const TENANT_KEY = "cg_tenant_id";
const CONVERSATION_KEY = "cg_conversation_id";

// Use same-origin proxy in the browser (see next.config.ts rewrites).
// Server-side fetches still need the absolute backend URL.
export const API_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(tokens: {
  access_token: string;
  refresh_token: string;
  tenant_id?: string;
}) {
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  if (tokens.tenant_id) {
    localStorage.setItem(TENANT_KEY, tokens.tenant_id);
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export function getConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONVERSATION_KEY);
}

export function setConversationId(id: string | null) {
  if (id) {
    localStorage.setItem(CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CONVERSATION_KEY);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ChatUiErrorType =
  | "auth_required"
  | "session_expired"
  | "forbidden"
  | "live_unavailable"
  | "source_outdated"
  | "rag_unavailable"
  | "upload_failed"
  | "rate_limited"
  | "llm_rate_limit"
  | "llm_auth_error"
  | "llm_timeout"
  | "llm_unavailable"
  | "rag_unavailable_error"
  | "web_search_auth"
  | "web_search_rate_limit"
  | "web_search_timeout"
  | "web_search_unavailable"
  | "web_search_empty"
  | "web_search_not_configured"
  | "backend_unavailable"
  | "generic";

function detailToCode(status: number, detail: string): string {
  const map: Record<string, string> = {
    "Not authenticated": "AUTHENTICATION_REQUIRED",
    "Invalid token": "INVALID_TOKEN",
    "Invalid token type": "INVALID_TOKEN_TYPE",
    "User not found": "USER_NOT_FOUND",
    "Tenant context required": "TENANT_REQUIRED",
    "Not a member of this tenant": "FORBIDDEN",
  };
  if (map[detail]) return map[detail];
  if (status === 401) return "AUTHENTICATION_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 429) return "RATE_LIMITED";
  return "UNKNOWN_ERROR";
}

export function mapApiError(error: unknown): {
  type: ChatUiErrorType;
  message?: string;
  requestId?: string;
} {
  if (error instanceof TypeError) {
    return {
      type: "backend_unavailable",
      message: "Cannot reach the research backend. Make sure the API server is running.",
    };
  }

  if (!(error instanceof ApiError)) {
    return { type: "generic" };
  }

  const { status, code, message, requestId } = error;

  if (code === "AUTHENTICATION_REQUIRED" || status === 401) {
    return { type: "auth_required", message, requestId };
  }
  if (code === "SESSION_EXPIRED") {
    return { type: "session_expired", message, requestId };
  }
  if (code === "FORBIDDEN" || status === 403) {
    return { type: "forbidden", message, requestId };
  }
  if (code === "CURRENT_DATA_UNAVAILABLE") {
    return { type: "live_unavailable", message, requestId };
  }
  if (code === "LLM_RATE_LIMIT" || code === "LLM_RATE_LIMITED") {
    return { type: "llm_rate_limit", message, requestId };
  }
  if (code === "LLM_AUTH_ERROR" || code === "LLM_CONFIGURATION_ERROR") {
    return { type: "llm_auth_error", message, requestId };
  }
  if (code === "LLM_TIMEOUT") {
    return { type: "llm_timeout", message, requestId };
  }
  if (code === "LLM_PROVIDER_UNAVAILABLE" || code === "LLM_SERVER_ERROR") {
    return { type: "llm_unavailable", message, requestId };
  }
  if (code === "TAVILY_AUTH_FAILED" || code === "TAVILY_API_KEY_MISSING" || code === "WEB_SEARCH_NOT_CONFIGURED") {
    return { type: "web_search_auth", message, requestId };
  }
  if (code === "TAVILY_RATE_LIMIT") {
    return { type: "web_search_rate_limit", message, requestId };
  }
  if (code === "TAVILY_TIMEOUT" || code === "TAVILY_CONNECTION_ERROR") {
    return { type: "web_search_timeout", message, requestId };
  }
  if (code === "TAVILY_SERVER_ERROR" || code === "TAVILY_REQUEST_FAILED" || code === "WEB_SEARCH_UNKNOWN_ERROR") {
    return { type: "web_search_unavailable", message, requestId };
  }
  if (code === "TAVILY_EMPTY_RESULTS") {
    return { type: "web_search_empty", message, requestId };
  }
  if (status === 429 || code === "RATE_LIMITED") {
    return { type: "rate_limited", message, requestId };
  }
  if (status >= 500) {
    return { type: "generic", message, requestId };
  }
  if (status === 502 || status === 503) {
    return { type: "live_unavailable", message, requestId };
  }

  return { type: "generic", message, requestId };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const token = auth ? getToken() : null;
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let code = "UNKNOWN";
    let message = res.statusText;
    let requestId: string | undefined;
    try {
      const body = await res.json();
      if (body.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
        requestId = body.error.request_id;
      } else if (body.detail) {
        if (typeof body.detail === "object" && body.detail !== null && "code" in body.detail) {
          code = body.detail.code ?? code;
          message = body.detail.message ?? message;
        } else if (typeof body.detail === "string") {
          message = body.detail;
          code = detailToCode(res.status, body.detail);
        }
      }
    } catch {
      /* ignore */
    }

    if (typeof window !== "undefined" && path.includes("/ai/chat")) {
      console.info("[chat] request failed", {
        status: res.status,
        code,
        authorization_header_present: Boolean(token),
        token_present: Boolean(token),
        request_id: requestId,
      });
    }

    throw new ApiError(res.status, code, message, requestId);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
import type { ChatResponse } from "@/types/api";

export function mapChatResponseStatus(response: ChatResponse): {
  showLlmWarning: boolean;
  warningType?: ChatUiErrorType;
  message?: string;
} {
  const codes = response.internal_error_codes ?? [];
  const webCode = response.web_search_error_code ?? codes.find((c) => c.startsWith("TAVILY_") || c.startsWith("WEB_SEARCH"));

  if (webCode === "TAVILY_AUTH_FAILED" || webCode === "TAVILY_API_KEY_MISSING" || webCode === "WEB_SEARCH_NOT_CONFIGURED") {
    // Soft research note on the message — not a chat-level alert panel.
    return { showLlmWarning: false };
  }
  if (webCode === "TAVILY_RATE_LIMIT") {
    return { showLlmWarning: false };
  }
  if (webCode === "TAVILY_TIMEOUT" || webCode === "TAVILY_CONNECTION_ERROR") {
    return { showLlmWarning: false };
  }
  if (webCode === "TAVILY_SERVER_ERROR" || webCode === "TAVILY_REQUEST_FAILED" || webCode === "WEB_SEARCH_UNKNOWN_ERROR") {
    return { showLlmWarning: false };
  }
  if (webCode === "TAVILY_EMPTY_RESULTS") {
    return { showLlmWarning: false };
  }

  if (response.llm_success === false || codes.includes("LLM_RATE_LIMIT")) {
    return {
      showLlmWarning: true,
      warningType: "llm_rate_limit",
      message:
        "The research was retrieved, but the AI synthesis service is temporarily busy.",
    };
  }
  if (response.internal_error_codes?.includes("LLM_AUTH_ERROR")) {
    return { showLlmWarning: true, warningType: "llm_auth_error" };
  }
  // Empty RAG hits are normal for greetings / thin queries — only warn on real RAG failures
  const ragHardFailure = response.internal_error_codes?.some(
    (c) => c.startsWith("RAG_") && c !== "RAG_NO_RESULTS" && c !== "RAG_STALE",
  );
  if (ragHardFailure) {
    return { showLlmWarning: true, warningType: "rag_unavailable_error" };
  }
  return { showLlmWarning: false };
}