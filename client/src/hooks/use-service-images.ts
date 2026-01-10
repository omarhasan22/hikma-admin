import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

export function useServiceImages() {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.serviceImages.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.serviceImages.list.path, { token });
      return api.serviceImages.list.responses[200].parse(await res.json());
    },
    enabled: !!token
  });
}

export function useCreateServiceImage() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.serviceImages.create.input>) => {
      const res = await apiFetch(api.serviceImages.create.path, {
        method: api.serviceImages.create.method,
        token,
        body: api.serviceImages.create.input.parse(data),
      });
      return api.serviceImages.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceImages.list.path] });
      toast({ title: "Success", description: "Service image created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useCreateServiceImagesBulk() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.serviceImages.createBulk.input>) => {
      const res = await apiFetch(api.serviceImages.createBulk.path, {
        method: api.serviceImages.createBulk.method,
        token,
        body: api.serviceImages.createBulk.input.parse(data),
      });
      return api.serviceImages.createBulk.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceImages.list.path] });
      toast({ title: "Success", description: "Service images created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateServiceImage() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof api.serviceImages.update.input>> }) => {
      const url = buildUrl(api.serviceImages.update.path, { id });
      const res = await apiFetch(url, {
        method: api.serviceImages.update.method,
        token,
        body: data,
      });
      return api.serviceImages.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceImages.list.path] });
      toast({ title: "Success", description: "Service image updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteServiceImage() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.serviceImages.delete.path, { id });
      const res = await apiFetch(url, {
        method: api.serviceImages.delete.method,
        token,
      });
      return api.serviceImages.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceImages.list.path] });
      toast({ title: "Success", description: "Service image deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

