import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useGetAdminStats,
  useGetAdminActivity,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Crown, TrendingUp, UserPlus, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const chartConfig = {
  amount: { label: "Revenue (₦)", color: "hsl(var(--primary))" },
};

export default function AdminDashboardPage() {
  const { data: stats, isPending: statsPending } = useGetAdminStats();
  const { data: activity, isPending: activityPending } = useGetAdminActivity();

  const chartData =
    stats?.monthlyRevenue.map((m) => ({
      month: m.month.slice(5),
      amount: m.amountKobo / 100,
      label: m.month,
    })) ?? [];

  return (
    <AdminLayout title="Overview">
      <div className="space-y-6 max-w-5xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers}
            loading={statsPending}
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Revenue"
            value={stats ? formatNaira(stats.totalRevenuePaidKobo) : undefined}
            loading={statsPending}
          />
          <KpiCard
            icon={Crown}
            label="Active Premium"
            value={stats?.activePremiumSubs}
            loading={statsPending}
          />
          <KpiCard
            icon={FileText}
            label="Manuscripts"
            value={stats?.totalManuscripts}
            loading={statsPending}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Revenue (last 6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              {statsPending ? (
                <Skeleton className="h-40 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data yet
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [`₦${Number(value).toLocaleString("en-NG")}`, "Revenue"]}
                          />
                        }
                      />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsPending ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))
              ) : (
                <>
                  <StatRow label="New signups (30d)" value={stats?.recentSignups ?? 0} />
                  <StatRow label="Total jobs" value={stats?.totalJobs ?? 0} />
                  <StatRow label="Premium subs" value={stats?.activePremiumSubs ?? 0} />
                  <StatRow
                    label="Avg. revenue / user"
                    value={
                      stats && stats.totalUsers > 0
                        ? formatNaira(Math.round(stats.totalRevenuePaidKobo / stats.totalUsers))
                        : "₦0"
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : !activity?.length ? (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground">{item.description}</span>
                      {item.manuscriptTitle && (
                        <span className="text-muted-foreground"> — {item.manuscriptTitle}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value ?? "—"}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
