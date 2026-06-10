import { db, subscriptionsTable, transactionsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import type { Subscription } from "@workspace/db";

/**
 * Returns the user's subscription row when it currently grants premium access.
 * A row grants access when it is `active` (and not past its period) or it has
 * been `cancelled` but the paid period has not yet lapsed (grace until renewal).
 */
export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .orderBy(desc(subscriptionsTable.createdAt));

  if (!sub) return null;

  const now = Date.now();
  const periodActive = !sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() > now;

  if (sub.status === "active" && periodActive) return sub;
  if (
    sub.status === "cancelled" &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd.getTime() > now
  ) {
    return sub;
  }
  return null;
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
