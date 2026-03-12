import { create } from "zustand";
import type { User } from "@shared/schema";

type AuthState = {
  token: string | null;
  user: User | null;
  bootstrapped: boolean;
  setAuth: (token: string | null, user: User | null) => void;
  setBootstrapped: (bootstrapped: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  bootstrapped: false,
  setAuth: (token, user) => set({ token, user }),
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),
  logout: () => set({ token: null, user: null }),
}));

