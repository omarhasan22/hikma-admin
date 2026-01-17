// Get API URL from environment variable
// Vite exposes env variables prefixed with VITE_ via import.meta.env
// Make sure you have VITE_API_URL in your .env file in the project root
//const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "https://hikma-api-hg2q.onrender.com";
// 
// Validate that API URL is set
if (!API_BASE_URL) {
  console.error("⚠️ VITE_API_URL is not set in .env file!");
  console.error("Please create a .env file in the project root with: VITE_API_URL=http://localhost:3000");
}

// Log in development to help debug
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", API_BASE_URL || "❌ NOT SET");
}
export function getApiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

export function getHeaders(token: string | null, contentType = "application/json"): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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

  const allHeaders = {
    ...getHeaders(token || null),
    ...headers,
  };

  const res = await fetch(fullUrl, {
    method,
    headers: allHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

