import { useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useOrganizations, 
  useRejectOrganization, 
  useSuspendOrganization,
  useDeleteOrganization,
  useCreateOrganization
} from "@/hooks/use-organizations";
import {
  useApproveOrganization,
  useBillingPlans,
  useBillingSummary,
  useCancelClinicSubscription,
  useChangeClinicPlan,
  useClinicCharges,
  useClinicInvoices,
  useClinicSubscription,
  useCreateClinicSubscription,
  usePayInvoice,
  useReactivateClinicSubscription,
  useSetOrganizationStatus,
  useWaiveInvoice,
} from "@/hooks/use-billing";
import { useDoctors } from "@/hooks/use-doctors";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, CheckCircle, XCircle, Ban, Trash2, Building2, Plus, CreditCard, Receipt, AlertTriangle } from "lucide-react";

type ClinicRecord = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  status?: string | null;
  isApproved?: boolean | null;
};

export default function OrganizationsPage() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'disabled' | 'suspended'>('all');
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveClinicId, setApproveClinicId] = useState<string | null>(null);
  const [approvePlanId, setApprovePlanId] = useState("");
  const [billingClinic, setBillingClinic] = useState<ClinicRecord | null>(null);
  const [planSelection, setPlanSelection] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");

  const { data: orgsData, isLoading } = useOrganizations({
    search: search || undefined,
    status: filter === 'all' ? undefined : filter
  });

  const { data: doctorsData } = useDoctors({ isApproved: 'true' });
  const { data: billingPlans = [] } = useBillingPlans();
  const { data: billingSummary } = useBillingSummary();
  const subscriptionQuery = useClinicSubscription(billingClinic?.id);
  const invoicesQuery = useClinicInvoices(billingClinic?.id, { limit: "50" });
  const chargesQuery = useClinicCharges(billingClinic?.id, { limit: "50" });
  const approveMutation = useApproveOrganization();
  const rejectMutation = useRejectOrganization();
  const suspendMutation = useSuspendOrganization();
  const setStatusMutation = useSetOrganizationStatus();
  const deleteMutation = useDeleteOrganization();
  const createMutation = useCreateOrganization();
  const createSubscriptionMutation = useCreateClinicSubscription();
  const changePlanMutation = useChangeClinicPlan();
  const cancelSubscriptionMutation = useCancelClinicSubscription();
  const reactivateSubscriptionMutation = useReactivateClinicSubscription();
  const payInvoiceMutation = usePayInvoice();
  const waiveInvoiceMutation = useWaiveInvoice();

  const subscription = subscriptionQuery.data;
  const defaultPlanId = billingPlans[0]?.id || "";

  const formatPlanLabel = (plan: any) => {
    const fixed = plan?.fixed_price != null ? `$${Number(plan.fixed_price).toFixed(2)} setup` : null;
    const payg = plan?.payg_fee != null ? `$${Number(plan.payg_fee).toFixed(2)} / appt` : null;
    const pricing = fixed && payg ? `${fixed} + ${payg}` : fixed || payg || "No pricing";
    return `${plan?.name || "Plan"} (${pricing})`;
  };

  const handleApproveClick = (clinicId: string) => {
    setApproveClinicId(clinicId);
    setApprovePlanId(defaultPlanId);
    setIsApproveOpen(true);
  };

  const handleApprove = () => {
    if (!approveClinicId) return;

    approveMutation.mutate({
      clinicId: approveClinicId,
      data: approvePlanId
        ? {
            planId: approvePlanId,
          }
        : undefined,
    }, {
      onSuccess: () => {
        setIsApproveOpen(false);
        setApproveClinicId(null);
      }
    });
  };

  const handleReject = () => {
    if (selectedOrgId && rejectReason) {
      rejectMutation.mutate({ clinicId: selectedOrgId, reason: rejectReason });
      setSelectedOrgId(null);
      setRejectReason("");
      setActionType(null);
    }
  };

  const handleSuspend = () => {
    if (selectedOrgId && suspendReason) {
      suspendMutation.mutate({ clinicId: selectedOrgId, reason: suspendReason });
      setSelectedOrgId(null);
      setSuspendReason("");
      setActionType(null);
    }
  };

  const handleClinicStatus = (clinicId: string, status: "disabled" | "suspended" | "approved", reason?: string) => {
    setStatusMutation.mutate({ clinicId, status, reason: reason || null });
  };

  const handleDelete = (clinicId: string) => {
    if (confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      deleteMutation.mutate(clinicId);
    }
  };

  const openBillingSheet = (org: ClinicRecord) => {
    setBillingClinic({
      id: String(org.id),
      name: org.name,
      phone: org.phone,
      email: org.email,
      type: org.type,
      status: org.status,
      isApproved: org.isApproved,
    });
    setPlanSelection("");
    setInvoiceNote("");
  };

  const handleCreateOrChangePlan = () => {
    if (!billingClinic?.id || !planSelection) return;

    if (!subscription) {
      createSubscriptionMutation.mutate({
        clinicId: billingClinic.id,
        data: {
          planId: planSelection,
        },
      });
      return;
    }

    changePlanMutation.mutate({
      clinicId: billingClinic.id,
      newPlanId: planSelection,
    });
  };

  const filteredOrgs = orgsData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Collected Revenue</CardDescription>
              <CardTitle className="text-3xl">${Number(billingSummary?.totalRevenue || 0).toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Outstanding</CardDescription>
              <CardTitle className="text-3xl">${Number(billingSummary?.outstanding || 0).toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overdue Invoices</CardDescription>
              <CardTitle className="text-3xl">{billingSummary?.overdueCount || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Organizations</h1>
            <p className="text-muted-foreground mt-1">Manage clinics, approvals, subscription plans, and manual billing.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add New Clinic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
              </DialogHeader>
              <ClinicForm 
                doctors={doctorsData?.data || []}
                onSubmit={(data) => {
                  createMutation.mutate(data as any, {
                    onSuccess: () => setIsCreateOpen(false)
                  });
                }}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Search */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto">
            {(['all', 'pending', 'approved', 'disabled', 'suspended'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? "bg-white dark:bg-black shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                } capitalize`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search organizations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/30 border-b border-border">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => {
                  const status = (org as any).status || ((org as any).isApproved ? 'approved' : 'pending');
                  return (
                    <TableRow 
                      key={org.id} 
                      className="hover:bg-muted/20 border-b border-border last:border-0 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/organizations/${org.id}/users`)}
                    >
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{org.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {org.type || "clinic"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{org.phone || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">{org.email || "No email"}</TableCell>
                      <TableCell>
                        {status === 'approved' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge>
                        ) : status === 'disabled' ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Disabled</Badge>
                        ) : status === 'pending' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                        ) : status === 'suspended' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Rejected</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBillingSheet({
                              id: String(org.id),
                              name: (org as any).name,
                              phone: (org as any).phone,
                              email: (org as any).email,
                              type: (org as any).type,
                              status: (org as any).status,
                              isApproved: (org as any).isApproved,
                            });
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" /> Billing
                        </Button>
                      </TableCell>
                      <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleApproveClick(String(org.id))}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  setSelectedOrgId(String(org.id));
                                  setActionType('reject');
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          
                          {status === 'approved' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                onClick={() => handleClinicStatus(String(org.id), "disabled", "Disabled by superadmin")}
                              >
                                Disable
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  setSelectedOrgId(String(org.id));
                                  setActionType('suspend');
                                }}
                              >
                                <Ban className="w-4 h-4 mr-1" /> Suspend
                              </Button>
                            </>
                          )}

                          {status === 'disabled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleClinicStatus(String(org.id), "approved")}
                            >
                              Re-enable
                            </Button>
                          )}

                          {status === 'suspended' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleClinicStatus(String(org.id), "approved")}
                            >
                              Approve Again
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(String(org.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrgs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Reject Dialog */}
        <Dialog open={actionType === 'reject'} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="Reason for rejection..." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleReject}
                disabled={!rejectReason}
              >
                Confirm Rejection
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Clinic and Start Billing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Initial Plan</Label>
                <Select value={approvePlanId} onValueChange={setApprovePlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a billing plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {formatPlanLabel(plan)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleApprove}
                disabled={!approveClinicId || approveMutation.isPending}
              >
                {approveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Approve and Create Subscription
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={actionType === 'suspend'} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="Reason for suspension..." 
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleSuspend}
                disabled={!suspendReason}
              >
                Confirm Suspension
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Sheet open={!!billingClinic} onOpenChange={(open) => !open && setBillingClinic(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>{billingClinic?.name || "Clinic"} Billing</SheetTitle>
              <SheetDescription>Review subscription state, manual invoices, and appointment charges.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Subscription</CardTitle>
                  <CardDescription>
                    {subscription
                      ? (() => {
                          const end = subscription.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString()
                            : null;
                          const cycle = end ? `PAYG monthly cycle through ${end}` : "No billing cycle (fixed-only)";
                          const status = subscription.cancel_at_period_end
                            ? `${subscription.status} (cancels at period end)`
                            : subscription.status;
                          return `${status} · ${cycle}`;
                        })()
                      : "No subscription exists yet for this clinic."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricCard label="Current plan" value={subscription.plan?.name || "Unknown"} />
                      <MetricCard label="Cycle" value={subscription.current_period_end ? "Monthly" : "None"} />
                      <MetricCard label="Pending change" value={subscription.pending_plan?.name || "None"} />
                    </div>
                  ) : null}

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>{subscription ? "Queue next plan" : "Create subscription"}</Label>
                      <Select value={planSelection} onValueChange={setPlanSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a billing plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {formatPlanLabel(plan)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCreateOrChangePlan} disabled={!planSelection || createSubscriptionMutation.isPending || changePlanMutation.isPending}>
                      {(createSubscriptionMutation.isPending || changePlanMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {subscription ? "Queue Plan Change" : "Create Subscription"}
                    </Button>
                    {subscription?.status === "cancelled" || subscription?.cancel_at_period_end ? (
                      <Button
                        variant="outline"
                        onClick={() => billingClinic?.id && reactivateSubscriptionMutation.mutate(billingClinic.id)}
                        disabled={reactivateSubscriptionMutation.isPending}
                      >
                        Reactivate
                      </Button>
                    ) : subscription ? (
                      <Button
                        variant="outline"
                        onClick={() => billingClinic?.id && cancelSubscriptionMutation.mutate(billingClinic.id)}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        {subscription.current_period_end ? "Cancel at Period End" : "Cancel Immediately"}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="invoices">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="charges">Charges</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Invoices</CardTitle>
                      <CardDescription>Manual settlement only. Mark invoices as paid or waived.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Settlement note</Label>
                        <Input value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)} placeholder="Optional note for pay/waive" />
                      </div>

                      {invoicesQuery.isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading invoices...</div>
                      ) : invoicesQuery.data?.length ? (
                        <div className="space-y-3">
                          {invoicesQuery.data.map((invoice) => (
                            <div key={invoice.id} className="rounded-xl border border-border p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-muted-foreground" />
                                    {invoice.invoice_number}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {invoice.period_start} to {invoice.period_end} • Due {invoice.due_date}
                                  </div>
                                  <div className="mt-1 text-lg font-semibold">
                                    {invoice.currency} {Number(invoice.amount || 0).toFixed(2)}
                                  </div>
                                </div>
                                <Badge variant="outline" className="capitalize">{invoice.status}</Badge>
                              </div>
                              {(invoice.status === "open" || invoice.status === "overdue") && billingClinic?.id ? (
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => payInvoiceMutation.mutate({ invoiceId: invoice.id, clinicId: billingClinic.id, notes: invoiceNote || null })}
                                    disabled={payInvoiceMutation.isPending}
                                  >
                                    Mark Paid
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => waiveInvoiceMutation.mutate({ invoiceId: invoice.id, clinicId: billingClinic.id, notes: invoiceNote || null })}
                                    disabled={waiveInvoiceMutation.isPending}
                                  >
                                    Waive
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">No invoices yet.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="charges">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Appointment Charges</CardTitle>
                      <CardDescription>PAYG charges are created from completed appointments and rolled into invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chargesQuery.isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading charges...</div>
                      ) : chargesQuery.data?.length ? (
                        <div className="space-y-3">
                          {chargesQuery.data.map((charge) => (
                            <div key={charge.id} className="rounded-xl border border-border p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-medium">Appointment {charge.appointment_id.slice(0, 8)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Triggered {new Date(charge.triggered_at).toLocaleString()}
                                  </div>
                                  <div className="mt-1 text-lg font-semibold">
                                    {charge.currency} {Number(charge.fee_amount || 0).toFixed(2)}
                                  </div>
                                  {charge.notes ? (
                                    <div className="mt-2 text-sm text-muted-foreground">{charge.notes}</div>
                                  ) : null}
                                </div>
                                <Badge variant="outline" className="capitalize">{charge.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">No charges found.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {subscription?.status === "past_due" || invoicesQuery.data?.some((invoice) => invoice.status === "overdue") ? (
                <Card className="border-orange-200 bg-orange-50/60">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-900">Billing attention needed</div>
                        <div className="text-sm text-orange-800">
                          This clinic has overdue billing signals. You can keep the subscription active and change clinic status separately if operations should be blocked.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold capitalize">{value}</div>
    </div>
  );
}

function ClinicForm({ 
  doctors,
  onSubmit, 
  isLoading 
}: { 
  doctors: Array<{
    id: string | number;
    user?: { first_name?: string; last_name?: string; full_name?: string; phone?: string } | null;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }>;
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [addressAr, setAddressAr] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("Asia/Beirut");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: any = {
      name,
      ownerId,
    };

    if (nameAr) formData.name_ar = nameAr;
    if (description) formData.description = description;
    if (descriptionAr) formData.description_ar = descriptionAr;
    if (phone) formData.phone = phone;
    if (email) formData.email = email;
    if (website) formData.website = website;
    if (address) formData.address = address;
    if (addressAr) formData.address_ar = addressAr;
    if (timezone) formData.timezone = timezone;
    if (latitude) formData.latitude = parseFloat(latitude);
    if (longitude) formData.longitude = parseFloat(longitude);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="name">Clinic Name (English) *</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Hakeemak Medical Center"
        />
      </div>

      <div>
        <Label htmlFor="nameAr">Clinic Name (Arabic)</Label>
        <Input 
          id="nameAr"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          dir="rtl"
          placeholder="مركز حكمة الطبي"
        />
      </div>

      <div>
        <Label htmlFor="ownerId">Owner (Doctor) *</Label>
        <Select value={ownerId} onValueChange={setOwnerId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a doctor as clinic owner" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => {
              const name = (
                doctor.user?.full_name ||
                doctor.full_name ||
                `${doctor.user?.first_name || doctor.first_name || ''} ${doctor.user?.last_name || doctor.last_name || ''}`.trim()
              ).trim();
              const phone = doctor.user?.phone || doctor.phone || "";
              const base = (name || phone || "Unknown doctor").trim();
              const displayName = phone ? `${base} - ${phone}` : base;
              return (
                <SelectItem key={String(doctor.id)} value={String(doctor.id)}>
                  {displayName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Only approved doctors can be selected as clinic owners.
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description (English)</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Clinic description..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="descriptionAr">Description (Arabic)</Label>
        <Textarea 
          id="descriptionAr"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          placeholder="وصف العيادة..."
          rows={2}
          dir="rtl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="clinic@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          type="url"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Address (English)</Label>
        <Input 
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address..."
        />
      </div>

      <div>
        <Label htmlFor="addressAr">Address (Arabic)</Label>
        <Input 
          id="addressAr"
          value={addressAr}
          onChange={(e) => setAddressAr(e.target.value)}
          placeholder="العنوان..."
          dir="rtl"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input 
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            type="number"
            step="any"
            placeholder="33.8547"
          />
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input 
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            type="number"
            step="any"
            placeholder="35.8623"
          />
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input 
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Beirut"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !name || !ownerId}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Create Clinic
      </Button>
    </form>
  );
}
