import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";

export function useReviews(params?: { doctorId?: string; clinicId?: string }) {
  return useQuery({
    queryKey: [api.reviews.list.path, params],
    queryFn: async () => {
      const url = buildUrl(api.reviews.list.path);
      const searchParams = new URLSearchParams();
      if (params?.doctorId) searchParams.append("doctorId", params.doctorId);
      if (params?.clinicId) searchParams.append("clinicId", params.clinicId);
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, {});
      const data = api.reviews.list.responses[200].parse(await res.json());
      return { data: data.result };
    },
  });
}

export function useUpdateReviewVisibility() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, isVisible }: { reviewId: string; isVisible: boolean }) => {
      const url = buildUrl(api.reviews.updateVisibility.path, { reviewId });
      const res = await apiFetch(url, {
        method: api.reviews.updateVisibility.method,
        token,
        body: api.reviews.updateVisibility.input.parse({ isVisible }),
      });
      const response = api.reviews.updateVisibility.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.list.path] });
      toast({ title: "Success", description: "Review visibility updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

