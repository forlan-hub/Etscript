import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";
import { useGetJob, useUpdateJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { ArrowRight, Settings2, Type, LayoutTemplate } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQueryClient } from "@tanstack/react-query";

export default function CustomizePage() {
  const [, params] = useRoute("/customize/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId } });
  const updateJob = useUpdateJob();
  
  const [fontFamily, setFontFamily] = useState("Garamond");
  const [fontSize, setFontSize] = useState([11]);
  const [lineSpacing, setLineSpacing] = useState("1.5");
  const [marginSize, setMarginSize] = useState("normal");
  const [pageNumberPosition, setPageNumberPosition] = useState("bottom_center");
  const [chapterNumberStyle, setChapterNumberStyle] = useState("arabic");

  const initializedRef = useRef(false);

  useEffect(() => {
    if (job && !initializedRef.current) {
      if (job.fontFamily) setFontFamily(job.fontFamily);
      if (job.fontSize) setFontSize([job.fontSize]);
      if (job.lineSpacing) setLineSpacing(job.lineSpacing);
      if (job.marginSize) setMarginSize(job.marginSize);
      if (job.pageNumberPosition) setPageNumberPosition(job.pageNumberPosition);
      if (job.chapterNumberStyle) setChapterNumberStyle(job.chapterNumberStyle);
      initializedRef.current = true;
    }
  }, [job]);

  const handleContinue = async () => {
    await updateJob.mutateAsync({
      id: jobId,
      data: {
        fontFamily,
        fontSize: fontSize[0],
        lineSpacing,
        marginSize,
        pageNumberPosition,
        chapterNumberStyle
      }
    });

    setLocation(`/preview/${jobId}`);
  };

  // Simple auto-save on blur or when changing selects
  const autoSave = (updates: any) => {
    updateJob.mutate({ id: jobId, data: updates }, {
      onSuccess: (updatedJob) => {
        queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => 
          old ? { ...old, ...updatedJob } : old
        );
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="Customize Typography">
        <div className="space-y-8"><Skeleton className="h-64 w-full" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Customize Typography">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs">1</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
              <span className="font-medium text-foreground text-sm">Customize</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs">3</div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={fontFamily} 
                  onValueChange={(v) => { setFontFamily(v); autoSave({ fontFamily: v }); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Garamond">Garamond</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Palatino">Palatino</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Font Size</Label>
                  <span className="text-xs text-muted-foreground">{fontSize[0]}pt</span>
                </div>
                <Slider 
                  min={10} max={18} step={0.5} 
                  value={fontSize} 
                  onValueChange={setFontSize}
                  onValueCommit={(v) => autoSave({ fontSize: v[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label>Line Spacing</Label>
                <Select 
                  value={lineSpacing} 
                  onValueChange={(v) => { setLineSpacing(v); autoSave({ lineSpacing: v }); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spacing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">Single</SelectItem>
                    <SelectItem value="1.15">1.15</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2.0">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-primary" /> Layout & Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Margins</Label>
                <Select 
                  value={marginSize} 
                  onValueChange={(v) => { setMarginSize(v); autoSave({ marginSize: v }); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select margins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Narrow (0.5")</SelectItem>
                    <SelectItem value="normal">Normal (1")</SelectItem>
                    <SelectItem value="wide">Wide (1.5")</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Chapter Number Style</Label>
                <RadioGroup 
                  value={chapterNumberStyle} 
                  onValueChange={(v) => { setChapterNumberStyle(v); autoSave({ chapterNumberStyle: v }); }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div>
                    <RadioGroupItem value="arabic" id="r-arabic" className="peer sr-only" />
                    <Label htmlFor="r-arabic" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      1, 2, 3
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="roman" id="r-roman" className="peer sr-only" />
                    <Label htmlFor="r-roman" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      I, II, III
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="words" id="r-words" className="peer sr-only" />
                    <Label htmlFor="r-words" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      One, Two
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="none" id="r-none" className="peer sr-only" />
                    <Label htmlFor="r-none" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      None
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleContinue} 
            className="w-full gap-2 h-12 text-base"
          >
            Review & Export <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-8">
          <Card className="h-full bg-secondary/30 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              {/* Mock Book Page */}
              <div 
                className="bg-white shadow-md border border-border/50 transition-all duration-300 relative"
                style={{
                  width: '400px',
                  height: '600px',
                  padding: marginSize === 'narrow' ? '24px' : marginSize === 'wide' ? '64px' : '48px',
                  fontFamily: fontFamily === 'Times New Roman' ? '"Times New Roman", Times, serif' :
                              fontFamily === 'Garamond' ? 'Garamond, serif' :
                              fontFamily === 'Georgia' ? 'Georgia, serif' :
                              fontFamily === 'Palatino' ? '"Palatino Linotype", "Book Antiqua", Palatino, serif' :
                              fontFamily === 'Arial' ? 'Arial, Helvetica, sans-serif' :
                              'Helvetica, Arial, sans-serif',
                  fontSize: `${fontSize[0]}px`,
                  lineHeight: lineSpacing
                }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    {chapterNumberStyle === 'arabic' ? 'Chapter 1' :
                     chapterNumberStyle === 'roman' ? 'Chapter I' :
                     chapterNumberStyle === 'words' ? 'Chapter One' : ''}
                  </h2>
                  <h3 className="text-xl italic text-gray-800">The Beginning</h3>
                </div>
                
                <p className="indent-8 mb-4 text-justify text-gray-900">
                  It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.
                </p>
                <p className="indent-8 mb-4 text-justify text-gray-900">
                  The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.
                </p>
                
                {/* Page Number */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
                  1
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}