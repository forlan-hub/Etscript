import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";
import { useGetJob, useUpdateJob } from "@workspace/api-client-react";
import { BookType, Layout, Palette, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BOOK_TYPES = [
  { id: "novel", label: "Novel", desc: "Standard fiction layouts" },
  { id: "memoir", label: "Memoir", desc: "Elegant, personal styling" },
  { id: "business", label: "Business", desc: "Clean, authoritative" },
  { id: "academic", label: "Academic", desc: "Rigorous, structured" }
];

const TARGETS = [
  { id: "amazon_kdp_paperback", label: "Amazon KDP (Paperback)", size: "6\" x 9\"" },
  { id: "ebook", label: "eBook (EPUB/MOBI)", size: "Reflowable" },
  { id: "a4_print", label: "A4 Print", size: "8.27\" x 11.69\"" }
];

const THEMES = [
  { id: "classic", label: "Classic", preview: "Times New Roman, traditional margins, serif elegance." },
  { id: "modern", label: "Modern", preview: "Clean sans-serif headings, generous whitespace." },
  { id: "premium", label: "Premium", preview: "Garamond, drop caps, ornate chapter headers." }
];

export default function FormatPage() {
  const [, params] = useRoute("/format/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();

  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId } as any });
  const updateJob = useUpdateJob();
  
  const [bookType, setBookType] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [theme, setTheme] = useState<string>("");

  const initializedRef = useRef(false);

  useEffect(() => {
    if (job && !initializedRef.current) {
      if (job.bookType) setBookType(job.bookType);
      if (job.publishingTarget) setTarget(job.publishingTarget);
      if (job.theme) setTheme(job.theme);
      initializedRef.current = true;
    }
  }, [job]);

  const handleContinue = async () => {
    if (!bookType || !target || !theme) return;
    
    await updateJob.mutateAsync({
      id: jobId,
      data: {
        bookType,
        publishingTarget: target,
        theme
      }
    });

    setLocation(`/customize/${jobId}`);
  };

  if (isLoading) {
    return (
      <AppLayout title="Format Setup">
        <div className="space-y-8"><Skeleton className="h-64 w-full" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Format Setup">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Progress steps could go here */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
            <span className="font-medium text-foreground">Basic Setup</span>
          </div>
          <div className="h-px bg-border flex-1 mx-4" />
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-sm">2</div>
            <span className="font-medium">Customize</span>
          </div>
          <div className="h-px bg-border flex-1 mx-4" />
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-medium">Preview & Export</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookType className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-medium">Book Type</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BOOK_TYPES.map(t => (
              <Card 
                key={t.id} 
                className={`cursor-pointer transition-all hover:border-primary/50 ${bookType === t.id ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' : ''}`}
                onClick={() => setBookType(t.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-1">{t.label}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-medium">Publishing Target</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TARGETS.map(t => (
              <Card 
                key={t.id} 
                className={`cursor-pointer transition-all hover:border-primary/50 ${target === t.id ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' : ''}`}
                onClick={() => setTarget(t.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-1">{t.label}</h3>
                  <p className="text-xs font-mono text-muted-foreground bg-secondary inline-block px-2 py-0.5 rounded mt-1">{t.size}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-medium">Design Theme</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classic */}
            <Card
              className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 ${theme === 'classic' ? 'border-primary ring-1 ring-primary shadow-sm' : ''}`}
              onClick={() => setTheme('classic')}
            >
              <div className="h-40 bg-[#faf9f7] p-4 flex items-center justify-center border-b border-border">
                <div className="bg-white w-28 h-36 shadow border border-gray-100 p-3 font-serif">
                  <div className="text-center font-bold text-[8px] mb-2 tracking-wide">Chapter One</div>
                  <div className="h-px bg-gray-100 mb-2" />
                  <div className="space-y-1">
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-11/12 rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-10/12 rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-9/12 rounded-sm"></div>
                  </div>
                  <div className="text-center text-[6px] text-gray-400 mt-3">1</div>
                </div>
              </div>
              <CardContent className="p-4 bg-card">
                <h3 className="font-serif font-semibold text-foreground mb-1">Classic</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Traditional serif typography, centered chapter titles, justified body text.</p>
              </CardContent>
            </Card>

            {/* Modern */}
            <Card
              className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 ${theme === 'modern' ? 'border-primary ring-1 ring-primary shadow-sm' : ''}`}
              onClick={() => setTheme('modern')}
            >
              <div className="h-40 bg-[#f4f6f8] p-4 flex items-center justify-center border-b border-border">
                <div className="bg-white w-28 h-36 shadow border border-gray-100 p-3 font-sans">
                  <div className="font-bold text-[8px] mb-1 tracking-widest uppercase text-gray-700">Chapter 1</div>
                  <div className="h-px bg-gray-300 w-3/5 mb-2" />
                  <div className="space-y-1">
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-10/12 rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-11/12 rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-gray-200 h-[3px] w-8/12 rounded-sm"></div>
                  </div>
                  <div className="text-right text-[6px] text-gray-400 mt-3">1</div>
                </div>
              </div>
              <CardContent className="p-4 bg-card">
                <h3 className="font-sans font-semibold text-foreground mb-1">Modern</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Clean sans-serif headings, rule divider below chapter titles, generous whitespace.</p>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card
              className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 ${theme === 'premium' ? 'border-primary ring-1 ring-primary shadow-sm' : ''}`}
              onClick={() => setTheme('premium')}
            >
              <div className="h-40 bg-[#fdf8f2] p-4 flex items-center justify-center border-b border-border">
                <div className="bg-white w-28 h-36 shadow border border-amber-50 p-3 font-serif">
                  <div className="text-center font-bold text-[9px] mb-1 tracking-wide">Chapter One</div>
                  <div className="text-center text-[7px] text-amber-400 mb-2">✦</div>
                  <div className="space-y-1">
                    <div className="bg-amber-100 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-amber-100 h-[3px] w-11/12 rounded-sm"></div>
                    <div className="bg-amber-100 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-amber-100 h-[3px] w-10/12 rounded-sm"></div>
                    <div className="bg-amber-100 h-[3px] w-full rounded-sm"></div>
                    <div className="bg-amber-100 h-[3px] w-9/12 rounded-sm"></div>
                  </div>
                  <div className="text-center text-[6px] text-amber-300 mt-3">1</div>
                </div>
              </div>
              <CardContent className="p-4 bg-card">
                <h3 className="font-serif font-semibold text-foreground mb-1">Premium</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Garamond-style elegance, ornate chapter ornaments, larger chapter headings.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-border">
          <Button 
            onClick={handleContinue} 
            disabled={!bookType || !target || !theme || updateJob.isPending}
            className="px-8 gap-2"
          >
            {updateJob.isPending ? "Saving..." : "Continue to Customization"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}