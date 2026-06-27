import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { supabaseAdmin } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import {
  manuscriptsTable,
  formattingJobsTable,
  subscriptionsTable,
  transactionsTable,
  activityLogTable,
  plansTable,
  insertPlanSchema,
} from "@workspace/db";
import { eq, desc, count, sum, and, sql, gte, asc } from "drizzle-orm";

const router = Router();

// GET /admin/check — quick admin probe used by the frontend
router.get("/admin/check", requireAdmin, (_req, res): void => {
  res.json({ isAdmin: true });
});

// GET /admin/stats — platform-wide aggregates
router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    [msRow],
    [jobRow],
    revenueRow,
    [subRow],
    monthlyRevenue,
    { data: usersData },
  ] = await Promise.all([
    db.select({ count: count() }).from(manuscriptsTable),
    db.select({ count: count() }).from(formattingJobsTable),
    db
      .select({ total: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(eq(transactionsTable.status, "success")),
    db
      .select({ count: count() })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.status, "active"),
          sql`(${subscriptionsTable.currentPeriodEnd} IS NULL OR ${subscriptionsTable.currentPeriodEnd} > NOW())`,
        ),
      ),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${transactionsTable.createdAt}), 'YYYY-MM')`,
        amountKobo: sum(transactionsTable.amount),
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.status, "success"),
          gte(transactionsTable.createdAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactionsTable.createdAt})`)
      .orderBy(sql`date_trunc('month', ${transactionsTable.createdAt})`),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000, page: 1 }),
  ]);

  const allUsers = (usersData?.users ?? []) as Array<{ id: string; created_at: string }>;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSignups = allUsers.filter(
    (u) => new Date(u.created_at) >= thirtyDaysAgo,
  ).length;

  res.json({
    totalUsers: allUsers.length,
    totalManuscripts: msRow?.count ?? 0,
    totalJobs: jobRow?.count ?? 0,
    activePremiumSubs: subRow?.count ?? 0,
    totalRevenuePaidKobo: Number(revenueRow[0]?.total ?? 0),
    recentSignups,
    monthlyRevenue: monthlyRevenue.map((r) => ({
      month: r.month,
      amountKobo: Number(r.amountKobo ?? 0),
    })),
  });
});

// GET /admin/users — per-user rollup
router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const [
    msCounts,
    jobCounts,
    revenueCounts,
    allSubs,
    paygUsers,
    lastActivities,
    { data: usersData },
  ] = await Promise.all([
    db
      .select({ userId: manuscriptsTable.userId, cnt: count() })
      .from(manuscriptsTable)
      .groupBy(manuscriptsTable.userId),
    db
      .select({ userId: manuscriptsTable.userId, cnt: count() })
      .from(formattingJobsTable)
      .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
      .groupBy(manuscriptsTable.userId),
    db
      .select({ userId: transactionsTable.userId, total: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(eq(transactionsTable.status, "success"))
      .groupBy(transactionsTable.userId),
    db
      .select()
      .from(subscriptionsTable)
      .orderBy(desc(subscriptionsTable.createdAt)),
    db
      .select({ userId: transactionsTable.userId })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.type, "payg_export"),
          eq(transactionsTable.status, "success"),
        ),
      )
      .groupBy(transactionsTable.userId),
    db
      .select({
        userId: activityLogTable.userId,
        lastAt: sql<string>`MAX(${activityLogTable.createdAt})`,
      })
      .from(activityLogTable)
      .groupBy(activityLogTable.userId),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000, page: 1 }),
  ]);

  const now = Date.now();
  const activeSubs = new Set(
    allSubs
      .filter((s) => {
        if (s.status === "active") {
          return !s.currentPeriodEnd || s.currentPeriodEnd.getTime() > now;
        }
        if (s.status === "cancelled") {
          return s.currentPeriodEnd != null && s.currentPeriodEnd.getTime() > now;
        }
        return false;
      })
      .map((s) => s.userId),
  );
  const paygSet = new Set(paygUsers.map((p) => p.userId));

  const msMap = new Map(msCounts.map((r) => [r.userId, r.cnt]));
  const jobMap = new Map(jobCounts.map((r) => [r.userId, r.cnt]));
  const revMap = new Map(revenueCounts.map((r) => [r.userId, Number(r.total ?? 0)]));
  const actMap = new Map(lastActivities.map((r) => [r.userId, r.lastAt]));

  type SupabaseUser = { id: string; email?: string; created_at: string };
  const users = ((usersData?.users ?? []) as SupabaseUser[]).map((u) => ({
    userId: u.id,
    email: u.email ?? null,
    joinedAt: u.created_at,
    plan: activeSubs.has(u.id) ? "premium" : paygSet.has(u.id) ? "payg" : "free",
    manuscriptCount: msMap.get(u.id) ?? 0,
    jobCount: jobMap.get(u.id) ?? 0,
    totalPaidKobo: revMap.get(u.id) ?? 0,
    lastActivityAt: actMap.get(u.id) ?? null,
  }));

  res.json(users);
});

// GET /admin/transactions — recent 50 transactions
router.get("/admin/transactions", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(50);
  res.json(rows);
});

// GET /admin/activity — recent 60 activity log entries across all users
router.get("/admin/activity", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityLogTable)
    .orderBy(desc(activityLogTable.createdAt))
    .limit(60);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// Plans CRUD (admin)
// ---------------------------------------------------------------------------

// GET /admin/plans — all plans including inactive
router.get("/admin/plans", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(plansTable)
    .orderBy(asc(plansTable.sortOrder), asc(plansTable.id));
  res.json(rows);
});

// POST /admin/plans — create a new plan
router.post("/admin/plans", requireAdmin, async (req, res): Promise<void> => {
  const parsed = insertPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(plansTable).values(parsed.data).returning();
  res.status(201).json(row);
});

const updatePlanSchema = insertPlanSchema.partial();

// PATCH /admin/plans/:planId — update a plan
router.patch("/admin/plans/:planId", requireAdmin, async (req, res): Promise<void> => {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId) || planId <= 0) {
    res.status(400).json({ error: "Invalid planId" });
    return;
  }
  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(plansTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(plansTable.id, planId))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json(row);
});

// DELETE /admin/plans/:planId — delete a plan
router.delete("/admin/plans/:planId", requireAdmin, async (req, res): Promise<void> => {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId) || planId <= 0) {
    res.status(400).json({ error: "Invalid planId" });
    return;
  }
  const [row] = await db
    .delete(plansTable)
    .where(eq(plansTable.id, planId))
    .returning({ id: plansTable.id });
  if (!row) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
