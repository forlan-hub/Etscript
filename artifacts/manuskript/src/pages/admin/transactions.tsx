import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminTransactions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import type { AdminTransaction } from "@workspace/api-client-react";

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    payg_export: "Pay-As-You-Go Export",
    premium_monthly: "Premium Monthly",
    premium_sub: "Premium Subscription",
  };
  return map[type] ?? type;
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  pending: "secondary",
  failed: "destructive",
  abandoned: "outline",
};

export default function AdminTransactionsPage() {
  const { data: transactions, isPending } = useGetAdminTransactions();

  return (
    <AdminLayout title="Transactions">
      <div className="space-y-4 max-w-5xl">
        {!isPending && (
          <p className="text-sm text-muted-foreground">
            Showing {transactions?.length ?? 0} most recent transactions
          </p>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Reference</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPending
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : !transactions?.length
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No transactions yet
                      </td>
                    </tr>
                  )
                  : transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function TxRow({ tx }: { tx: AdminTransaction }) {
  const badgeVariant = STATUS_BADGE[tx.status] ?? "outline";
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {tx.reference.slice(0, 16)}…
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {tx.userId.slice(0, 10)}…
      </td>
      <td className="px-4 py-3 text-sm">{formatType(tx.type)}</td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">
        {formatNaira(tx.amount)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={badgeVariant} className="capitalize">
          {tx.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground text-xs whitespace-nowrap">
        {new Date(tx.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}
