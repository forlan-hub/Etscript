import { Router } from "express";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { manuscriptsTable, formattingJobsTable, activityLogTable } from "@workspace/db";
import { eq, count, and, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const [totalResult] = await db
    .select({ total: count() })
    .from(manuscriptsTable)
    .where(eq(manuscriptsTable.userId, userId));

  const [completedResult] = await db
    .select({ total: count() })
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(manuscriptsTable.userId, userId),
        eq(formattingJobsTable.status, "completed"),
      ),
    );

  const [inProgressResult] = await db
    .select({ total: count() })
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(manuscriptsTable.userId, userId),
        eq(formattingJobsTable.status, "draft"),
      ),
    );

  res.json({
    totalManuscripts: totalResult?.total ?? 0,
    completedExports: completedResult?.total ?? 0,
    inProgress: inProgressResult?.total ?? 0,
    planName: "Free",
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const activity = await db
    .select()
    .from(activityLogTable)
    .where(eq(activityLogTable.userId, userId))
    .orderBy(desc(activityLogTable.createdAt))
    .limit(10);

  res.json(activity);
});

export default router;
