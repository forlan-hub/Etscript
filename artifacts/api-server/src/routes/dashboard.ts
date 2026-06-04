import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { manuscriptsTable, formattingJobsTable, activityLogTable } from "@workspace/db";
import { eq, count, and, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

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

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const activity = await db
    .select()
    .from(activityLogTable)
    .where(eq(activityLogTable.userId, userId))
    .orderBy(desc(activityLogTable.createdAt))
    .limit(10);

  res.json(activity);
});

export default router;
