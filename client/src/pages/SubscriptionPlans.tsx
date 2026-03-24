import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAdminPlans, useCreatePlan, useUpdatePlan, useDeactivatePlan } from "@/hooks/use-billing";
import { Plus, Pencil, PowerOff, Power } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  name_ar?: string | null;
  fixed_price?: number | null;
  payg_fee?: number | null;
  is_active?: boolean;
}

function formatPricing(plan: Plan) {
  const fixed = plan.fixed_price != null ? `$${plan.fixed_price.toFixed(2)} setup` : null;
  const payg = plan.payg_fee != null ? `$${plan.payg_fee.toFixed(2)} / appointment` : null;
  if (fixed && payg) return `${fixed} + ${payg}`;
  return fixed || payg || "—";
}

interface PlanFormState {
  name: string;
  nameAr: string;
  fixedPrice: string;
  paygFee: string;
}

const defaultForm: PlanFormState = {
  name: "",
  nameAr: "",
  fixedPrice: "",
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
      fixedPrice: plan.fixed_price != null ? String(plan.fixed_price) : "",
      paygFee: plan.payg_fee != null ? String(plan.payg_fee) : "",
    });
    setEditPlan(plan);
  }

  function handleCreate() {
    createMutation.mutate(
      {
        name: form.name,
        nameAr: form.nameAr || null,
        fixedPrice: form.fixedPrice ? parseFloat(form.fixedPrice) : null,
        paygFee: form.paygFee ? parseFloat(form.paygFee) : null,
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
          fixedPrice: form.fixedPrice ? parseFloat(form.fixedPrice) : null,
          paygFee: form.paygFee ? parseFloat(form.paygFee) : null,
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

  const createDisabled =
    createMutation.isPending || !form.name || (!form.fixedPrice && !form.paygFee);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage unified pricing (one-time setup and/or monthly PAYG)
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="show-inactive" checked={includeInactive} onCheckedChange={setIncludeInactive} />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
            Show inactive plans
          </Label>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Arabic Name</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-muted-foreground" dir="rtl">
                      {plan.name_ar || "—"}
                    </TableCell>
                    <TableCell>{formatPricing(plan as Plan)}</TableCell>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createDisabled}>
              {createMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !form.name}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PlanForm({
  form,
  setForm,
}: {
  form: PlanFormState;
  setForm: React.Dispatch<React.SetStateAction<PlanFormState>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name (English) *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Growth"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Name (Arabic)</Label>
          <Input
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            placeholder="e.g. باقة النمو"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>One-time Setup (USD)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.fixedPrice}
          onChange={(e) => setForm((f) => ({ ...f, fixedPrice: e.target.value }))}
          placeholder="e.g. 50.00"
        />
      </div>

      <div className="space-y-1.5">
        <Label>PAYG Fee per Appointment (USD)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.paygFee}
          onChange={(e) => setForm((f) => ({ ...f, paygFee: e.target.value }))}
          placeholder="e.g. 3.00"
        />
        <p className="text-xs text-muted-foreground">At least one of Setup or PAYG fee is required.</p>
      </div>
    </div>
  );
}

