import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMutation } from '@tanstack/react-query';
import { api, type User } from '@shared/routes';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export function useLogin() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { phone: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "OTP Sent", description: "Please check your phone for the code." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  });
}

export function useVerifyOtp() {
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: { phone: string; otp: string }) => {
      const res = await fetch(api.auth.verify.path, {
        method: api.auth.verify.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Invalid OTP');
      return api.auth.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setAuth(data.data.accessToken, data.data.user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
    }
  });
}
