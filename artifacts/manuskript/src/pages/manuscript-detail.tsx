import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import { useGetManuscript, useListJobs, useCreateJob } from "@workspace/api-client-react";
import { Book, FileText, CheckCircle2, Clock, PlayCircle, Settings2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ManuscriptDetailPage() {
  const [, params] = useRoute("/manuscripts/:id");
  const manuscriptId = params?.id ? parseInt(params.id, 10) : 0;

  const { data: manuscript, isLoading: isMsLoading } = useGetManuscript(manuscriptId, { query: { enabled: !!manuscriptId } as any });
  const { data: jobs, isLoading: isJobsLoading } = useListJobs();
  const createJob = useCreateJob();

  // Filter jobs for this manuscript
  const relatedJobs = jobs?.filter(j => j.manuscriptId === manuscriptId) || [];

  const handleCreateNewJob = async () => {
    const job = await createJob.mutateAsync({
      data: { manuscriptId }
    });
    window.location.href = `/format/${job.id}`;
  };

  if (isMsLoading) {
    return <AppLayout><Skeleton className="h-64 w-full" /></AppLayout>;
  }

  if (!manuscript) {
    return <AppLayout><div className="p-8 text-center">Manuscript not found</div></AppLayout>;
  }

  return (
    <AppLayout 
      title={manuscript.title}
      actions={
        <Button onClick={handleCreateNewJob} disabled={createJob.isPending}>
          {createJob.isPending ? "Creating..." : "New Formatting Job"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Original File</p>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm">{manuscript.originalFilename || "Unknown"}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-sm mt-1">{manuscript.fileSize ? `${(manuscript.fileSize / 1024 / 1024).toFixed(2)} MB` : "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Words</p>
                  <p className="text-sm mt-1">{manuscript.wordCount ? manuscript.wordCount.toLocaleString() : "--"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                <p className="text-sm mt-1">{format(new Date(manuscript.createdAt), "MMMM d, yyyy")}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1 bg-secondary text-secondary-foreground">
                  {manuscript.status}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Formatting History</CardTitle>
            </CardHeader>
            <CardContent>
              {isJobsLoading ? (
                <div className="space-y-4"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
              ) : relatedJobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-foreground mb-1">No formats yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first formatting job to prepare this manuscript for publishing.</p>
                  <Button onClick={handleCreateNewJob} variant="outline">Format Manuscript</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(job => (
                    <div key={job.id} className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {job.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                           job.status === 'processing' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                           <Settings2 className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground capitalize">
                              {job.publishingTarget?.replace(/_/g, ' ') || "Draft Format"}
                            </h4>
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                              {job.bookType}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            Theme: {job.theme || "None"} • Font: {job.fontFamily || "Default"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(job.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {job.status === 'draft' && (
                          <Link href={`/format/${job.id}`}>
                            <Button variant="outline" size="sm">Resume Setup</Button>
                          </Link>
                        )}
                        {job.status === 'completed' && (
                          <Link href={`/preview/${job.id}`}>
                            <Button variant="secondary" size="sm" className="gap-2">
                              <Download className="w-4 h-4" /> Files
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}