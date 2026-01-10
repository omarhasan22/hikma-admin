import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import { z } from "zod";

export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.services.list.path, {});
      const data = api.services.list.responses[200].parse(await res.json());
      return { data: data.result };
    },
  });
}

export function useService(serviceId: string) {
  return useQuery({
    queryKey: [api.services.get.path, serviceId],
    queryFn: async () => {
      const url = buildUrl(api.services.get.path, { serviceId });
      const res = await apiFetch(url, {});
      const data = api.services.get.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!serviceId
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData | Record<string, any>) => {
      const isFormData = formData instanceof FormData;
      const url = getApiUrl(api.services.create.path);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: api.services.create.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? formData : JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.services.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "Success", description: "Service created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: FormData | Partial<z.infer<typeof api.services.update.input>> }) => {
      const url = buildUrl(api.services.update.path, { serviceId });
      const isFormData = data instanceof FormData;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const fullUrl = getApiUrl(url);
      const res = await fetch(fullUrl, {
        method: api.services.update.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.services.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "Success", description: "Service updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const url = buildUrl(api.services.delete.path, { serviceId });
      const res = await apiFetch(url, {
        method: api.services.delete.method,
        token,
      });
      return api.services.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

