import { useMutation } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { type User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from "@/stores/authStore";

export { useAuthStore };

type BackendUser = Record<string, any>;

export function mapBackendUserToFrontendUser(userData: BackendUser): User {
  const userId = typeof userData.id === 'string'
    ? (userData.id.split('-').join('').substring(0, 10).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000000)
    : (userData.id || 0);

  return {
    id: userId,
    phone: userData.phone || "",
    fullName: userData.fullName || userData.full_name || userData.user_metadata?.fullName || "Super Admin",
    email: userData.email || null,
    userType: userData.account_type || userData.user_type || userData.userType || userData.user_metadata?.account_type || userData.user_metadata?.user_type || "admin",
    role: userData.role || userData.user_metadata?.role || "admin",
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
  };
}

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
          const mappedUser = mapBackendUserToFrontendUser(userData);
          setAuth(accessToken, refreshToken ?? null, mappedUser);
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
  const { setAuth, user, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }
      const res = await apiFetch(api.auth.refresh.path, {
        method: api.auth.refresh.method,
        body: api.auth.refresh.input.parse({ refreshToken }),
        skipAuthRefresh: true,
      });
      return api.auth.refresh.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      const refreshedUser = data.result.profile ? mapBackendUserToFrontendUser(data.result.profile) : user;
      setAuth(
        data.result.access_token,
        data.result.refresh_token ?? refreshToken ?? null,
        refreshedUser
      );
    }
  });
}

export function useLogout() {
  const { toast } = useToast();
  const { token, refreshToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (token && refreshToken) {
        const res = await apiFetch(api.auth.logout.path, {
          method: api.auth.logout.method,
          token,
          body: { refreshToken },
          skipAuthRefresh: true,
        });
        return await res.json();
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
