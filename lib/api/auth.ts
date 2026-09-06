import { apiFetch, setTokens, clearTokens } from "./client";
import type { AuthTokens, User } from "@/types/api";

export async function login(email: string, password: string) {
  const data = await apiFetch<AuthTokens>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password, tenant_id: null }),
    },
    false,
  );
  setTokens(data);
  return data;
}

export async function register(
  email: string,
  name: string,
  password: string,
  tenantName: string,
) {
  const data = await apiFetch<AuthTokens>(
    "/api/v1/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        name,
        password,
        tenant_name: tenantName,
      }),
    },
    false,
  );
  setTokens(data);
  return data;
}

export async function getMe() {
  return apiFetch<User>("/api/v1/auth/me");
}

export function logout() {
  clearTokens();
}
