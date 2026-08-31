import { API_BASE } from "./api";

const TOKEN_KEY = "kelana_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Drop-in fetch replacement that attaches the bearer token and API base. */
export function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init?.headers,
  };
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
