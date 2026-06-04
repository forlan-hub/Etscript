import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";
import { useGetJob, useGetJobReadiness, useProcessJob } from "@workspace/api-client-react";
import { CheckCircle2, AlertTriangle, FileDown, Loader2, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewPage() {
  const [, params] = useRoute("/preview/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();

  const { data: job, isLoading: isJobLoading, refetch: refetchJob } = useGetJob(jobId, { query: { enabled: !!jobId } });
  const { data: readiness, isLoading: isReadinessLoading } = useGetJobReadiness(jobId, { query: { enabled: !!jobId } });
  
  // Note: assuming useProcessJob exists. If not, this might throw, but per PRD it does.
  const processJob = useProcessJob();

  // Polling mechanism if processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (job?.status === 'processing') {
      interval = setInterval(() => {
        refetchJob();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [job?.status, refetchJob]);

  const handleProcess = async () => {
    await processJob.mutateAsync({ params: { id: jobId } });
    refetchJob();
  };

  if (isJobLoading || isReadinessLoading) {
    return (
      <AppLayout title="Preview & Export">
        <div className="space-y-8"><Skeleton className="h-64 w-full" /></div>
      </AppLayout>
    );
  }

  const isCompleted = job?.status === 'completed';
  const isProcessing = job?.status === 'processing';
  const score = readiness?.score || 0;

  return (
    <AppLayout title="Preview & Export" actions={
      <Button variant="outline" onClick={() => setLocation(`/customize/${jobId}`)} disabled={isProcessing}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
      </Button>
    }>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="bg-secondary/50 border-b border-border">
              <CardTitle className="font-serif">Readiness Score</CardTitle>
              <CardDescription>Automated pre-flight checks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-4xl font-bold ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-destructive'}`}>
                  {score}%
                </div>
                <div className="flex-1">
                  <Progress value={score} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {score >= 90 ? "Excellent. Ready for publication." : score >= 70 ? "Good, but check warnings." : "Requires attention before export."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {readiness?.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    {item.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : item.severity === 'required' ? (
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                    )}
                    <div>
                      <p className={`font-medium ${item.passed ? 'text-foreground' : 'text-foreground'}`}>
                        {item.label}
                      </p>
                      {!item.passed && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.severity === 'required' ? 'Must fix before exporting' : 'Recommendation'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6">
              {isCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600 mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Formatting Complete</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Your publication-ready files are generated and ready to download.</p>
                  <div className="flex flex-col gap-3 pt-2">
                    <Button className="w-full gap-2" variant="default" asChild>
                      <a href={job.outputPdfKey ? `https://example.com/${job.outputPdfKey}` : '#'} target="_blank" rel="noreferrer">
                        <FileDown className="w-4 h-4" /> Download Print PDF
                      </a>
                    </Button>
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <a href={job.outputDocxKey ? `https://example.com/${job.outputDocxKey}` : '#'} target="_blank" rel="noreferrer">
                        <FileDown className="w-4 h-4" /> Download eBook DOCX
                      </a>
                    </Button>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div>
                    <h3 className="font-semibold text-lg">Processing Manuscript</h3>
                    <p className="text-sm text-muted-foreground mt-1">Applying typography, pagination, and layouts...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ready to Generate</h3>
                  <p className="text-sm text-muted-foreground">Once generated, you can download the PDF and DOCX files. This process takes about a minute.</p>
                  <Button 
                    className="w-full h-12 text-base font-medium" 
                    onClick={handleProcess}
                    disabled={score < 70 || processJob.isPending}
                  >
                    {processJob.isPending ? "Starting..." : "Generate Book Files"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="bg-secondary/50 border-b border-border">
              <CardTitle className="font-serif">Sample Output</CardTitle>
              <CardDescription>A preview of how your text flows</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-[#f9f8f6] p-8 md:p-12 min-h-[600px] overflow-auto text-gray-900 border-l border-border/50">
                {job?.previewText ? (
                  <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: job.previewText }} />
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    Preview generated during processing...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}