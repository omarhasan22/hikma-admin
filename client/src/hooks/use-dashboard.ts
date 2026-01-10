import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { apiFetch } from "@/lib/api";

export function useDashboardStats() {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await apiFetch(api.dashboard.stats.path, { token });
      const data = api.dashboard.stats.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token
  });
}
