import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import {
  useCreateManuscript,
  useCreateJob,
  useGetUploadUrl,
  useGetStorageLimits,
  useListManuscripts,
  useDeleteManuscript,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { UploadCloud, File, AlertCircle, CheckCircle2, HardDrive, BookOpen, ArrowRight, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowStepper } from "@/components/workflow-stepper";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  payg: "Pay-As-You-Go",
  premium: "Premium",
};

type ManuscriptItem = { id: number; title: string };

function StorageUsageBar({ plan, usedManuscripts, maxManuscripts, usedStorageBytes, maxStorageBytes, manuscripts, onDelete }: {
  plan: string;
  usedManuscripts: number;
  maxManuscripts: number;
  usedStorageBytes: number;
  maxStorageBytes: number;
  manuscripts: ManuscriptItem[];
  onDelete: (id: number) => void;
}) {
  const [showManuscripts, setShowManuscripts] = useState(false);
  const msPercent = Math.min(100, (usedManuscripts / maxManuscripts) * 100);
  const storagePercent = Math.min(100, (usedStorageBytes / maxStorageBytes) * 100);
  const atManuscriptLimit = usedManuscripts >= maxManuscripts;
  const overLimit = usedManuscripts > maxManuscripts;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          Storage &amp; limits
        </div>
        <Badge variant={plan === "premium" ? "default" : "secondary"} className="text-xs">
          {PLAN_LABELS[plan] ?? plan}
        </Badge>
      </div>

      {/* Manuscript slots */}
      <div className="rounded-md border border-border bg-background px-3 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            Manuscript slots
          </span>
          <span className={atManuscriptLimit ? "text-destructive font-semibold" : "text-muted-foreground"}>
            {usedManuscripts} / {maxManuscripts} slots{overLimit ? " — over limit" : ""}
          </span>
        </div>
        <Progress
          value={msPercent}
          className={`h-1.5 ${atManuscriptLimit ? "[&>div]:bg-destructive" : ""}`}
        />
      </div>

      {/* Storage space — separate visual block */}
      <div className="rounded-md border border-border bg-background px-3 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <HardDrive className="w-3 h-3" />
            Storage space
          </span>
          <span className="text-muted-foreground">
            {formatBytes(usedStorageBytes)} / {formatBytes(maxStorageBytes)} used
          </span>
        </div>
        <Progress value={storagePercent} className="h-1.5" />
      </div>

      {atManuscriptLimit && (
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-destructive font-medium">
              Slot limit reached — delete a manuscript to upload a new one, or upgrade your plan.
            </p>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-3 shrink-0">
                Upgrade <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs border border-dashed border-border gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setShowManuscripts((v) => !v)}
          >
            {showManuscripts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showManuscripts ? "Hide" : "Show"} manuscripts to delete
          </Button>
          {showManuscripts && (
            <div className="rounded-md border border-border bg-background divide-y divide-border overflow-hidden">
              {manuscripts.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-3">No manuscripts found.</p>
              ) : (
                manuscripts.map((ms) => (
                  <div key={ms.id} className="flex items-center justify-between px-3 py-2 gap-3">
                    <span className="text-xs text-foreground truncate">{ms.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => onDelete(ms.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="ml-1 text-xs">Delete</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<"idle" | "creating" | "uploading" | "done">("idle");

  const queryClient = useQueryClient();
  const createManuscript = useCreateManuscript();
  const getUploadUrl = useGetUploadUrl();
  const createJob = useCreateJob();
  const { data: storageLimits } = useGetStorageLimits();
  const { data: manuscripts } = useListManuscripts();
  const deleteManuscript = useDeleteManuscript();

  const handleDeleteManuscript = async (id: number) => {
    try {
      await deleteManuscript.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage/limits"] });
      toast({ title: "Manuscript deleted", description: "Slot freed up — you can upload a new one." });
    } catch {
      toast({ title: "Delete failed", description: "Could not delete the manuscript. Please try again.", variant: "destructive" });
    }
  };

  const atManuscriptLimit =
    storageLimits != null && storageLimits.usedManuscripts >= storageLimits.maxManuscripts;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      } else {
        toast({ title: "Invalid file type", description: "Please upload a .docx, .txt, or .pdf file", variant: "destructive" });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const isValidFile = (f: File) => f.name.endsWith(".docx") || f.name.endsWith(".txt") || f.name.endsWith(".pdf");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast({ title: "Missing fields", description: "Please provide a title and select a file.", variant: "destructive" });
      return;
    }

    try {
      setStep("creating");
      setUploadProgress(10);

      const manuscript = await createManuscript.mutateAsync({ data: { title, originalFilename: file.name } });
      setUploadProgress(25);

      const uploadInfo = await getUploadUrl.mutateAsync({
        id: manuscript.id,
        data: {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        },
      });
      setUploadProgress(35);

      setStep("uploading");

      const response = await fetch(uploadInfo.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }
      setUploadProgress(75);

      const job = await createJob.mutateAsync({ data: { manuscriptId: manuscript.id } });
      setUploadProgress(100);
      setStep("done");

      await new Promise((r) => setTimeout(r, 500));
      setLocation(`/format/${job.id}`);
    } catch (error: unknown) {
      setStep("idle");
      setUploadProgress(0);

      let description = "There was an error uploading your manuscript.";
      if (error && typeof error === "object" && "response" in error) {
        const resp = error as { response?: { data?: { error?: string } } };
        if (resp.response?.data?.error) {
          description = resp.response.data.error;
        }
      }
      toast({ title: "Upload failed", description, variant: "destructive" });
    }
  };

  const isLoading = step !== "idle";

  return (
    <AppLayout title="New Manuscript">
      <div className="max-w-2xl mx-auto space-y-5">
        <WorkflowStepper currentStep={1} />

        {storageLimits && (
          <StorageUsageBar
            plan={storageLimits.plan}
            usedManuscripts={storageLimits.usedManuscripts}
            maxManuscripts={storageLimits.maxManuscripts}
            usedStorageBytes={storageLimits.usedStorageBytes}
            maxStorageBytes={storageLimits.maxStorageBytes}
            manuscripts={manuscripts ?? []}
            onDelete={handleDeleteManuscript}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Upload Manuscript</CardTitle>
            <CardDescription>We accept Microsoft Word (.docx), plain text (.txt), and PDF (.pdf) files up to 50 MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Manuscript Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Great Adventure"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Manuscript File</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <File className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isLoading}>
                        Change file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Drag and drop your file here, or</p>
                        <p className="text-xs text-muted-foreground mt-1">DOCX, TXT, or PDF files up to 50 MB</p>
                      </div>
                      <Input id="file" type="file" accept=".docx,.txt,.pdf" className="hidden" onChange={handleFileChange} />
                      <Label
                        htmlFor="file"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                      >
                        Browse Files
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {step === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                    )}
                    <span>
                      {step === "creating" && "Creating manuscript record…"}
                      {step === "uploading" && "Uploading file to storage…"}
                      {step === "done" && "Done! Redirecting…"}
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !file || !title.trim() || atManuscriptLimit}
                  className="px-8"
                >
                  {isLoading ? "Processing…" : "Continue to Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
