import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";

export function useClinicWorkingHours(doctorId: string, clinicId: string) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['admin', 'doctors', doctorId, 'clinics', clinicId, 'working-hours'],
    queryFn: async () => {
      const url = buildUrl(api.clinicWorkingHours.list.path, { doctorId, clinicId });
      const res = await apiFetch(url, { token });
      const data = api.clinicWorkingHours.list.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!doctorId && !!clinicId
  });
}

export function useSetClinicWorkingHours() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, data }: { doctorId: string; clinicId: string; data: { dayOfWeek: string; startTime: string; endTime: string; breakStart?: string | null; breakEnd?: string | null; isActive?: boolean } }) => {
      const url = getApiUrl(buildUrl(api.clinicWorkingHours.create.path, { doctorId, clinicId }));
      const res = await fetch(url, {
        method: api.clinicWorkingHours.create.method,
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

      const response = api.clinicWorkingHours.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'working-hours'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Working hours set successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateClinicWorkingHours() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, dayOfWeek, data }: { doctorId: string; clinicId: string; dayOfWeek: string; data: Partial<{ startTime: string; endTime: string; breakStart: string | null; breakEnd: string | null; isActive: boolean }> }) => {
      const url = getApiUrl(buildUrl(api.clinicWorkingHours.update.path, { doctorId, clinicId, dayOfWeek }));
      const res = await fetch(url, {
        method: api.clinicWorkingHours.update.method,
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

      const response = api.clinicWorkingHours.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'working-hours'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Working hours updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteClinicWorkingHours() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, dayOfWeek }: { doctorId: string; clinicId: string; dayOfWeek: string }) => {
      const url = getApiUrl(buildUrl(api.clinicWorkingHours.delete.path, { doctorId, clinicId, dayOfWeek }));
      const res = await fetch(url, {
        method: api.clinicWorkingHours.delete.method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.clinicWorkingHours.delete.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'working-hours'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Working hours deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}
