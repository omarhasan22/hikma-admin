import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMutation } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';
import { type User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string | null, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export function useLogin() {
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: { code: string }) => {
      const res = await apiFetch(api.auth.login.path, {
        method: api.auth.login.method,
        body: api.auth.login.input.parse(data),
      });
      const responseData = await res.json();
      // Don't validate with Zod schema if backend structure is different
      // Just return the raw response
      return responseData;
    },
    onSuccess: (data) => {
      if (data.status === "ok" && data.result) {
        const { accessToken, refreshToken, user, profile } = data.result;
        // Use profile if available, otherwise use user
        const userData = profile || user;
        if (userData && accessToken) {
          // Map backend user structure to frontend User type
          // Backend uses UUID string for id, we'll convert to a numeric hash
          const userId = typeof userData.id === 'string'
            ? (userData.id.split('-').join('').substring(0, 10).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000000)
            : (userData.id || 0);

          const mappedUser: User = {
            id: userId,
            phone: userData.phone || profile?.phone || "",
            fullName: userData.fullName || userData.full_name || profile?.fullName || profile?.full_name || userData.user_metadata?.fullName || "Super Admin",
            email: userData.email || profile?.email || null,
            userType: userData.user_type || userData.userType || profile?.user_type || userData.user_metadata?.user_type || "superadmin",
            role: userData.role || profile?.role || userData.user_metadata?.role || "admin",
            isActive: userData.isActive !== undefined ? userData.isActive : (profile?.isActive !== undefined ? profile.isActive : true),
            createdAt: userData.createdAt ? new Date(userData.createdAt) : (profile?.createdAt ? new Date(profile.createdAt) : new Date()),
          };
          setAuth(accessToken, refreshToken || null, mappedUser);
          toast({ title: "Welcome!", description: "Successfully logged in as superadmin." });
        } else {
          toast({ variant: "destructive", title: "Login Error", description: "Invalid response from server" });
        }
      } else if (data.error) {
        toast({ variant: "destructive", title: "Login Failed", description: data.error || "Invalid access code" });
      } else {
        toast({ variant: "destructive", title: "Login Error", description: "Unexpected response format" });
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  });
}

export function useRefreshToken() {
  const { refreshToken, setAuth, user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) throw new Error("No refresh token available");
      const res = await apiFetch(api.auth.refresh.path, {
        method: api.auth.refresh.method,
        body: api.auth.refresh.input.parse({ refreshToken }),
      });
      return api.auth.refresh.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      if (user) {
        setAuth(data.data.accessToken, data.data.refreshToken || refreshToken, user);
      }
    }
  });
}

export function useLogout() {
  const { toast } = useToast();
  const { token, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (token) {
        const res = await apiFetch(api.auth.logout.path, {
          method: api.auth.logout.method,
          token,
        });
        return api.auth.logout.responses[200].parse(await res.json());
      }
      return { message: "Logged out" };
    },
    onSuccess: () => {
      logout();
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    },
    onError: (error) => {
      // Still logout even if the API call fails
      logout();
      toast({ variant: "destructive", title: "Logout Error", description: error.message });
    }
  });
}
