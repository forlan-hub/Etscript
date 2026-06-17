import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Layers, Plus, Edit2, Trash2, ArrowLeft, Lock, BookOpen,
  GraduationCap, Briefcase, CheckCircle2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListUserTemplates,
  useCreateUserTemplate,
  useUpdateUserTemplate,
  useDeleteUserTemplate,
  useGetSubscription,
} from "@workspace/api-client-react";
import type { UserTemplate } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATES, SUITES, type DocumentSuite } from "@/lib/templates";

const MAX = 5;

const SUITE_ICONS: Record<DocumentSuite, React.ReactNode> = {
  publishing: <BookOpen className="w-4 h-4" />,
  academic: <GraduationCap className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
  letters: <Layers className="w-4 h-4" />,
};

const FONTS = ["Georgia", "Garamond", "Times New Roman", "Arial", "Calibri", "Palatino"];
const TARGETS = [
  { id: "amazon_kdp_paperback", label: "Amazon KDP (Paperback)" },
  { id: "a4_print", label: "A4 Print" },
  { id: "ebook", label: "eBook (Reflowable)" },
];
const THEMES = ["classic", "modern", "premium", "corporate", "academic"];
const SPACINGS = ["1.0", "1.5", "2.0"];
const MARGINS = ["narrow", "normal", "wide"];
const PAGE_NUM_POS = ["bottom_center", "bottom_right", "top_center", "top_right", "none"];
const CHAPTER_STYLES = ["arabic", "roman", "words", "none"];

interface FormState {
  name: string;
  bookType: string;
  publishingTarget: string;
  theme: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  marginSize: string;
  pageNumberPosition: string;
  chapterNumberStyle: string;
  citationStyle: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  bookType: "",
  publishingTarget: "a4_print",
  theme: "classic",
  fontFamily: "Georgia",
  fontSize: "11",
  lineSpacing: "1.5",
  marginSize: "normal",
  pageNumberPosition: "bottom_center",
  chapterNumberStyle: "arabic",
  citationStyle: "",
};

function formFromTemplate(t: UserTemplate): FormState {
  return {
    name: t.name,
    bookType: t.bookType ?? "",
    publishingTarget: t.publishingTarget ?? "a4_print",
    theme: t.theme ?? "classic",
    fontFamily: t.fontFamily ?? "Georgia",
    fontSize: t.fontSize?.toString() ?? "11",
    lineSpacing: t.lineSpacing ?? "1.5",
    marginSize: t.marginSize ?? "normal",
    pageNumberPosition: t.pageNumberPosition ?? "bottom_center",
    chapterNumberStyle: t.chapterNumberStyle ?? "arabic",
    citationStyle: t.citationStyle ?? "",
  };
}

function TemplateCard({ tpl, onEdit, onDelete }: {
  tpl: UserTemplate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const matchedTemplate = tpl.bookType ? TEMPLATES.find((t) => t.id === tpl.bookType) : null;
  const suite = matchedTemplate?.suite;
  const suiteLabel = suite ? SUITES.find((s) => s.id === suite)?.label : null;

  return (
    <Card className="group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {suite && <span className="text-primary">{SUITE_ICONS[suite]}</span>}
              <h3 className="font-semibold text-foreground truncate">{tpl.name}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suiteLabel && <Chip>{suiteLabel}</Chip>}
              {matchedTemplate && <Chip>{matchedTemplate.label}</Chip>}
              {tpl.theme && <Chip className="capitalize">{tpl.theme}</Chip>}
              {tpl.fontFamily && <Chip>{tpl.fontFamily}</Chip>}
              {tpl.lineSpacing && <Chip>{tpl.lineSpacing}× spacing</Chip>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete template?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{tpl.name}" will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-white hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block text-[11px] bg-secondary text-muted-foreground rounded px-1.5 py-0.5 ${className}`}>
      {children}
    </span>
  );
}

function TemplateForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
}) {
  const set = (k: keyof FormState) => (v: string) => onChange(k, v);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Template Name *</Label>
        <Input
          placeholder="My Novel Template"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Document Type</Label>
          <Select value={form.bookType} onValueChange={set("bookType")}>
            <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any type</SelectItem>
              {SUITES.filter((s) => s.id !== "letters").map((suite) => (
                <optgroup key={suite.id} label={suite.label}>
                  {TEMPLATES.filter((t) => t.suite === suite.id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </optgroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Publishing Target</Label>
          <Select value={form.publishingTarget} onValueChange={set("publishingTarget")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TARGETS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select value={form.theme} onValueChange={set("theme")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Body Font</Label>
          <Select value={form.fontFamily} onValueChange={set("fontFamily")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Font Size</Label>
          <Select value={form.fontSize} onValueChange={set("fontSize")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[9, 10, 11, 12, 13, 14].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}pt</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Line Spacing</Label>
          <Select value={form.lineSpacing} onValueChange={set("lineSpacing")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPACINGS.map((s) => <SelectItem key={s} value={s}>{s}×</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Margins</Label>
          <Select value={form.marginSize} onValueChange={set("marginSize")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MARGINS.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Page Numbers</Label>
          <Select value={form.pageNumberPosition} onValueChange={set("pageNumberPosition")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom_center">Bottom Center</SelectItem>
              <SelectItem value="bottom_right">Bottom Right</SelectItem>
              <SelectItem value="top_center">Top Center</SelectItem>
              <SelectItem value="top_right">Top Right</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Chapter Style</Label>
          <Select value={form.chapterNumberStyle} onValueChange={set("chapterNumberStyle")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="arabic">Chapter 1</SelectItem>
              <SelectItem value="roman">Chapter I</SelectItem>
              <SelectItem value="words">Chapter One</SelectItem>
              <SelectItem value="none">Unnumbered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default function MyTemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: templates, isLoading } = useListUserTemplates();
  const { data: sub } = useGetSubscription();
  const createMutation = useCreateUserTemplate();
  const updateMutation = useUpdateUserTemplate();
  const deleteMutation = useDeleteUserTemplate();

  const isPremium = sub?.plan === "premium";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const setField = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (tpl: UserTemplate) => {
    setEditingId(tpl.id);
    setForm(formFromTemplate(tpl));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      bookType: form.bookType || undefined,
      publishingTarget: form.publishingTarget || undefined,
      theme: form.theme || undefined,
      fontFamily: form.fontFamily || undefined,
      fontSize: form.fontSize ? parseInt(form.fontSize, 10) : undefined,
      lineSpacing: form.lineSpacing || undefined,
      marginSize: form.marginSize || undefined,
      pageNumberPosition: form.pageNumberPosition || undefined,
      chapterNumberStyle: form.chapterNumberStyle || undefined,
      citationStyle: form.citationStyle || undefined,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
      toast({ title: "Template updated" });
    } else {
      await createMutation.mutateAsync({ data: payload });
      toast({ title: "Template saved" });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    toast({ title: "Template deleted" });
  };

  const handleUseTemplate = (tpl: UserTemplate) => {
    setLocation("/upload");
    toast({ title: `"${tpl.name}" loaded — start your next manuscript`, description: "Settings will be applied at the Format step." });
  };

  const count = templates?.length ?? 0;
  const canCreate = isPremium && count < MAX;

  return (
    <AppLayout title="My Templates">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Tools
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Layers className="w-7 h-7 text-primary mt-0.5 shrink-0" />
            <div>
              <h1 className="text-2xl font-serif font-medium">My Templates</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Save your preferred settings as named templates. Reuse them across documents.
              </p>
            </div>
          </div>
          {isPremium && (
            <Button
              onClick={openCreate}
              disabled={!canCreate}
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          )}
        </div>

        {!isPremium && (
          <Card className="border-dashed">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Premium Feature</h3>
                <p className="text-sm text-muted-foreground">
                  Save up to 5 custom formatting templates and reuse them across all your documents.
                  Upgrade to Premium to unlock this feature.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="mt-3">View Pricing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isPremium && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {count} of {MAX} templates used
              </p>
              {!canCreate && count >= MAX && (
                <p className="text-xs text-muted-foreground">Maximum reached. Delete one to create another.</p>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : count === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center px-8">
                <Layers className="w-10 h-10 text-muted-foreground/40" />
                <div>
                  <p className="font-medium text-foreground">No saved templates yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first template to speed up future formatting jobs.
                  </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="w-4 h-4" /> Create First Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates?.map((tpl) => (
                  <div key={tpl.id} className="flex gap-3 items-stretch">
                    <div className="flex-1">
                      <TemplateCard
                        tpl={tpl}
                        onEdit={() => openEdit(tpl)}
                        onDelete={() => handleDelete(tpl.id)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-center gap-1.5 shrink-0"
                      onClick={() => handleUseTemplate(tpl)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingId ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm form={form} onChange={setField} />
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}
              onClick={handleSave}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving…" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
