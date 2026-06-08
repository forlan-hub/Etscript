import { Router } from "express";
import fs from "fs";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
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
import { generateFormattedFiles } from "../lib/formatter";
import { resolveOutputPath, fileExists } from "../lib/fileStorage";

const router = Router();

function buildJobWithManuscript(job: typeof formattingJobsTable.$inferSelect, manuscript: typeof manuscriptsTable.$inferSelect) {
  return { ...job, manuscript };
}

router.get("/jobs", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const jobs = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(eq(manuscriptsTable.userId, userId))
    .orderBy(desc(formattingJobsTable.createdAt));

  res.json(jobs.map((r) => buildJobWithManuscript(r.formatting_jobs, r.manuscripts)));
});

router.post("/jobs", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

router.get("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

router.patch("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

router.post("/jobs/:id/process", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

  await db
    .update(formattingJobsTable)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(formattingJobsTable.id, parsed.data.id));

  const result = await generateFormattedFiles(row.formatting_jobs, row.manuscripts);

  if (result.wordCount > 0 && row.manuscripts.wordCount === null) {
    await db
      .update(manuscriptsTable)
      .set({ wordCount: result.wordCount, updatedAt: new Date() })
      .where(eq(manuscriptsTable.id, row.manuscripts.id));
  }

  const [updated] = await db
    .update(formattingJobsTable)
    .set({
      status: "completed",
      previewText: result.previewHtml,
      outputPdfKey: result.pdfKey,
      outputDocxKey: result.docxKey,
      updatedAt: new Date(),
    })
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

router.get("/jobs/:id/download/:format", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const jobId = Number(req.params.id);
  const format = req.params.format as "pdf" | "docx";

  if (format !== "pdf" && format !== "docx") {
    res.status(400).json({ error: "Format must be pdf or docx" });
    return;
  }

  const [row] = await db
    .select()
    .from(formattingJobsTable)
    .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
    .where(
      and(
        eq(formattingJobsTable.id, jobId),
        eq(manuscriptsTable.userId, userId),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const outputKey = format === "pdf" ? row.formatting_jobs.outputPdfKey : row.formatting_jobs.outputDocxKey;
  if (!outputKey) {
    res.status(404).json({ error: "File not yet generated. Please process the job first." });
    return;
  }

  const filePath = resolveOutputPath(outputKey);
  if (!fileExists(filePath)) {
    res.status(404).json({ error: "File not found. Please re-process the job." });
    return;
  }

  const safeTitle = row.manuscripts.title.replace(/[^a-z0-9]/gi, "_").slice(0, 50);
  const filename = `${safeTitle}.${format}`;
  const mimeType = format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", fs.statSync(filePath).size);

  fs.createReadStream(filePath).pipe(res);
});

router.get("/jobs/:id/readiness", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

export default router;
