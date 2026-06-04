import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  formattingJobsTable,
  manuscriptsTable,
  activityLogTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  ProcessJobParams,
  GetJobReadinessParams,
} from "@workspace/api-zod";

const router = Router();

function buildJobWithManuscript(job: typeof formattingJobsTable.$inferSelect, manuscript: typeof manuscriptsTable.$inferSelect) {
  return { ...job, manuscript };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const jobs = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(eq(manuscriptsTable.userId, userId))
    .orderBy(desc(formattingJobsTable.createdAt));

  res.json(jobs.map((r) => buildJobWithManuscript(r.formatting_jobs, r.manuscripts)));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [manuscript] = await db
    .select()
    .from(manuscriptsTable)
    .where(
      and(
        eq(manuscriptsTable.id, parsed.data.manuscriptId),
        eq(manuscriptsTable.userId, userId),
      ),
    );
  if (!manuscript) {
    res.status(404).json({ error: "Manuscript not found" });
    return;
  }

  const [job] = await db
    .insert(formattingJobsTable)
    .values({
      manuscriptId: parsed.data.manuscriptId,
      bookType: parsed.data.bookType,
      publishingTarget: parsed.data.publishingTarget,
      theme: parsed.data.theme,
      status: "draft",
    })
    .returning();

  await db.insert(activityLogTable).values({
    userId,
    type: "job_started",
    description: `Started formatting job for "${manuscript.title}"`,
    manuscriptTitle: manuscript.title,
    manuscriptId: manuscript.id,
  });

  res.status(201).json(buildJobWithManuscript(job, manuscript));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(formattingJobsTable.id, parsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(buildJobWithManuscript(row.formatting_jobs, row.manuscripts));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const paramsParsed = UpdateJobParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateJobBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(formattingJobsTable.id, paramsParsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [updated] = await db
    .update(formattingJobsTable)
    .set({ ...bodyParsed.data, updatedAt: new Date() })
    .where(eq(formattingJobsTable.id, paramsParsed.data.id))
    .returning();

  res.json(buildJobWithManuscript(updated, row.manuscripts));
});

router.post("/jobs/:id/process", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = ProcessJobParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(formattingJobsTable.id, parsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const previewText = generatePreviewText(row.formatting_jobs, row.manuscripts);

  const [updated] = await db
    .update(formattingJobsTable)
    .set({ status: "completed", previewText, updatedAt: new Date() })
    .where(eq(formattingJobsTable.id, parsed.data.id))
    .returning();

  await db.insert(activityLogTable).values({
    userId,
    type: "job_completed",
    description: `Formatting completed for "${row.manuscripts.title}"`,
    manuscriptTitle: row.manuscripts.title,
    manuscriptId: row.manuscripts.id,
  });

  await db
    .update(manuscriptsTable)
    .set({ status: "ready", updatedAt: new Date() })
    .where(eq(manuscriptsTable.id, row.manuscripts.id));

  res.json(buildJobWithManuscript(updated, row.manuscripts));
});

router.get("/jobs/:id/readiness", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = GetJobReadinessParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(formattingJobsTable.id, parsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const job = row.formatting_jobs;
  const items = [
    { label: "Book type selected", passed: !!job.bookType, severity: "required" as const },
    { label: "Publishing target selected", passed: !!job.publishingTarget, severity: "required" as const },
    { label: "Design theme selected", passed: !!job.theme, severity: "required" as const },
    { label: "Font family configured", passed: !!job.fontFamily, severity: "warning" as const },
    { label: "Page numbering enabled", passed: !!job.pageNumberPosition, severity: "warning" as const },
    { label: "Chapter style configured", passed: !!job.chapterNumberStyle, severity: "warning" as const },
    { label: "File uploaded", passed: !!row.manuscripts.fileKey, severity: "required" as const },
  ];

  const passed = items.filter((i) => i.passed).length;
  const score = Math.round((passed / items.length) * 100);

  res.json({ score, items });
});

function generatePreviewText(
  job: typeof formattingJobsTable.$inferSelect,
  manuscript: typeof manuscriptsTable.$inferSelect,
): string {
  const theme = job.theme ?? "classic";
  const font = job.fontFamily ?? "Times New Roman";
  const spacing = job.lineSpacing ?? "double";
  const bookType = job.bookType ?? "novel";

  return `FORMATTED PREVIEW — ${manuscript.title.toUpperCase()}

Book Type: ${bookType.replace(/_/g, " ")}
Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}
Font: ${font} | Spacing: ${spacing} | Target: ${job.publishingTarget?.replace(/_/g, " ") ?? "Standard"}

─────────────────────────────────────────────────

CHAPTER ONE

It begins here — your words, perfectly formatted for professional publication.

The Manuskript AI formatting engine has applied your chosen typography settings, including ${font} at ${job.fontSize ?? 12}pt with ${spacing} line spacing. Margins are set to ${job.marginSize ?? "normal"} width, with page numbers positioned at the ${job.pageNumberPosition?.replace(/_/g, " ") ?? "bottom center"}.

Chapter headings follow the ${job.chapterNumberStyle ?? "arabic"} numbering style, and the layout is optimized for ${job.publishingTarget?.replace(/_/g, " ") ?? "standard print"}.

Your manuscript is ready for export as PDF or DOCX.

─────────────────────────────────────────────────`;
}

export default router;
