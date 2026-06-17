import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, GraduationCap, Briefcase, Mail } from "lucide-react";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import type { DocumentTemplate, DocumentSuite } from "@/lib/templates";

const SUITE_ICONS: Record<DocumentSuite, React.ReactNode> = {
  publishing: <BookOpen className="w-3.5 h-3.5" />,
  academic: <GraduationCap className="w-3.5 h-3.5" />,
  business: <Briefcase className="w-3.5 h-3.5" />,
  letters: <Mail className="w-3.5 h-3.5" />,
};

const SUITE_LABELS: Record<DocumentSuite, string> = {
  publishing: "Publishing",
  academic: "Academic",
  business: "Business & Corporate",
  letters: "Professional Letters",
};

function getKeyFeatures(tpl: DocumentTemplate): string[] {
  const base: Record<DocumentSuite, string[]> = {
    publishing: [
      "Chapter detection & auto-numbering",
      "Front matter: title page, TOC, copyright",
      "Headers & footers with page numbers",
      "KDP / A4 / eBook page dimensions",
    ],
    academic: [
      "Front matter: title page, abstract, dedication",
      "Double-spaced body text (institution standard)",
      "Citation-style reference list",
      "Running head & chapter numbering",
      "Footnote & appendix sections",
    ],
    business: [
      "Executive summary section",
      "Numbered sections & subsections",
      "Professional letterhead headers",
      "Table of contents auto-generation",
      "Corporate A4 page layout",
    ],
    letters: [
      "Letterhead with contact details",
      "Structured salutation & closing",
      "Professional signature block",
      "A4 / Letter page format",
    ],
  };
  return base[tpl.suite];
}

function getUseCases(tpl: DocumentTemplate): string[] {
  const specific: Partial<Record<string, string[]>> = {
    novel: ["Fiction & genre novels", "Amazon KDP self-publishing", "Traditional publishing submissions"],
    memoir: ["Personal life stories", "Ghost-written memoirs", "Hybrid publishing"],
    autobiography: ["First-person life narratives", "Public figures", "Legacy publishing"],
    biography: ["Third-person life writing", "Historical figures", "Academic publishing"],
    motivational_book: ["Life coaching content", "Personal development authors", "Speaker tie-in books"],
    self_help_book: ["Actionable guides & frameworks", "Wellness & productivity", "Online course companions"],
    business_book: ["Thought leadership", "Corporate authors", "Business strategy content"],
    christian_book: ["Faith-based non-fiction", "Devotional writing", "Church & ministry publishing"],
    devotional: ["Daily reading books", "Prayer journals", "Church small groups"],
    children_book: ["Children's picture books", "Early reader fiction", "Educational publishers"],
    workbook: ["Training companions", "Workshop materials", "Self-paced learning"],
    journal: ["Reflective writing", "Gratitude journals", "Blank-lined keepsakes"],
    ebook: ["Digital-first titles", "Kindle Direct Publishing", "Online distribution"],
    training_manual_pub: ["Instructional handbooks", "Onboarding materials", "Certification prep"],

    undergraduate_project: ["Final year projects", "HND dissertations", "University submissions"],
    hnd_project: ["Polytechnic submissions", "Professional certification projects"],
    masters_thesis: ["Master's degree submissions", "Post-graduate research"],
    phd_thesis: ["Doctoral degree submissions", "University press publications"],
    dissertation: ["Extended research papers", "Academic arguments"],
    research_paper: ["Conference papers", "Peer-reviewed submissions", "Lab reports"],
    journal_article: ["Academic journal submissions", "Peer-review manuscripts"],
    seminar_paper: ["Seminar presentations", "Academic workshops"],
    conference_paper: ["IEEE, ACM & other conferences", "Symposium proceedings"],

    company_profile: ["B2B marketing", "Investor presentations", "Partnership pitches"],
    business_proposal: ["Client proposals", "Grant applications", "Service bids"],
    business_plan: ["Startup funding", "Bank loan applications", "Investor decks"],
    feasibility_report: ["Project viability studies", "Environmental assessments"],
    annual_report: ["Corporate year-end reports", "NGO annual reports"],
    corporate_training_manual: ["Employee handbooks", "Onboarding guides", "SOPs"],
    policy_document: ["Corporate policies", "Government regulations", "Compliance documents"],
    project_report: ["Consulting deliverables", "Stakeholder reports"],
    white_paper: ["Thought leadership", "Technical deep-dives", "Industry reports"],
    executive_summary: ["C-suite briefs", "Board presentations"],
  };
  return specific[tpl.id] ?? [`${SUITE_LABELS[tpl.suite]} documents`, "Professional submissions"];
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const SPACING_LABELS: Record<string, string> = {
  "1.5": "1.5× (standard)",
  "2.0": "2.0× (double-spaced)",
  "1.0": "Single-spaced",
};

const TARGET_LABELS: Record<string, string> = {
  amazon_kdp_paperback: "Amazon KDP (6″ × 9″)",
  a4_print: "A4 Print",
  ebook: "eBook (reflowable)",
};

interface Props {
  template: DocumentTemplate | null;
  open: boolean;
  onClose: () => void;
  onUse: (templateId: string) => void;
}

export function TemplatePreviewModal({ template, open, onClose, onUse }: Props) {
  if (!template) return null;

  const features = getKeyFeatures(template);
  const useCases = getUseCases(template);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-serif">
            <span className="text-primary">{SUITE_ICONS[template.suite]}</span>
            {template.label}
            {template.isPremium && (
              <Badge variant="secondary" className="text-xs ml-1">Premium</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Left: details */}
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{template.desc}</p>

            <div>
              <h4 className="text-sm font-semibold mb-2">Key Features</h4>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Ideal For</h4>
              <ul className="space-y-1">
                {useCases.map((u) => (
                  <li key={u} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-secondary/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Default Settings
              </div>
              <div className="px-3 py-1">
                <SpecRow label="Suite" value={SUITE_LABELS[template.suite]} />
                <SpecRow label="Body Font" value={template.defaultFont} />
                <SpecRow label="Line Spacing" value={SPACING_LABELS[template.defaultLineSpacing] ?? template.defaultLineSpacing} />
                <SpecRow label="Default Target" value={TARGET_LABELS[template.defaultTarget] ?? template.defaultTarget} />
                <SpecRow label="Design Theme" value={template.defaultTheme.charAt(0).toUpperCase() + template.defaultTheme.slice(1)} />
              </div>
            </div>
          </div>

          {/* Right: page previews */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Page Preview</h4>
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-md overflow-hidden shadow-md border border-border/60">
                  <TemplateThumbnail template={template} size="lg" />
                </div>
                <span className="text-xs text-muted-foreground">Content Page</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-md overflow-hidden shadow-md border border-border/60 opacity-75">
                  <TemplateThumbnail template={template} size="lg" />
                </div>
                <span className="text-xs text-muted-foreground">Continued</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Previews use placeholder layout. Your content will fill these pages.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            onClick={() => {
              onUse(template.id);
              onClose();
            }}
          >
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
