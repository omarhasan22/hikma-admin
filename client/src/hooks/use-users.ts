import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

export function useUsers(params?: { limit?: string; userType?: string; search?: string }) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.users.list.path, params],
    queryFn: async () => {
      const url = buildUrl(api.users.list.path);
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit);
      if (params?.userType) searchParams.append("userType", params.userType);
      if (params?.search) searchParams.append("search", params.search);
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.users.list.responses[200].parse(await res.json());
      return { data: data.result };
    },
    enabled: !!token
  });
}

export function useUser(id: string) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.users.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.users.get.path, { id });
      const res = await apiFetch(url, { token });
      const data = api.users.get.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!id
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.users.create.input>) => {
      const res = await apiFetch(api.users.create.path, {
        method: api.users.create.method,
        token,
        body: api.users.create.input.parse(data),
      });
      const response = api.users.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

