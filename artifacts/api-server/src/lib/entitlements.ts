import { db, subscriptionsTable, transactionsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import type { Subscription } from "@workspace/db";

export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, userId),
        eq(subscriptionsTable.status, "active"),
      ),
    )
    .orderBy(desc(subscriptionsTable.createdAt));

  if (!sub) return null;
  // An active row whose period has lapsed is treated as expired until the next
  // renewal webhook extends it.
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) {
    return null;
  }
  return sub;
}

export async function isPremium(userId: string): Promise<boolean> {
  return (await getActiveSubscription(userId)) !== null;
}

export async function isJobPaid(userId: string, jobId: number): Promise<boolean> {
  const [txn] = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.jobId, jobId),
        eq(transactionsTable.type, "payg_export"),
        eq(transactionsTable.status, "success"),
      ),
    );
  return !!txn;
}

export interface CleanAccess {
  canDownloadClean: boolean;
  plan: "free" | "premium";
  jobPaid: boolean;
}

export async function getCleanAccess(
  userId: string,
  jobId: number,
): Promise<CleanAccess> {
  const premium = await isPremium(userId);
  const jobPaid = await isJobPaid(userId, jobId);
  return {
    canDownloadClean: premium || jobPaid,
    plan: premium ? "premium" : "free",
    jobPaid,
  };
}
