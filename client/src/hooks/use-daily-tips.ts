import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import { z } from "zod";

export function useDailyTips() {
  return useQuery({
    queryKey: [api.dailyTips.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.dailyTips.list.path, {});
      const data = api.dailyTips.list.responses[200].parse(await res.json());
      return data.result;
    },
  });
}

export function useDailyTipsAll() {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.dailyTips.listAll.path],
    queryFn: async () => {
      const res = await apiFetch(api.dailyTips.listAll.path, { token });
      const data = api.dailyTips.listAll.responses[200].parse(await res.json());
      return { data: data.result };
    },
    enabled: !!token
  });
}

export function useDailyTip(tipId: string) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.dailyTips.get.path, tipId],
    queryFn: async () => {
      const url = buildUrl(api.dailyTips.get.path, { tipId });
      const res = await apiFetch(url, { token });
      const data = api.dailyTips.get.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!tipId
  });
}

export function useCreateDailyTip() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData | Record<string, any>) => {
      const isFormData = formData instanceof FormData;
      const url = getApiUrl(api.dailyTips.create.path);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: api.dailyTips.create.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? formData : JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.dailyTips.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.listAll.path] });
      toast({ title: "Success", description: "Daily tip created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateDailyTip() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tipId, data }: { tipId: string; data: FormData | Partial<z.infer<typeof api.dailyTips.update.input>> }) => {
      const url = buildUrl(api.dailyTips.update.path, { tipId });
      const isFormData = data instanceof FormData;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const fullUrl = getApiUrl(url);
      const res = await fetch(fullUrl, {
        method: api.dailyTips.update.method,
        headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.dailyTips.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.listAll.path] });
      toast({ title: "Success", description: "Daily tip updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteDailyTip() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tipId: string) => {
      const url = buildUrl(api.dailyTips.delete.path, { tipId });
      const res = await apiFetch(url, {
        method: api.dailyTips.delete.method,
        token,
      });
      return api.dailyTips.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dailyTips.listAll.path] });
      toast({ title: "Success", description: "Daily tip deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

