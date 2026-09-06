import { apiFetch } from "./client";
import type { Provider } from "@/types/api";

export async function listProviders() {
  return apiFetch<Provider[]>("/api/v1/providers", {}, false);
}

export async function compareProviders(params: {
  origin_country: string;
  destination_country: string;
  weight: number;
  priority: string;
  cod_required: boolean;
}) {
  return apiFetch<unknown>("/api/v1/providers/compare", {
    method: "POST",
    body: JSON.stringify(params),
  }, false);
}
