import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  manuscriptsTable,
  insertManuscriptSchema,
  activityLogTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  CreateManuscriptBody,
  GetManuscriptParams,
  DeleteManuscriptParams,
  GetUploadUrlParams,
  GetUploadUrlBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

router.get("/manuscripts", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const manuscripts = await db
    .select()
    .from(manuscriptsTable)
    .where(eq(manuscriptsTable.userId, userId))
    .orderBy(desc(manuscriptsTable.createdAt));
  res.json(manuscripts);
});

router.post("/manuscripts", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateManuscriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [manuscript] = await db
    .insert(manuscriptsTable)
    .values({ ...parsed.data, userId })
    .returning();

  await db.insert(activityLogTable).values({
    userId,
    type: "manuscript_uploaded",
    description: `Created manuscript "${manuscript.title}"`,
    manuscriptTitle: manuscript.title,
    manuscriptId: manuscript.id,
  });

  res.status(201).json(manuscript);
});

router.get("/manuscripts/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = GetManuscriptParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [manuscript] = await db
    .select()
    .from(manuscriptsTable)
    .where(
      and(
        eq(manuscriptsTable.id, parsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );
  if (!manuscript) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(manuscript);
});

router.delete("/manuscripts/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = DeleteManuscriptParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(manuscriptsTable)
    .where(
      and(
        eq(manuscriptsTable.id, parsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );
  res.status(204).send();
});

router.post("/manuscripts/:id/upload-url", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const idParsed = GetUploadUrlParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = GetUploadUrlBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [manuscript] = await db
    .select()
    .from(manuscriptsTable)
    .where(
      and(
        eq(manuscriptsTable.id, idParsed.data.id),
        eq(manuscriptsTable.userId, userId),
      ),
    );
  if (!manuscript) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const fileKey = `manuscripts/${userId}/${idParsed.data.id}/${bodyParsed.data.filename}`;

  await db
    .update(manuscriptsTable)
    .set({ fileKey, originalFilename: bodyParsed.data.filename, updatedAt: new Date() })
    .where(eq(manuscriptsTable.id, idParsed.data.id));

  res.json({
    uploadUrl: `/api/manuscripts/${idParsed.data.id}/upload-file`,
    fileKey,
  });
});

export default router;
