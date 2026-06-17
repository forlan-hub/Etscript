import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import type { DocumentTemplate, DocumentSuite } from "@/lib/templates";

const SUITE_LABELS: Record<DocumentSuite, string> = {
  publishing: "Publishing",
  academic: "Academic",
  business: "Business & Corporate",
  letters: "Professional Letters",
};

const TARGET_LABELS: Record<string, string> = {
  amazon_kdp_paperback: "KDP (6″×9″)",
  a4_print: "A4 Print",
  ebook: "eBook",
};

const THEME_LABELS: Record<string, string> = {
  classic: "Classic",
  modern: "Modern",
  premium: "Premium",
  corporate: "Corporate",
  academic: "Academic",
};

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-border last:border-0 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right text-foreground">{value}</span>
    </div>
  );
}

interface Props {
  templates: DocumentTemplate[];
  open: boolean;
  onClose: () => void;
  onUse: (templateId: string) => void;
}

export function TemplateCompareModal({ templates, open, onClose, onUse }: Props) {
  if (templates.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Compare Templates</DialogTitle>
        </DialogHeader>

        <div
          className="grid gap-5 mt-4"
          style={{ gridTemplateColumns: `repeat(${templates.length}, 1fr)` }}
        >
          {templates.map((tpl) => (
            <div key={tpl.id} className="flex flex-col gap-4">
              {/* Thumbnail */}
              <div className="flex justify-center">
                <div className="rounded-lg overflow-hidden shadow border border-border/60">
                  <TemplateThumbnail template={tpl} size="md" />
                </div>
              </div>

              {/* Name + badge */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm leading-tight">{tpl.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{SUITE_LABELS[tpl.suite]}</p>
                {tpl.isPremium && (
                  <Badge variant="secondary" className="text-[10px] mt-1">Premium</Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed text-center">{tpl.desc}</p>

              {/* Specs */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-secondary/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Specs
                </div>
                <div className="px-3 py-1">
                  <SpecRow label="Font" value={tpl.defaultFont} />
                  <SpecRow label="Spacing" value={`${tpl.defaultLineSpacing}×`} />
                  <SpecRow label="Target" value={TARGET_LABELS[tpl.defaultTarget] ?? tpl.defaultTarget} />
                  <SpecRow label="Theme" value={THEME_LABELS[tpl.defaultTheme] ?? tpl.defaultTheme} />
                </div>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  onUse(tpl.id);
                  onClose();
                }}
              >
                Use This Template
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
