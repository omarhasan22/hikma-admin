import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { apiFetch } from "@/lib/api";

export function useDoctorAnalytics(doctorId: string, params?: { fromDate?: string; toDate?: string }) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.doctors.getAnalytics.path, doctorId, params],
    queryFn: async () => {
      const url = buildUrl(api.doctors.getAnalytics.path, { doctorId });
      const searchParams = new URLSearchParams();
      if (params?.fromDate) searchParams.append("fromDate", params.fromDate);
      if (params?.toDate) searchParams.append("toDate", params.toDate);
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.doctors.getAnalytics.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!doctorId
  });
}

export function useDoctorProfileViews(doctorId: string, limit?: number) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: [api.doctors.getProfileViews.path, doctorId, limit],
    queryFn: async () => {
      const url = buildUrl(api.doctors.getProfileViews.path, { doctorId });
      const searchParams = new URLSearchParams();
      if (limit) searchParams.append("limit", String(limit));
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.doctors.getProfileViews.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!doctorId
  });
}

