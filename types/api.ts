export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  tenant_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Source {
  id?: string | null;
  title: string;
  publisher: string;
  url: string | null;
  page: number | null;
  freshness: "current" | "outdated" | "unknown";
  authority_level: number;
  source_type?: string;
  provider?: string | null;
  carrier?: string | null;
  domain?: string | null;
  tier?: "official" | "third_party" | "internal_doc" | null;
  date?: string | null;
  relevance?: number | null;
}

export interface Recommendation {
  provider: string;
  rank: number;
  price: {
    amount: number;
    currency: string;
    source: string;
  };
  price_label: string;
  why: string[];
  service?: string;
  delivery?: string;
  cod?: boolean;
  tracking?: boolean;
  returns?: boolean;
  international?: boolean;
  tradeoffs?: string[];
}

export interface ExtractedContext {
  intent?: string;
  product?: string;
  weight?: { value: number; unit: string };
  origin?: string;
  destination?: string;
  country?: string;
  domestic?: boolean;
  cod?: boolean | null;
  priority?: string;
  providers?: string[];
  missing_fields?: string[];
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  answer_type: string;
  intent: string;
  extracted_context: ExtractedContext;
  shipment_id: string | null;
  recommendations: Recommendation[];
  assumptions: string[];
  actions: string[];
  sources: Source[];
  warnings: string[];
  confidence: { overall: string };
  memory_used: boolean;
  rag_used: boolean;
  web_search_used: boolean;
  web_search_error_code?: string | null;
  web_search_retryable?: boolean;
  live_data_used: boolean;
  freshness: string;
  current_data_verified?: boolean;
  data_source?: string;
  research_indicator?: string | null;
  internal_error_codes?: string[];
  llm_success?: boolean;
  llm_error_code?: string | null;
  retryable?: boolean;
  retry_after_seconds?: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  recommendations?: Recommendation[];
  warnings?: string[];
  answerType?: string;
  extractedContext?: ExtractedContext;
  isStreaming?: boolean;
  isDemo?: boolean;
  ragUsed?: boolean;
  webSearchUsed?: boolean;
  liveDataUsed?: boolean;
  researchIndicator?: string | null;
  /** Quiet research outcome for UI (not a hard error panel). */
  researchKind?: "none" | "no_results" | "failed" | "complete";
  researchNote?: string | null;
}

export interface Attachment {
  id: string;
  filename: string;
  scope: string;
  version: number;
  processing_status: string;
  extraction_metadata?: { status: string; pages: number };
  excerpt?: string;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  country: string;
  provider_type: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
  preview: string;
  status?: string;
  pinned?: boolean;
}

export type Priority = "balanced" | "cheapest" | "fastest";

export interface ContextChip {
  id: string;
  label: string;
  value: string;
  type: "weight" | "product" | "origin" | "destination" | "provider" | "other";
}
