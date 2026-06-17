import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminActivity } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import type { AdminActivityItem } from "@workspace/api-client-react";

const TYPE_COLORS: Record<string, string> = {
  upload: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  export: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  payment: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  format: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "bg-muted text-muted-foreground";
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminActivityPage() {
  const { data: activity, isPending } = useGetAdminActivity();

  return (
    <AdminLayout title="Activity Log">
      <div className="space-y-4 max-w-3xl">
        {!isPending && (
          <p className="text-sm text-muted-foreground">
            Showing {activity?.length ?? 0} most recent entries
          </p>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isPending ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : !activity?.length ? (
            <div className="px-4 py-10 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No activity recorded yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function ActivityRow({ item }: { item: AdminActivityItem }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(item.type)}`}
      >
        {item.type}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{item.description}</p>
        {item.manuscriptTitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {item.manuscriptTitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {item.userId.slice(0, 12)}…
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
        {formatDateTime(item.createdAt)}
      </span>
    </div>
  );
}
