import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { useToast } from "./use-toast";
import { apiFetch } from "@/lib/api";

export function useBillingPlans() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [api.organizations.billingPlans.path],
    queryFn: async () => {
      const res = await apiFetch(api.organizations.billingPlans.path, { token });
      const data = api.organizations.billingPlans.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token,
  });
}

export function useClinicSubscription(clinicId?: string | null) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [api.organizations.subscription.get.path, clinicId],
    queryFn: async () => {
      const url = buildUrl(api.organizations.subscription.get.path, { clinicId: clinicId! });
      const res = await apiFetch(url, { token });
      const data = api.organizations.subscription.get.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!clinicId,
  });
}

export function useClinicInvoices(clinicId?: string | null, params?: { status?: string; limit?: string }) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [api.organizations.subscription.invoices.path, clinicId, params],
    queryFn: async () => {
      const url = buildUrl(api.organizations.subscription.invoices.path, { clinicId: clinicId! });
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.limit) searchParams.append("limit", params.limit);
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.organizations.subscription.invoices.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!clinicId,
  });
}

export function useClinicCharges(clinicId?: string | null, params?: { status?: string; limit?: string }) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [api.organizations.subscription.charges.path, clinicId, params],
    queryFn: async () => {
      const url = buildUrl(api.organizations.subscription.charges.path, { clinicId: clinicId! });
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.limit) searchParams.append("limit", params.limit);
      const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
      const res = await apiFetch(fullUrl, { token });
      const data = api.organizations.subscription.charges.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token && !!clinicId,
  });
}

export function useBillingSummary() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [api.organizations.adminBilling.summary.path],
    queryFn: async () => {
      const res = await apiFetch(api.organizations.adminBilling.summary.path, { token });
      const data = api.organizations.adminBilling.summary.responses[200].parse(await res.json());
      return data.result;
    },
    enabled: !!token,
  });
}

function invalidateBillingQueries(queryClient: ReturnType<typeof useQueryClient>, clinicId?: string) {
  queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
  queryClient.invalidateQueries({ queryKey: [api.organizations.adminBilling.summary.path] });
  if (clinicId) {
    queryClient.invalidateQueries({ queryKey: [api.organizations.subscription.get.path, clinicId] });
    queryClient.invalidateQueries({ queryKey: [api.organizations.subscription.invoices.path, clinicId] });
    queryClient.invalidateQueries({ queryKey: [api.organizations.subscription.charges.path, clinicId] });
  }
}

export function useApproveOrganization() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data?: { planId?: string; ownerId?: string; paygFeeOverride?: number | null };
    }) => {
      const url = buildUrl(api.organizations.approve.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.approve.method,
        token,
        body: data ? api.organizations.approve.input.parse(data) : undefined,
      });
      return api.organizations.approve.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: "Organization approved and subscription created" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useSetOrganizationStatus() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      clinicId,
      status,
      reason,
    }: {
      clinicId: string;
      status: "approved" | "disabled" | "suspended";
      reason?: string | null;
    }) => {
      const url = buildUrl(api.organizations.setStatus.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.setStatus.method,
        token,
        body: api.organizations.setStatus.input.parse({ status, reason }),
      });
      return api.organizations.setStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: `Clinic status updated to ${variables.status}` });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useCreateClinicSubscription() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data: { planId: string; ownerId?: string; paygFeeOverride?: number | null };
    }) => {
      const url = buildUrl(api.organizations.subscription.create.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.subscription.create.method,
        token,
        body: api.organizations.subscription.create.input.parse(data),
      });
      return api.organizations.subscription.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: "Subscription created" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useChangeClinicPlan() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clinicId, newPlanId }: { clinicId: string; newPlanId: string }) => {
      const url = buildUrl(api.organizations.subscription.changePlan.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.subscription.changePlan.method,
        token,
        body: api.organizations.subscription.changePlan.input.parse({ newPlanId }),
      });
      return api.organizations.subscription.changePlan.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: "Plan change queued" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useCancelClinicSubscription() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clinicId: string) => {
      const url = buildUrl(api.organizations.subscription.cancel.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.subscription.cancel.method,
        token,
      });
      return api.organizations.subscription.cancel.responses[200].parse(await res.json());
    },
    onSuccess: (_, clinicId) => {
      invalidateBillingQueries(queryClient, clinicId);
      toast({ title: "Success", description: "Subscription will cancel at period end" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useReactivateClinicSubscription() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clinicId: string) => {
      const url = buildUrl(api.organizations.subscription.reactivate.path, { clinicId });
      const res = await apiFetch(url, {
        method: api.organizations.subscription.reactivate.method,
        token,
      });
      return api.organizations.subscription.reactivate.responses[200].parse(await res.json());
    },
    onSuccess: (_, clinicId) => {
      invalidateBillingQueries(queryClient, clinicId);
      toast({ title: "Success", description: "Subscription reactivated" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      clinicId,
      notes,
    }: {
      invoiceId: string;
      clinicId: string;
      notes?: string | null;
    }) => {
      const url = buildUrl(api.organizations.adminBilling.payInvoice.path, { invoiceId });
      const res = await apiFetch(url, {
        method: api.organizations.adminBilling.payInvoice.method,
        token,
        body: api.organizations.adminBilling.payInvoice.input.parse({ notes }),
      });
      return api.organizations.adminBilling.payInvoice.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: "Invoice marked paid" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useWaiveInvoice() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      clinicId,
      notes,
    }: {
      invoiceId: string;
      clinicId: string;
      notes?: string | null;
    }) => {
      const url = buildUrl(api.organizations.adminBilling.waiveInvoice.path, { invoiceId });
      const res = await apiFetch(url, {
        method: api.organizations.adminBilling.waiveInvoice.method,
        token,
        body: api.organizations.adminBilling.waiveInvoice.input.parse({ notes }),
      });
      return api.organizations.adminBilling.waiveInvoice.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      invalidateBillingQueries(queryClient, variables.clinicId);
      toast({ title: "Success", description: "Invoice waived" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

