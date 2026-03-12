import { API_BASE_URL } from "./config";
import { useAuthStore } from "@/stores/authStore";

export function getApiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function resolveToken(token: string | null | undefined): string | null {
  // If token is omitted, prefer the in-memory auth store; otherwise respect explicit null.
  return token === undefined ? useAuthStore.getState().token : token;
}

export async function apiFetch(
  url: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { method = "GET", token, body, headers = {} } = options;
  const fullUrl = getApiUrl(url);

  const resolvedToken = resolveToken(token);
  const allHeaders: Record<string, string> = { ...headers };

  if (resolvedToken) {
    allHeaders["Authorization"] = `Bearer ${resolvedToken}`;
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== undefined;

  if (hasBody && !isFormData && !allHeaders["Content-Type"]) {
    allHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(fullUrl, {
    method,
    headers: allHeaders,
    body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

