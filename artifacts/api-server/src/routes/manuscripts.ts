import { Router } from "express";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { manuscriptsTable, activityLogTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  CreateManuscriptBody,
  GetManuscriptParams,
  DeleteManuscriptParams,
  GetUploadUrlParams,
  GetUploadUrlBody,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const objectStorageService = new ObjectStorageService();

router.get("/manuscripts", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const manuscripts = await db
    .select()
    .from(manuscriptsTable)
    .where(eq(manuscriptsTable.userId, userId))
    .orderBy(desc(manuscriptsTable.createdAt));
  res.json(manuscripts);
});

router.post("/manuscripts", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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

router.get("/manuscripts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = GetManuscriptParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [manuscript] = await db
    .select()
    .from(manuscriptsTable)
    .where(and(eq(manuscriptsTable.id, parsed.data.id), eq(manuscriptsTable.userId, userId)));
  if (!manuscript) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(manuscript);
});

router.delete("/manuscripts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = DeleteManuscriptParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(manuscriptsTable)
    .where(and(eq(manuscriptsTable.id, parsed.data.id), eq(manuscriptsTable.userId, userId)));
  res.status(204).send();
});

router.post("/manuscripts/:id/upload-url", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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
    .where(and(eq(manuscriptsTable.id, idParsed.data.id), eq(manuscriptsTable.userId, userId)));
  if (!manuscript) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
  const fileKey = objectStorageService.normalizeObjectEntityPath(uploadUrl);

  const fileSize = bodyParsed.data.fileSize;
  const wordCount = fileSize ? Math.round(fileSize / 5) : undefined;

  await db
    .update(manuscriptsTable)
    .set({
      fileKey,
      originalFilename: bodyParsed.data.filename,
      ...(fileSize !== undefined ? { fileSize } : {}),
      ...(wordCount !== undefined ? { wordCount } : {}),
      updatedAt: new Date(),
    })
    .where(eq(manuscriptsTable.id, idParsed.data.id));

  res.json({ uploadUrl, fileKey });
});

export default router;
