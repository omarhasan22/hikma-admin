import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAuthStore } from "./use-auth";

export function useDashboardStats() {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
    enabled: !!token
  });
}
