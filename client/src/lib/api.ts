import { API_BASE_URL } from "./config";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@shared/schema";

export function getApiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function resolveToken(token: string | null | undefined): string | null {
  // If token is omitted, prefer the in-memory auth store; otherwise respect explicit null.
  return token === undefined ? useAuthStore.getState().token : token;
}

type RefreshResponse = {
  result?: {
    access_token?: string;
    refresh_token?: string;
    profile?: Record<string, unknown>;
  };
};

let refreshPromise: Promise<string | null> | null = null;

function getLoginRedirectPath(): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
  return `${normalizedBase}/login`;
}

function forceLogoutAndRedirect() {
  const { logout } = useAuthStore.getState();
  logout();

  if (typeof window !== "undefined") {
    const loginPath = getLoginRedirectPath();
    if (window.location.pathname !== loginPath) {
      window.location.assign(loginPath);
    }
  }
}

function mapProfileToUser(profile: Record<string, any>, fallbackUser: User | null): User | null {
  if (!profile) {
    return fallbackUser;
  }

  const userId = typeof profile.id === "string"
    ? (profile.id.split("-").join("").substring(0, 10).split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000000)
    : (profile.id || 0);

  return {
    id: userId,
    phone: profile.phone || fallbackUser?.phone || "",
    fullName: profile.fullName || profile.full_name || profile.user_metadata?.fullName || fallbackUser?.fullName || "Super Admin",
    email: profile.email || fallbackUser?.email || null,
    userType: profile.account_type || profile.user_type || profile.userType || profile.user_metadata?.account_type || profile.user_metadata?.user_type || fallbackUser?.userType || "admin",
    role: profile.role || profile.user_metadata?.role || fallbackUser?.role || "admin",
    isActive: profile.isActive !== undefined ? profile.isActive : (fallbackUser?.isActive ?? true),
    createdAt: profile.createdAt ? new Date(profile.createdAt) : (fallbackUser?.createdAt ?? new Date()),
  };
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, user, setAuth } = useAuthStore.getState();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(getApiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as RefreshResponse;
  const accessToken = json?.result?.access_token ?? null;
  const rotatedRefreshToken = json?.result?.refresh_token ?? refreshToken;

  if (!accessToken) {
    return null;
  }

  const refreshedUser = json?.result?.profile ? mapProfileToUser(json.result.profile as Record<string, any>, user) : user;
  setAuth(accessToken, rotatedRefreshToken, refreshedUser);
  return accessToken;
}

async function refreshAccessTokenSingleFlight(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  url: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
    retryOn401?: boolean;
    skipAuthRefresh?: boolean;
  } = {}
): Promise<Response> {
  const {
    method = "GET",
    token,
    body,
    headers = {},
    retryOn401 = true,
    skipAuthRefresh = false,
  } = options;
  const fullUrl = getApiUrl(url);

  const sendRequest = async (authToken: string | null): Promise<Response> => {
    const allHeaders: Record<string, string> = { ...headers };

    if (authToken) {
      allHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const hasBody = body !== undefined;

    if (hasBody && !isFormData && !allHeaders["Content-Type"]) {
      allHeaders["Content-Type"] = "application/json";
    }

    return fetch(fullUrl, {
      method,
      headers: allHeaders,
      body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
      credentials: "include",
    });
  };

  let resolvedToken = resolveToken(token);
  let res = await sendRequest(resolvedToken);

  if (
    res.status === 401 &&
    retryOn401 &&
    !skipAuthRefresh
  ) {
    const refreshedToken = await refreshAccessTokenSingleFlight();

    if (refreshedToken) {
      resolvedToken = token === undefined ? refreshedToken : token;
      res = await sendRequest(resolvedToken);
    } else {
      const { token: storedToken, refreshToken: storedRefreshToken } = useAuthStore.getState();
      if (storedToken || storedRefreshToken) {
        forceLogoutAndRedirect();
      }
    }
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}
