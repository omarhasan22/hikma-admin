import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch, getApiUrl } from "@/lib/api";

export function useClinicDoctorServices(doctorId: string, clinicId: string) {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['admin', 'doctors', doctorId, 'clinics', clinicId, 'services'],
    queryFn: async () => {
      const url = buildUrl(api.clinicDoctorServices.list.path, { doctorId, clinicId });
      const res = await apiFetch(url, { token });
      const data = api.admin.clinicDoctorServices.list.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!doctorId && !!clinicId
  });
}

export function useAddClinicDoctorService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, data }: { doctorId: string; clinicId: string; data: { name: string; nameAr?: string; price: number; durationMinutes: number } }) => {
      const url = getApiUrl(buildUrl(api.clinicDoctorServices.create.path, { doctorId, clinicId }));
      const res = await fetch(url, {
        method: api.clinicDoctorServices.create.method,
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

      const response = api.clinicDoctorServices.create.responses[201].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'services'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Service added successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useUpdateClinicDoctorService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, serviceId, data }: { doctorId: string; clinicId: string; serviceId: string; data: Partial<{ name: string; nameAr: string; price: number; durationMinutes: number; displayOrder: number; isActive: boolean }> }) => {
      const url = getApiUrl(buildUrl(api.clinicDoctorServices.update.path, { doctorId, clinicId, serviceId }));
      const res = await fetch(url, {
        method: api.clinicDoctorServices.update.method,
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

      const response = api.clinicDoctorServices.update.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'services'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Service updated successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}

export function useDeleteClinicDoctorService() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, clinicId, serviceId }: { doctorId: string; clinicId: string; serviceId: string }) => {
      const url = getApiUrl(buildUrl(api.clinicDoctorServices.delete.path, { doctorId, clinicId, serviceId }));
      const res = await fetch(url, {
        method: api.clinicDoctorServices.delete.method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      const response = api.clinicDoctorServices.delete.responses[200].parse(await res.json());
      return response.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors', variables.doctorId, 'clinics', variables.clinicId, 'services'] });
      queryClient.invalidateQueries({ queryKey: [api.doctors.getAdmin.path, variables.doctorId] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
  });
}
