import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";

// Helper to add auth header
const getHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
});

export function useDoctors(params?: { limit?: string; isApproved?: string; isVip?: string; search?: string }) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.doctors.list.path, params],
    queryFn: async () => {
      const url = buildUrl(api.doctors.list.path);
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const res = await fetch(`${url}?${searchParams.toString()}`, {
        headers: getHeaders(token)
      });
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return api.doctors.list.responses[200].parse(await res.json());
    },
    enabled: !!token
  });
}

export function useApproveDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.doctors.approve.path, { id });
      const res = await fetch(url, {
        method: api.doctors.approve.method,
        headers: getHeaders(token)
      });
      if (!res.ok) throw new Error("Failed to approve doctor");
      return api.doctors.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "Doctor approved successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useRejectDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const url = buildUrl(api.doctors.reject.path, { id });
      const res = await fetch(url, {
        method: api.doctors.reject.method,
        headers: getHeaders(token),
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error("Failed to reject doctor");
      return api.doctors.reject.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "Doctor rejected" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useSetVipDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isVip, expiresAt }: { id: number; isVip: boolean; expiresAt?: string }) => {
      const url = buildUrl(api.doctors.setVip.path, { id });
      const res = await fetch(url, {
        method: api.doctors.setVip.method,
        headers: getHeaders(token),
        body: JSON.stringify({ isVip, expiresAt })
      });
      if (!res.ok) throw new Error("Failed to update VIP status");
      return api.doctors.setVip.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "VIP status updated" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}
