import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import { z } from "zod";

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
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.doctors.list.responses[200].parse(await res.json());
      return { data: data.result };
    },
    enabled: !!token
  });
}

export function useDoctor(id: string) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.doctors.getAdmin.path, id],
    queryFn: async () => {
      const url = buildUrl(api.doctors.getAdmin.path, { doctorId: id });
      const res = await apiFetch(url, { token });
      const data = api.doctors.getAdmin.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!id
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData | Record<string, any>) => {
      const isFormData = formData instanceof FormData;
      const url = getApiUrl(api.doctors.create.path);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: api.doctors.create.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? formData : JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.doctors.create.responses[201].parse(await res.json());
      return response.result.doctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "Doctor created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, data }: { doctorId: string; data: FormData | Partial<z.infer<typeof api.doctors.update.input>> }) => {
      const isFormData = data instanceof FormData;
      const url = getApiUrl(buildUrl(api.doctors.update.path, { doctorId }));
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: api.doctors.update.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.doctors.update.responses[200].parse(await res.json());
      return response.result.doctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path] });
      toast({ title: "Success", description: "Doctor updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      const url = buildUrl(api.doctors.delete.path, { doctorId });
      const res = await apiFetch(url, {
        method: api.doctors.delete.method,
        token,
      });
      return api.doctors.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "Doctor deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useApproveDoctor() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      const url = buildUrl(api.doctors.approve.path, { doctorId });
      const res = await apiFetch(url, {
        method: api.doctors.approve.method,
        token,
      });
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
    mutationFn: async ({ doctorId, reason }: { doctorId: string; reason: string }) => {
      const url = buildUrl(api.doctors.reject.path, { doctorId });
      const res = await apiFetch(url, {
        method: api.doctors.reject.method,
        token,
        body: api.doctors.reject.input.parse({ reason }),
      });
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
    mutationFn: async ({ doctorId, isVip, expiresAt }: { doctorId: string; isVip: boolean; expiresAt?: string | null }) => {
      const url = buildUrl(api.doctors.setVip.path, { doctorId });
      const res = await apiFetch(url, {
        method: api.doctors.setVip.method,
        token,
        body: api.doctors.setVip.input.parse({ isVip, expiresAt: expiresAt || null }),
      });
      return api.doctors.setVip.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      toast({ title: "Success", description: "VIP status updated" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}
