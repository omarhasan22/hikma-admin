import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";

export function useClinicUsers(clinicId: string) {
   const token = useAuthStore(state => state.token);
   return useQuery({
      queryKey: [api.organizations.getUsers.path, clinicId],
      queryFn: async () => {
         const url = buildUrl(api.organizations.getUsers.path, { clinicId });
         const res = await apiFetch(url, { token });
         const data = api.organizations.getUsers.responses[200].parse(await res.json());
         return { data: data.result };
      },
      enabled: !!token && !!clinicId
   });
}

export function useRemoveUserFromClinic() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, doctorId }: { clinicId: string; doctorId: string }) => {
         const url = buildUrl(api.organizations.removeUser.path, { clinicId, doctorId });
         const res = await apiFetch(url, {
            method: api.organizations.removeUser.method,
            token,
         });
         return api.organizations.removeUser.responses[200].parse(await res.json());
      },
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.getUsers.path, variables.clinicId] });
         toast({ title: "Success", description: "User removed from clinic successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}

export function useUpdateUserRole() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async ({ clinicId, doctorId, role }: { clinicId: string; doctorId: string; role: 'admin' | 'doctor' | 'secretary' | 'nurse' | 'assistant' | 'owner' }) => {
         const url = buildUrl(api.organizations.updateUserRole.path, { clinicId, doctorId });
         const res = await apiFetch(url, {
            method: api.organizations.updateUserRole.method,
            token,
            body: api.organizations.updateUserRole.input.parse({ role }),
         });
         return api.organizations.updateUserRole.responses[200].parse(await res.json());
      },
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: [api.organizations.getUsers.path, variables.clinicId] });
         toast({ title: "Success", description: "User role updated successfully" });
      },
      onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message })
   });
}
