import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useGetAdminPlans,
  useCreateAdminPlan,
  useUpdateAdminPlan,
  useDeleteAdminPlan,
} from "@workspace/api-client-react";
import type { Plan, CreatePlanInput, UpdatePlanInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, CheckCircle2, XCircle } from "lucide-react";

function formatNaira(kobo: number) {
  if (kobo === 0) return "Free";
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

const BILLING_PERIOD_LABELS: Record<string, string> = {
  free: "Free",
  one_time: "One-time",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  lifetime: "Lifetime",
};

const EMPTY_FORM = {
  slug: "",
  name: "",
  description: "",
  priceKobo: 0,
  billingPeriod: "monthly",
  isActive: true,
  isFeatured: false,
  maxManuscripts: -1,
  maxStorageMb: 2048,
  features: [] as string[],
  sortOrder: 0,
};

type PlanForm = typeof EMPTY_FORM;

function PlanFormDialog({
  open,
  onClose,
  initial,
  onSave,
  saving,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initial: PlanForm;
  onSave: (data: PlanForm) => void;
  saving: boolean;
  title: string;
}) {
  const [form, setForm] = useState<PlanForm>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));

  function sync(open: boolean) {
    if (open) {
      setForm(initial);
      setFeaturesText(initial.features.join("\n"));
    }
  }

  function field<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    onSave({ ...form, features });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { sync(o); if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => field("slug", e.target.value)} placeholder="premium_quarterly" />
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => field("name", e.target.value)} placeholder="Premium Quarterly" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => field("description", e.target.value)} placeholder="Short tagline shown on pricing" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Price (kobo)</Label>
              <Input
                type="number"
                value={form.priceKobo}
                onChange={(e) => field("priceKobo", Number(e.target.value))}
                placeholder="1200000"
              />
              <p className="text-xs text-muted-foreground">= {formatNaira(form.priceKobo)}</p>
            </div>
            <div className="space-y-1">
              <Label>Billing Period</Label>
              <Input value={form.billingPeriod} onChange={(e) => field("billingPeriod", e.target.value)} placeholder="monthly" />
              <p className="text-xs text-muted-foreground">free / one_time / monthly / quarterly / annual / lifetime</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Max Manuscripts (-1 = unlimited)</Label>
              <Input type="number" value={form.maxManuscripts} onChange={(e) => field("maxManuscripts", Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Max Storage (MB)</Label>
              <Input type="number" value={form.maxStorageMb} onChange={(e) => field("maxStorageMb", Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Sort Order</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => field("sortOrder", Number(e.target.value))} />
          </div>

          <div className="space-y-1">
            <Label>Features (one per line)</Label>
            <Textarea
              rows={5}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Unlimited manuscripts&#10;2 GB storage&#10;Priority support"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => field("isActive", v)} id="isActive" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => field("isFeatured", v)} id="isFeatured" />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPlansPage() {
  const { toast } = useToast();
  const { data: plans = [], refetch, isLoading } = useGetAdminPlans();

  const createMutation = useCreateAdminPlan();
  const updateMutation = useUpdateAdminPlan();
  const deleteMutation = useDeleteAdminPlan();

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

  function planToForm(plan: Plan): PlanForm {
    return {
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      priceKobo: plan.priceKobo,
      billingPeriod: plan.billingPeriod,
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      maxManuscripts: plan.maxManuscripts,
      maxStorageMb: plan.maxStorageMb,
      features: plan.features,
      sortOrder: plan.sortOrder,
    };
  }

  async function handleCreate(data: PlanForm) {
    try {
      await createMutation.mutateAsync({ data: data as CreatePlanInput });
      toast({ title: "Plan created" });
      setCreateOpen(false);
      refetch();
    } catch {
      toast({ title: "Failed to create plan", variant: "destructive" });
    }
  }

  async function handleUpdate(data: PlanForm) {
    if (!editPlan) return;
    try {
      await updateMutation.mutateAsync({ planId: editPlan.id, data: data as UpdatePlanInput });
      toast({ title: "Plan updated" });
      setEditPlan(null);
      refetch();
    } catch {
      toast({ title: "Failed to update plan", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (deletePlanId == null) return;
    try {
      await deleteMutation.mutateAsync({ planId: deletePlanId });
      toast({ title: "Plan deleted" });
      setDeletePlanId(null);
      refetch();
    } catch {
      toast({ title: "Failed to delete plan", variant: "destructive" });
    }
  }

  async function toggleActive(plan: Plan) {
    try {
      await updateMutation.mutateAsync({ planId: plan.id, data: { isActive: !plan.isActive } });
      refetch();
    } catch {
      toast({ title: "Failed to update plan", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Plans">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Manage subscription plans shown on the pricing page.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading plans…</div>
        ) : plans.length === 0 ? (
          <div className="text-sm text-muted-foreground">No plans yet. Click "New Plan" to add one.</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">Billing</th>
                  <th className="px-4 py-3 text-left font-medium">Limits</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{plan.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium">
                            {plan.name}
                            {plan.isFeatured && (
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{plan.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatNaira(plan.priceKobo)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {BILLING_PERIOD_LABELS[plan.billingPeriod] ?? plan.billingPeriod}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {plan.maxManuscripts === -1 ? "∞" : plan.maxManuscripts} ms •{" "}
                      {plan.maxStorageMb >= 1024
                        ? `${plan.maxStorageMb / 1024} GB`
                        : `${plan.maxStorageMb} MB`}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(plan)}
                        className="flex items-center gap-1 text-xs"
                        title="Toggle active"
                      >
                        {plan.isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={plan.isActive ? "text-green-600" : "text-muted-foreground"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditPlan(plan)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletePlanId(plan.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlanFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={EMPTY_FORM}
        onSave={handleCreate}
        saving={createMutation.isPending}
        title="New Plan"
      />

      {editPlan && (
        <PlanFormDialog
          open
          onClose={() => setEditPlan(null)}
          initial={planToForm(editPlan)}
          onSave={handleUpdate}
          saving={updateMutation.isPending}
          title={`Edit — ${editPlan.name}`}
        />
      )}

      <AlertDialog open={deletePlanId != null} onOpenChange={(o) => { if (!o) setDeletePlanId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the plan. Existing subscribers are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
