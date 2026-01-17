import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

export function useOrganizations(params?: { limit?: string; status?: string; search?: string }) {
   const token = useAuthStore(state => state.token);
   return useQuery({
      queryKey: [api.organizations.list.path, params],
      queryFn: async () => {
         const url = buildUrl(api.organizations.list.path);
         const searchParams = new URLSearchParams();
         if (params?.limit) searchParams.append("limit", params.limit);
         if (params?.status) searchParams.append("status", params.status);
         if (params?.search) searchParams.append("search", params.search);
         const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
         const res = await apiFetch(fullUrl, { token });
         const data = api.organizations.list.responses[200].parse(await res.json());
         return { data: data.result };
      },
      enabled: !!token
   });
}

export function useOrganization(clinicId: string) {
   const token = useAuthStore(state => state.token);
   return useQuery({
      queryKey: [api.organizations.get.path, clinicId],
      queryFn: async () => {
         const url = buildUrl(api.organizations.get.path, { clinicId });
         const res = await apiFetch(url, { token });
         const data = api.organizations.get.responses[200].parse(await res.json());
         return data.result;
      },
      enabled: !!token && !!clinicId
   });
}

export function useCreateOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async (data: z.infer<typeof api.organizations.create.input>) => {
         const res = await apiFetch(api.organizations.create.path, {
            method: api.organizations.create.method,
            token,
            body: api.organizations.create.input.parse(data),
         });
         return api.organizations.create.responses[201].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization created successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useUpdateOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, data }: { clinicId: string; data: Partial<z.infer<typeof api.organizations.update.input>> }) => {
         const url = buildUrl(api.organizations.update.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.update.method,
            token,
            body: data,
         });
         const response = api.organizations.update.responses[200].parse(await res.json());
         return response.result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization updated successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useApproveOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async (clinicId: string) => {
         const url = buildUrl(api.organizations.approve.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.approve.method,
            token,
         });
         return api.organizations.approve.responses[200].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization approved successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useRejectOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, reason }: { clinicId: string; reason: string }) => {
         const url = buildUrl(api.organizations.reject.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.reject.method,
            token,
            body: api.organizations.reject.input.parse({ reason }),
         });
         return api.organizations.reject.responses[200].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization rejected" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useSuspendOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, reason }: { clinicId: string; reason: string }) => {
         const url = buildUrl(api.organizations.suspend.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.suspend.method,
            token,
            body: api.organizations.suspend.input.parse({ reason }),
         });
         return api.organizations.suspend.responses[200].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization suspended" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useDeleteOrganization() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async (clinicId: string) => {
         const url = buildUrl(api.organizations.delete.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.delete.method,
            token,
         });
         return api.organizations.delete.responses[200].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Organization deleted successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useAddDoctorToClinic() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, doctorId, role = 'member' }: { clinicId: string; doctorId: string; role?: 'admin' | 'member' }) => {
         const url = buildUrl(api.organizations.addDoctor.path, { clinicId });
         const res = await apiFetch(url, {
            method: api.organizations.addDoctor.method,
            token,
            body: api.organizations.addDoctor.input.parse({ doctorId, role }),
         });
         return api.organizations.addDoctor.responses[201].parse(await res.json());
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
         toast({ title: "Success", description: "Doctor added to clinic successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

