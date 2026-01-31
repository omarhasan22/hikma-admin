import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { getApiUrl } from "@/lib/api";

export function useUpdateClinicDoctorSettings() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, data }: { doctorId: string; clinicId: string; data: Partial<{ defaultSlotDuration: number; maxBookingDays: number; isPrimary: boolean; role: string }> }) => {
      const url = getApiUrl(buildUrl(api.clinicDoctorSettings.update.path, { doctorId, clinicId }));
      const res = await fetch(url, {
        method: api.clinicDoctorSettings.update.method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.clinicDoctorSettings.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Clinic doctor settings updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}
