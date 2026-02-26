import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

export function useAddStaff() {
   const queryClient = useQueryClient();
   const token = useAuthStore(state => state.token);
   const { toast } = useToast();

   return useMutation({
      mutationFn: async (data: z.infer<typeof api.staff.add.input>) => {
         const res = await apiFetch(api.staff.add.path, {
            method: api.staff.add.method,
            token,
            body: api.staff.add.input.parse(data),
         });
         return api.staff.add.responses[201].parse(await res.json());
      },
      onSuccess: (_, variables) => {
         // Invalidate clinic users query if clinicId is provided
         if (variables.clinicId) {
            queryClient.invalidateQueries({ 
               queryKey: [api.organizations.getUsers.path, variables.clinicId] 
            });
         }
         toast({ 
            title: "Success", 
            description: variables.userId 
               ? "Staff member added successfully" 
               : "Staff member created and added successfully" 
         });
      },
      onError: (err: any) => {
         const errorMessage = err.message || "Failed to add staff member";
         toast({ 
            variant: "destructive", 
            title: "Error", 
            description: errorMessage 
         });
      }
   });
}
