import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, useGetRecentActivity, useListManuscripts } from "@workspace/api-client-react";
import { FileText, Clock, CheckCircle, Plus, Book, FileUp, Mail } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: isActivityLoading } = useGetRecentActivity();
  const { data: manuscripts, isLoading: isManuscriptsLoading } = useListManuscripts();

  return (
    <AppLayout 
      title="Dashboard" 
      actions={
        <div className="flex items-center gap-2">
          <Link href="/letters/new">
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" /> New Letter
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Manuscript
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Manuscripts</CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-serif font-semibold">{summary?.totalManuscripts || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Exports</CardTitle>
              <CheckCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-serif font-semibold">{summary?.completedExports || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-serif font-semibold">{summary?.inProgress || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Manuscripts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Your Manuscripts</CardTitle>
              <CardDescription>Recently uploaded works</CardDescription>
            </CardHeader>
            <CardContent>
              {isManuscriptsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : manuscripts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No manuscripts yet.</p>
                  <Link href="/upload">
                    <Button variant="link" className="mt-2 text-primary">Upload your first one</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {manuscripts?.slice(0, 5).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-primary/5 flex items-center justify-center text-primary">
                          <Book className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(doc.createdAt), "MMM d, yyyy")} • {doc.status}
                          </p>
                        </div>
                      </div>
                      <Link href={`/manuscripts/${doc.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isActivityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activity?.length === 0 ? (
                <p className="text-center py-4 text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-6">
                  {activity?.map(act => (
                    <div key={act.id} className="flex gap-3">
                      <div className="mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{act.description}</p>
                        {act.manuscriptTitle && (
                          <p className="text-xs font-medium mt-0.5 text-primary">{act.manuscriptTitle}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(act.createdAt), "MMM d, h:mm a")}
                        </p>
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