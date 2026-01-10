import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import { z } from "zod";

export function useSliders() {
  return useQuery({
    queryKey: [api.sliders.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.sliders.list.path, {});
      const data = api.sliders.list.responses[200].parse(await res.json());
      return { data: data.result };
    },
  });
}

export function useSlidersAll() {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.sliders.listAll.path],
    queryFn: async () => {
      const res = await apiFetch(api.sliders.listAll.path, { token });
      const data = api.sliders.listAll.responses[200].parse(await res.json());
      return { data: data.result };
    },
    enabled: !!token
  });
}

export function useSlider(sliderId: string) {
  return useQuery({
    queryKey: [api.sliders.get.path, sliderId],
    queryFn: async () => {
      const url = buildUrl(api.sliders.get.path, { sliderId });
      const res = await apiFetch(url, {});
      const data = api.sliders.get.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!sliderId
  });
}

export function useCreateSlider() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData | Record<string, any>) => {
      const isFormData = formData instanceof FormData;
      const url = getApiUrl(api.sliders.create.path);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: api.sliders.create.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? formData : JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.sliders.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sliders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sliders.listAll.path] });
      toast({ title: "Success", description: "Slider created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateSlider() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sliderId, data }: { sliderId: string; data: FormData | Partial<z.infer<typeof api.sliders.update.input>> }) => {
      const url = buildUrl(api.sliders.update.path, { sliderId });
      const isFormData = data instanceof FormData;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const fullUrl = getApiUrl(url);
      const res = await fetch(fullUrl, {
        method: api.sliders.update.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.sliders.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sliders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sliders.listAll.path] });
      toast({ title: "Success", description: "Slider updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteSlider() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sliderId: string) => {
      const url = buildUrl(api.sliders.delete.path, { sliderId });
      const res = await apiFetch(url, {
        method: api.sliders.delete.method,
        token,
      });
      return api.sliders.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sliders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sliders.listAll.path] });
      toast({ title: "Success", description: "Slider deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

