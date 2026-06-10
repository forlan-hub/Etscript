import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";
import {
  useGetJob,
  useGetJobReadiness,
  useProcessJob,
  useGetExportAccess,
  useCreateCheckout,
} from "@workspace/api-client-react";
import { CheckCircle2, AlertTriangle, FileDown, Loader2, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

export default function PreviewPage() {
  const [, params] = useRoute("/preview/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();
  const { session } = useAuth();

  const { toast } = useToast();
  const { data: job, isLoading: isJobLoading, refetch: refetchJob } = useGetJob(jobId, { query: { enabled: !!jobId } as any });
  const { data: readiness, isLoading: isReadinessLoading } = useGetJobReadiness(jobId, { query: { enabled: !!jobId } as any });
  const { data: exportAccess } = useGetExportAccess(jobId, { query: { enabled: !!jobId } as any });
  const processJob = useProcessJob();
  const checkout = useCreateCheckout();

  const canClean = exportAccess?.canDownloadClean ?? false;

  const startCheckout = async (type: "payg_export" | "premium_subscription") => {
    try {
      const res = await checkout.mutateAsync({
        data: { type, jobId: type === "payg_export" ? jobId : null },
      });
      window.location.href = res.authorizationUrl;
    } catch {
      toast({
        title: "Could not start checkout",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (job?.status === "processing") {
      interval = setInterval(() => { refetchJob(); }, 2000);
    }
    return () => clearInterval(interval);
  }, [job?.status, refetchJob]);

  const handleProcess = async () => {
    await processJob.mutateAsync({ id: jobId });
    refetchJob();
  };

  const downloadUrl = (format: "pdf" | "docx") => `/api/jobs/${jobId}/download/${format}`;

  const handleDownload = async (format: "pdf" | "docx") => {
    const token = session?.access_token;
    const res = await fetch(downloadUrl(format), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      toast({
        title: "Download failed",
        description:
          res.status === 404
            ? "The uploaded file is no longer available. Please re-upload your manuscript."
            : "Please try processing the job again.",
        variant: "destructive",
      });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job?.manuscript?.title ?? "manuscript"}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isJobLoading || isReadinessLoading) {
    return (
      <AppLayout title="Preview & Export">
        <div className="space-y-8"><Skeleton className="h-64 w-full" /></div>
      </AppLayout>
    );
  }

  const isCompleted = job?.status === "completed";
  const isProcessing = job?.status === "processing";
  const score = readiness?.score || 0;

  return (
    <AppLayout
      title="Preview & Export"
      actions={
        <Button variant="outline" onClick={() => setLocation(`/customize/${jobId}`)} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="bg-secondary/50 border-b border-border">
              <CardTitle className="font-serif">Readiness Score</CardTitle>
              <CardDescription>Automated pre-flight checks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-4xl font-bold ${score >= 90 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-destructive"}`}>
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
                    ) : item.severity === "required" ? (
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {!item.passed && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.severity === "required" ? "Must fix before exporting" : "Recommendation"}
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

                  {canClean ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {exportAccess?.plan === "premium"
                          ? "Premium plan active — clean, watermark-free exports unlocked."
                          : "This book is unlocked — your clean, watermark-free files are ready."}
                      </p>
                      <div className="flex flex-col gap-3 pt-2">
                        <Button className="w-full gap-2" onClick={() => handleDownload("pdf")}>
                          <FileDown className="w-4 h-4" /> Download Print PDF
                        </Button>
                        <Button className="w-full gap-2" variant="outline" onClick={() => handleDownload("docx")}>
                          <FileDown className="w-4 h-4" /> Download eBook DOCX
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                        Free downloads include an Etscript watermark. Unlock this book once, or go
                        Premium for unlimited clean exports.
                      </div>
                      <div className="flex flex-col gap-3 pt-1">
                        <Button className="w-full gap-2" variant="outline" onClick={() => handleDownload("pdf")}>
                          <FileDown className="w-4 h-4" /> Download watermarked PDF
                        </Button>
                        <Button className="w-full gap-2" variant="outline" onClick={() => handleDownload("docx")}>
                          <FileDown className="w-4 h-4" /> Download watermarked DOCX
                        </Button>
                      </div>
                      <div className="border-t border-border pt-4 space-y-3">
                        <Button
                          className="w-full gap-2"
                          onClick={() => startCheckout("payg_export")}
                          disabled={checkout.isPending}
                        >
                          {checkout.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          Unlock this book — ₦2,500
                        </Button>
                        <Button
                          className="w-full gap-2"
                          variant="secondary"
                          onClick={() => startCheckout("premium_subscription")}
                          disabled={checkout.isPending}
                        >
                          <Sparkles className="w-4 h-4" /> Go Premium — ₦5,000/mo
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          One-time unlock for this book, or unlimited exports with Premium.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div>
                    <h3 className="font-semibold text-lg">Processing Manuscript</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applying typography, pagination, and layouts…
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ready to Generate</h3>
                  <p className="text-sm text-muted-foreground">
                    Once generated, you can download your formatted PDF and DOCX files.
                    {!job?.manuscript?.fileKey && (
                      <span className="block mt-1 text-yellow-600">
                        No file uploaded — sample formatting will be used for the preview.
                      </span>
                    )}
                  </p>
                  <Button
                    className="w-full h-12 text-base font-medium"
                    onClick={handleProcess}
                    disabled={processJob.isPending}
                  >
                    {processJob.isPending ? "Generating…" : "Generate Book Files"}
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
              <CardDescription>A preview of how your text flows with the selected settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-[#f9f8f6] p-8 md:p-12 min-h-[600px] overflow-auto text-gray-900 border-l border-border/50">
                {job?.previewText ? (
                  <div
                    className="prose prose-stone max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.previewText }}
                  />
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="text-sm">Preview will appear here after processing.</p>
                    <p className="text-xs mt-2 text-muted-foreground/60">
                      Click "Generate Book Files" to format your manuscript.
                    </p>
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
