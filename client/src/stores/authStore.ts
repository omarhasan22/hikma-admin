import { create } from "zustand";
import type { User } from "@shared/schema";

const AUTH_STORAGE_KEY = "hikma_admin_auth";

type PersistedAuthState = {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
};

function readPersistedAuthState(): PersistedAuthState {
  if (typeof window === "undefined") {
    return { token: null, refreshToken: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { token: null, refreshToken: null, user: null };
    }

    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>;
    return {
      token: parsed.token ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

function writePersistedAuthState(state: PersistedAuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function clearPersistedAuthState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  bootstrapped: boolean;
  setAuth: (token: string | null, refreshToken: string | null, user: User | null) => void;
  hydrateAuth: () => void;
  setBootstrapped: (bootstrapped: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  bootstrapped: false,
  setAuth: (token, refreshToken, user) => {
    writePersistedAuthState({ token, refreshToken, user });
    set({ token, refreshToken, user });
  },
  hydrateAuth: () => {
    const persisted = readPersistedAuthState();
    set({
      token: persisted.token,
      refreshToken: persisted.refreshToken,
      user: persisted.user,
    });
  },
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),
  logout: () => {
    clearPersistedAuthState();
    set({ token: null, refreshToken: null, user: null });
  },
}));
