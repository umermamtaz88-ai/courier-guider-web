import type { ChatMessage, ChatResponse } from "@/types/api";
import { generateId } from "@/lib/utils";

function normalizeAnswerText(answer: string): string {
  let text = (answer || "").trim();
  if (!text) return text;

  if (text.startsWith("{") && text.includes('"answer"')) {
    try {
      const parsed = JSON.parse(text) as { answer?: unknown };
      if (typeof parsed.answer === "string") {
        text = parsed.answer;
      }
    } catch {
      // keep original
    }
  }

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1);
  }

  const escapedNewlines = (text.match(/\\n/g) || []).length;
  const realNewlines = (text.match(/\n/g) || []).length;
  if (escapedNewlines >= 2 && escapedNewlines > realNewlines) {
    text = text
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  }

  text = text.replace(/<\/?think>/gi, "").replace(/<\/?thinking>/gi, "").trim();
  return text;
}

function deriveResearchMeta(response: ChatResponse): {
  researchKind: ChatMessage["researchKind"];
  researchNote: string | null;
} {
  const codes = response.internal_error_codes ?? [];
  const webCode =
    response.web_search_error_code ??
    codes.find((c) => c.startsWith("TAVILY_") || c.startsWith("WEB_SEARCH"));

  if (webCode === "TAVILY_EMPTY_RESULTS") {
    return {
      researchKind: "no_results",
      researchNote: response.rag_used
        ? "I'm using the stored verified knowledge available in Courier Guider."
        : "Insufficient evidence to verify from current web sources.",
    };
  }

  if (
    webCode === "TAVILY_AUTH_FAILED" ||
    webCode === "TAVILY_API_KEY_MISSING" ||
    webCode === "WEB_SEARCH_NOT_CONFIGURED" ||
    webCode === "TAVILY_RATE_LIMIT" ||
    webCode === "TAVILY_TIMEOUT" ||
    webCode === "TAVILY_CONNECTION_ERROR" ||
    webCode === "TAVILY_SERVER_ERROR" ||
    webCode === "TAVILY_REQUEST_FAILED" ||
    webCode === "WEB_SEARCH_UNKNOWN_ERROR"
  ) {
    return {
      researchKind: "failed",
      researchNote: response.rag_used
        ? "I'm using stored verified knowledge where available."
        : "Current web verification unavailable.",
    };
  }

  if (response.web_search_used || (response.sources && response.sources.length > 0)) {
    return { researchKind: "complete", researchNote: null };
  }
  if (response.rag_used) {
    return { researchKind: "complete", researchNote: null };
  }
  return { researchKind: "none", researchNote: null };
}

export function chatResponseToMessage(
  response: ChatResponse,
  isDemo = false,
): ChatMessage {
  const { researchKind, researchNote } = deriveResearchMeta(response);
  const noisy = [
    /couldn't verify the latest web/i,
    /no current official web pages/i,
    /configure llm_api_key/i,
    /unstructured llm/i,
  ];

  return {
    id: generateId(),
    role: "assistant",
    content: normalizeAnswerText(response.answer),
    timestamp: new Date(),
    sources: response.sources,
    recommendations: response.recommendations,
    warnings: (response.warnings || []).filter(
      (w) => w !== "Unstructured LLM response" && !noisy.some((re) => re.test(w)),
    ),
    answerType: response.answer_type,
    extractedContext: response.extracted_context,
    isDemo,
    ragUsed: response.rag_used,
    webSearchUsed: response.web_search_used,
    liveDataUsed: response.live_data_used,
    researchIndicator: response.research_indicator ?? null,
    researchKind,
    researchNote,
  };
}
