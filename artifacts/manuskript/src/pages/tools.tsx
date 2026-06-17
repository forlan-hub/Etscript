import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, BookMarked, Layers, ArrowRight, Lock } from "lucide-react";

const TOOLS = [
  {
    href: "/tools/citation",
    icon: <Quote className="w-6 h-6" />,
    title: "Citation Builder",
    desc: "Generate perfectly formatted references in APA 7th, MLA 9th, Harvard, Chicago 17th, or IEEE. Build your reference list one entry at a time.",
    badge: null,
    free: true,
  },
  {
    href: "/tools/isbn",
    icon: <BookMarked className="w-6 h-6" />,
    title: "ISBN Preparation Tool",
    desc: "Fill in your book's metadata and get a print-ready ISBN application data sheet — ready to submit to your national ISBN agency.",
    badge: null,
    free: true,
  },
  {
    href: "/tools/my-templates",
    icon: <Layers className="w-6 h-6" />,
    title: "My Templates",
    desc: "Save your preferred formatting settings as named templates. Reuse them across documents instead of configuring each job from scratch.",
    badge: "Premium",
    free: false,
  },
];

export default function ToolsPage() {
  return (
    <AppLayout title="Tools">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-medium">Tools</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Standalone tools to help you prepare, format, and publish your work.
          </p>
        </div>

        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary mt-0.5 shrink-0">{tool.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-foreground">{tool.title}</h2>
                        {tool.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                            <Lock className="w-2.5 h-2.5" />{tool.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
