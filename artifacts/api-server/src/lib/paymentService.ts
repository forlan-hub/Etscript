import { db, transactionsTable, subscriptionsTable } from "@workspace/db";
import type { Transaction } from "@workspace/db";
import { and, desc, eq, ne } from "drizzle-orm";

const DAY_MS = 86_400_000;

function provisionalPeriodEnd(): Date {
  return new Date(Date.now() + 31 * DAY_MS);
}

export async function getTransactionByReference(
  reference: string,
): Promise<Transaction | null> {
  const [txn] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.reference, reference));
  return txn ?? null;
}

/** Idempotent: only transitions a row that is not already `success`. */
export async function markTransactionSuccess(reference: string): Promise<void> {
  await db
    .update(transactionsTable)
    .set({ status: "success", updatedAt: new Date() })
    .where(
      and(
        eq(transactionsTable.reference, reference),
        ne(transactionsTable.status, "success"),
      ),
    );
}

export async function markTransactionFailed(reference: string): Promise<void> {
  await db
    .update(transactionsTable)
    .set({ status: "failed", updatedAt: new Date() })
    .where(
      and(
        eq(transactionsTable.reference, reference),
        eq(transactionsTable.status, "pending"),
      ),
    );
}

interface ActivateOpts {
  customerCode?: string;
  planCode?: string;
  currentPeriodEnd?: Date;
}

/** Upserts a single subscription row per user, keyed by userId. */
export async function activateSubscriptionForUser(
  userId: string,
  opts: ActivateOpts,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .orderBy(desc(subscriptionsTable.createdAt));

  if (existing) {
    await db
      .update(subscriptionsTable)
      .set({
        status: "active",
        provider: "paystack",
        providerCustomerCode: opts.customerCode ?? existing.providerCustomerCode,
        providerPlanCode: opts.planCode ?? existing.providerPlanCode,
        currentPeriodEnd:
          opts.currentPeriodEnd ??
          existing.currentPeriodEnd ??
          provisionalPeriodEnd(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, existing.id));
    return;
  }

  await db.insert(subscriptionsTable).values({
    userId,
    provider: "paystack",
    providerCustomerCode: opts.customerCode ?? null,
    providerPlanCode: opts.planCode ?? null,
    status: "active",
    currentPeriodEnd: opts.currentPeriodEnd ?? provisionalPeriodEnd(),
  });
}

interface EnrichOpts {
  subscriptionCode?: string;
  emailToken?: string;
  currentPeriodEnd?: Date;
}

/** Fills in subscription/email_token (from subscription.create) by customer code. */
export async function enrichSubscriptionByCustomer(
  customerCode: string,
  opts: EnrichOpts,
): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.providerCustomerCode, customerCode))
    .orderBy(desc(subscriptionsTable.createdAt));

  if (!existing) return false;

  await db
    .update(subscriptionsTable)
    .set({
      status: "active",
      providerSubscriptionCode:
        opts.subscriptionCode ?? existing.providerSubscriptionCode,
      providerEmailToken: opts.emailToken ?? existing.providerEmailToken,
      currentPeriodEnd: opts.currentPeriodEnd ?? existing.currentPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionsTable.id, existing.id));
  return true;
}

export async function handleRenewalByCustomer(
  customerCode: string,
  currentPeriodEnd?: Date,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.providerCustomerCode, customerCode))
    .orderBy(desc(subscriptionsTable.createdAt));

  if (!existing) return;

  const base =
    currentPeriodEnd ??
    new Date((existing.currentPeriodEnd?.getTime() ?? Date.now()) + 31 * DAY_MS);

  await db
    .update(subscriptionsTable)
    .set({ status: "active", currentPeriodEnd: base, updatedAt: new Date() })
    .where(eq(subscriptionsTable.id, existing.id));
}

export async function cancelSubscriptionByCode(
  subscriptionCode: string,
): Promise<void> {
  await db
    .update(subscriptionsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptionsTable.providerSubscriptionCode, subscriptionCode));
}
