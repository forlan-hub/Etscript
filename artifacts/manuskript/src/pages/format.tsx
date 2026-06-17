import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoute, useLocation, Link } from "wouter";
import { useGetJob, useUpdateJob } from "@workspace/api-client-react";
import {
  BookOpen, GraduationCap, Briefcase, Layout, Palette,
  ArrowRight, ArrowLeft, Mail, Lock, Eye, Columns2, X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  SUITES, TEMPLATES, getTemplatesBySuite, getDocumentSuite, CITATION_STYLES,
  type DocumentSuite, type DocumentTemplate,
} from "@/lib/templates";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { TemplatePreviewModal } from "@/components/template-preview-modal";
import { TemplateCompareModal } from "@/components/template-compare-modal";

const MANUSCRIPT_SUITES = SUITES.filter((s) => s.id !== "letters");

const SUITE_ICONS: Record<DocumentSuite, React.ReactNode> = {
  publishing: <BookOpen className="w-5 h-5" />,
  academic: <GraduationCap className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  letters: <Mail className="w-5 h-5" />,
};

const TARGETS = [
  { id: "amazon_kdp_paperback", label: "Amazon KDP (Paperback)", size: "6\" × 9\"", suites: ["publishing"] },
  { id: "ebook", label: "eBook (EPUB/MOBI)", size: "Reflowable", suites: ["publishing"] },
  { id: "a4_print", label: "A4 Print", size: "8.27\" × 11.69\"", suites: ["publishing", "academic", "business"] },
];

const THEMES = [
  {
    id: "classic",
    label: "Classic",
    desc: "Traditional serif typography, centered chapter titles, justified body text.",
    preview: (
      <div className="bg-[#faf9f7] p-4 flex items-center justify-center border-b border-border h-40">
        <div className="bg-white w-28 h-36 shadow border border-gray-100 p-3 font-serif">
          <div className="text-center font-bold text-[8px] mb-2 tracking-wide">Chapter One</div>
          <div className="h-px bg-gray-100 mb-2" />
          <div className="space-y-1">
            {[12, 11, 12, 10, 12, 9].map((w, i) => (
              <div key={i} className="bg-gray-200 h-[3px] rounded-sm" style={{ width: `${w * 8}%` }} />
            ))}
          </div>
          <div className="text-center text-[6px] text-gray-400 mt-3">1</div>
        </div>
      </div>
    ),
  },
  {
    id: "modern",
    label: "Modern",
    desc: "Clean sans-serif headings, rule divider below chapter titles, generous whitespace.",
    preview: (
      <div className="bg-[#f4f6f8] p-4 flex items-center justify-center border-b border-border h-40">
        <div className="bg-white w-28 h-36 shadow border border-gray-100 p-3 font-sans">
          <div className="font-bold text-[8px] mb-1 tracking-widest uppercase text-gray-700">Chapter 1</div>
          <div className="h-px bg-gray-300 w-3/5 mb-2" />
          <div className="space-y-1">
            {[12, 10, 12, 11, 12, 8].map((w, i) => (
              <div key={i} className="bg-gray-200 h-[3px] rounded-sm" style={{ width: `${w * 8}%` }} />
            ))}
          </div>
          <div className="text-right text-[6px] text-gray-400 mt-3">1</div>
        </div>
      </div>
    ),
  },
  {
    id: "premium",
    label: "Premium",
    desc: "Garamond-style elegance, ornate chapter ornaments, larger chapter headings.",
    preview: (
      <div className="bg-[#fdf8f2] p-4 flex items-center justify-center border-b border-border h-40">
        <div className="bg-white w-28 h-36 shadow border border-amber-50 p-3 font-serif">
          <div className="text-center font-bold text-[9px] mb-1 tracking-wide">Chapter One</div>
          <div className="text-center text-[7px] text-amber-400 mb-2">✦</div>
          <div className="space-y-1">
            {[12, 11, 12, 10, 12, 9].map((w, i) => (
              <div key={i} className="bg-amber-100 h-[3px] rounded-sm" style={{ width: `${w * 8}%` }} />
            ))}
          </div>
          <div className="text-center text-[6px] text-amber-300 mt-3">1</div>
        </div>
      </div>
    ),
  },
];

export default function FormatPage() {
  const [, params] = useRoute("/format/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();

  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId } as any });
  const updateJob = useUpdateJob();

  const [selectedSuite, setSelectedSuite] = useState<DocumentSuite | "">("");
  const [bookType, setBookType] = useState<string>("");
  const [citationStyle, setCitationStyle] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [theme, setTheme] = useState<string>("");

  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (job && !initializedRef.current) {
      if (job.bookType) {
        setBookType(job.bookType);
        setSelectedSuite(getDocumentSuite(job.bookType));
      }
      if (job.citationStyle) setCitationStyle(job.citationStyle);
      if (job.publishingTarget) setTarget(job.publishingTarget);
      if (job.theme) setTheme(job.theme);
      initializedRef.current = true;
    }
  }, [job]);

  const handleSuiteSelect = (suite: DocumentSuite) => {
    setSelectedSuite(suite);
    setBookType("");
    setCitationStyle("");
    setCompareSet(new Set());
    const suiteTemplates = getTemplatesBySuite(suite);
    if (suiteTemplates.length > 0 && !target) {
      setTarget(suiteTemplates[0].defaultTarget);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    setBookType(templateId);
    if (tpl && !theme) setTheme(tpl.defaultTheme);
    if (tpl && !target) setTarget(tpl.defaultTarget);
  };

  const toggleCompare = (id: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    if (!bookType || !target || !theme) return;
    await updateJob.mutateAsync({
      id: jobId,
      data: { bookType, publishingTarget: target, theme, ...(citationStyle ? { citationStyle } : {}) },
    });
    setLocation(`/customize/${jobId}`);
  };

  const availableTargets = target
    ? TARGETS
    : selectedSuite === "academic" || selectedSuite === "business"
    ? TARGETS.filter((t) => t.suites.includes(selectedSuite))
    : TARGETS;

  const canContinue = !!bookType && !!target && !!theme;

  const currentSuiteTemplates = selectedSuite
    ? getTemplatesBySuite(selectedSuite as DocumentSuite)
    : [];
  const compareTemplates = currentSuiteTemplates.filter((t) => compareSet.has(t.id));

  if (isLoading) {
    return (
      <AppLayout title="Format Setup">
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Format Setup">
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        <WorkflowStepper currentStep={2} jobId={jobId} />

        {/* Suite Selection */}
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-serif font-medium">Document Suite</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the category that best describes your document.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MANUSCRIPT_SUITES.map((suite) => (
              <Card
                key={suite.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  selectedSuite === suite.id
                    ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5"
                    : ""
                }`}
                onClick={() => handleSuiteSelect(suite.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-primary mt-0.5">{SUITE_ICONS[suite.id]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{suite.label}</h3>
                          {suite.isPremium && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                              <Lock className="w-2.5 h-2.5" />Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {suite.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Letters callout */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-secondary/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Need a Professional Letter?</p>
                <p className="text-xs text-muted-foreground">
                  Appointment letters, cover letters, resignation letters — built with a dedicated form.
                </p>
              </div>
            </div>
            <Link href="/letters/new">
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Letter Builder
              </Button>
            </Link>
          </div>
        </div>

        {/* Template Selection */}
        {selectedSuite && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-medium">Template</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the specific document type. Use{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </span>{" "}
                  to explore a template, or{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium">
                    <Columns2 className="w-3.5 h-3.5" /> Compare
                  </span>{" "}
                  to compare up to 3 side-by-side.
                </p>
              </div>
              {compareSet.size >= 1 && (
                <button
                  onClick={() => setCompareSet(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 mt-1"
                >
                  <X className="w-3 h-3" /> Clear compare
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSuiteTemplates.map((tpl) => {
                const isSelected = bookType === tpl.id;
                const isInCompare = compareSet.has(tpl.id);
                const compareDisabled = compareSet.size >= 3 && !isInCompare;

                return (
                  <Card
                    key={tpl.id}
                    className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 ${
                      isSelected
                        ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleTemplateSelect(tpl.id)}
                  >
                    {/* Thumbnail strip */}
                    <div className="flex items-center justify-center bg-secondary/20 py-4 border-b border-border">
                      <TemplateThumbnail template={tpl} size="sm" />
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-sm text-foreground leading-tight">{tpl.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                            {tpl.desc}
                          </p>
                        </div>
                        {tpl.isPremium && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                            Premium
                          </Badge>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(tpl);
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </button>
                        <div className="w-px h-4 bg-border" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(tpl.id);
                          }}
                          disabled={compareDisabled}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            isInCompare
                              ? "bg-primary text-primary-foreground"
                              : compareDisabled
                              ? "text-muted-foreground/40 cursor-not-allowed"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          <Columns2 className="w-3.5 h-3.5" />
                          {isInCompare ? "Added" : "Compare"}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Citation Style (Academic only) */}
        {selectedSuite === "academic" && bookType && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-serif font-medium">Citation Style</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select the referencing style required by your institution.
              </p>
            </div>
            <div className="max-w-xs">
              <Label className="sr-only">Citation Style</Label>
              <Select value={citationStyle} onValueChange={setCitationStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select citation style…" />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_STYLES.map((cs) => (
                    <SelectItem key={cs.id} value={cs.id}>
                      {cs.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Stored with your document and used when the Citation Engine generates your reference list.
              </p>
            </div>
          </div>
        )}

        {/* Publishing Target */}
        {selectedSuite && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif font-medium">Publishing Target</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableTargets.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    target === t.id ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5" : ""
                  }`}
                  onClick={() => setTarget(t.id)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-1">{t.label}</h3>
                    <p className="text-xs font-mono text-muted-foreground bg-secondary inline-block px-2 py-0.5 rounded mt-1">
                      {t.size}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Design Theme */}
        {selectedSuite && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif font-medium">Design Theme</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {THEMES.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 ${
                    theme === t.id ? "border-primary ring-1 ring-primary shadow-sm" : ""
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  {t.preview}
                  <CardContent className="p-4 bg-card">
                    <h3 className="font-serif font-semibold text-foreground mb-1">{t.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-8 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue || updateJob.isPending}
            className="px-8 gap-2"
          >
            {updateJob.isPending ? "Saving…" : "Continue to Customization"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sticky compare bar */}
      {compareSet.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-primary text-primary-foreground rounded-full shadow-xl px-6 py-3">
          <span className="text-sm font-medium">
            {compareSet.size} template{compareSet.size > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => setCompareOpen(true)}
          >
            Compare Side by Side
          </Button>
          <button
            onClick={() => setCompareSet(new Set())}
            className="opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(id) => {
          handleTemplateSelect(id);
          setPreviewTemplate(null);
        }}
      />
      <TemplateCompareModal
        templates={compareTemplates}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onUse={(id) => {
          handleTemplateSelect(id);
          setCompareOpen(false);
          setCompareSet(new Set());
        }}
      />
    </AppLayout>
  );
}
