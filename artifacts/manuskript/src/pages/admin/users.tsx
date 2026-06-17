import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminUsers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import type { AdminUser } from "@workspace/api-client-react";

function formatNaira(kobo: number): string {
  if (kobo === 0) return "—";
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateOpt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return formatDate(iso);
}

const PLAN_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> =
  {
    premium: { label: "Premium", variant: "default" },
    payg: { label: "Pay-As-You-Go", variant: "secondary" },
    free: { label: "Free", variant: "outline" },
  };

type SortKey = "joinedAt" | "manuscriptCount" | "jobCount" | "totalPaidKobo";

export default function AdminUsersPage() {
  const { data: users, isPending } = useGetAdminUsers();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("joinedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = (users ?? [])
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.email?.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q) ||
        u.plan.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av: number | string = a[sortBy] ?? "";
      let bv: number | string = b[sortBy] ?? "";
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const SortLabel = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-left font-medium hover:text-foreground transition-colors"
    >
      {label}
      {sortBy === k && <span className="text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );

  return (
    <AdminLayout title="Users">
      <div className="space-y-4 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or user ID…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isPending && (
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "user" : "users"}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email / ID</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-right font-medium">
                  <SortLabel k="manuscriptCount" label="Manuscripts" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <SortLabel k="jobCount" label="Jobs" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <SortLabel k="totalPaidKobo" label="Revenue" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <SortLabel k="joinedAt" label="Joined" />
                </th>
                <th className="px-4 py-3 text-right font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPending
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No users found
                      </td>
                    </tr>
                  )
                  : filtered.map((u) => <UserRow key={u.userId} user={u} />)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const badge = PLAN_BADGE[user.plan] ?? PLAN_BADGE.free;
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium truncate max-w-xs">{user.email ?? "(no email)"}</p>
          <p className="text-xs text-muted-foreground font-mono">{user.userId.slice(0, 12)}…</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{user.manuscriptCount}</td>
      <td className="px-4 py-3 text-right tabular-nums">{user.jobCount}</td>
      <td className="px-4 py-3 text-right tabular-nums font-medium">
        {formatNaira(user.totalPaidKobo)}
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
        {new Date(user.joinedAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
        {user.lastActivityAt
          ? new Date(user.lastActivityAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })
          : "—"}
      </td>
    </tr>
  );
}
