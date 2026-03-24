import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeactivatePlan,
} from "@/hooks/use-billing";
import { Plus, Pencil, PowerOff, Power } from "lucide-react";

type PlanType = "fixed" | "payg";
type BillingPeriod = "monthly" | "quarterly" | "yearly";

interface Plan {
  id: string;
  name: string;
  name_ar?: string | null;
  type: PlanType;
  billing_period: BillingPeriod;
  price?: number | null;
  payg_fee?: number | null;
  is_active?: boolean;
}

const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

function formatPrice(plan: Plan) {
  if (plan.type === "fixed" && plan.price != null) {
    return `$${plan.price.toFixed(2)} / ${BILLING_PERIOD_LABELS[plan.billing_period].toLowerCase()}`;
  }
  if (plan.type === "payg" && plan.payg_fee != null) {
    return `$${plan.payg_fee.toFixed(2)} / appointment`;
  }
  return "—";
}

interface PlanFormState {
  name: string;
  nameAr: string;
  type: PlanType;
  billingPeriod: BillingPeriod;
  price: string;
  paygFee: string;
}

const defaultForm: PlanFormState = {
  name: "",
  nameAr: "",
  type: "fixed",
  billingPeriod: "monthly",
  price: "",
  paygFee: "",
};

export default function SubscriptionPlansPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: plans = [], isLoading } = useAdminPlans(includeInactive);

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deactivateMutation = useDeactivatePlan();

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanFormState>(defaultForm);

  function openCreate() {
    setForm(defaultForm);
    setCreateOpen(true);
  }

  function openEdit(plan: Plan) {
    setForm({
      name: plan.name,
      nameAr: plan.name_ar ?? "",
      type: plan.type,
      billingPeriod: plan.billing_period,
      price: plan.price != null ? String(plan.price) : "",
      paygFee: plan.payg_fee != null ? String(plan.payg_fee) : "",
    });
    setEditPlan(plan);
  }

  function handleCreate() {
    createMutation.mutate(
      {
        name: form.name,
        nameAr: form.nameAr || null,
        type: form.type,
        billingPeriod: form.billingPeriod,
        price: form.type === "fixed" ? parseFloat(form.price) : undefined,
        paygFee: form.type === "payg" ? parseFloat(form.paygFee) : undefined,
      },
      { onSuccess: () => setCreateOpen(false) }
    );
  }

  function handleUpdate() {
    if (!editPlan) return;
    updateMutation.mutate(
      {
        planId: editPlan.id,
        data: {
          name: form.name,
          nameAr: form.nameAr || null,
          price: editPlan.type === "fixed" ? (form.price ? parseFloat(form.price) : null) : undefined,
          paygFee: editPlan.type === "payg" ? (form.paygFee ? parseFloat(form.paygFee) : null) : undefined,
        },
      },
      { onSuccess: () => setEditPlan(null) }
    );
  }

  function handleToggleActive(plan: Plan) {
    if (plan.is_active) {
      deactivateMutation.mutate(plan.id);
    } else {
      updateMutation.mutate({ planId: plan.id, data: { isActive: true } });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage fixed and pay-as-you-go billing plans</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer">Show inactive plans</Label>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Arabic Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-muted-foreground">{plan.name_ar || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={plan.type === "fixed" ? "default" : "secondary"}>
                        {plan.type === "fixed" ? "Fixed" : "Pay-As-You-Go"}
                      </Badge>
                    </TableCell>
                    <TableCell>{BILLING_PERIOD_LABELS[plan.billing_period]}</TableCell>
                    <TableCell>{formatPrice(plan as Plan)}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "outline"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(plan as Plan)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(plan as Plan)}
                          disabled={deactivateMutation.isPending || updateMutation.isPending}
                          title={plan.is_active ? "Deactivate plan" : "Activate plan"}
                        >
                          {plan.is_active ? (
                            <PowerOff className="w-4 h-4 text-destructive" />
                          ) : (
                            <Power className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} isEdit={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !form.name || (form.type === "fixed" ? !form.price : !form.paygFee)}
            >
              {createMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          {editPlan && <PlanForm form={form} setForm={setForm} isEdit planType={editPlan.type} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !form.name}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface PlanFormProps {
  form: PlanFormState;
  setForm: React.Dispatch<React.SetStateAction<PlanFormState>>;
  isEdit: boolean;
  planType?: PlanType;
}

function PlanForm({ form, setForm, isEdit, planType }: PlanFormProps) {
  const effectiveType = isEdit ? planType! : form.type;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name (English) *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Basic Monthly"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Name (Arabic)</Label>
          <Input
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            placeholder="e.g. الأساسي الشهري"
            dir="rtl"
          />
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Plan Type *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as PlanType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="payg">Pay-As-You-Go</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Billing Period *</Label>
            <Select
              value={form.billingPeriod}
              onValueChange={(v) => setForm((f) => ({ ...f, billingPeriod: v as BillingPeriod }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {effectiveType === "fixed" && (
        <div className="space-y-1.5">
          <Label>Price (USD) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 49.99"
          />
        </div>
      )}

      {effectiveType === "payg" && (
        <div className="space-y-1.5">
          <Label>Fee per Appointment (USD) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.paygFee}
            onChange={(e) => setForm((f) => ({ ...f, paygFee: e.target.value }))}
            placeholder="e.g. 2.50"
          />
        </div>
      )}
    </div>
  );
}
