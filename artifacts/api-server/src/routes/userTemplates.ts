import { Router } from "express";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { userTemplatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

const MAX_TEMPLATES_PREMIUM = 5;

const CreateBody = z.object({
  name: z.string().min(1).max(80),
  bookType: z.string().optional(),
  publishingTarget: z.string().optional(),
  theme: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().int().optional(),
  lineSpacing: z.string().optional(),
  marginSize: z.string().optional(),
  pageNumberPosition: z.string().optional(),
  chapterNumberStyle: z.string().optional(),
  citationStyle: z.string().optional(),
});

const UpdateBody = CreateBody.partial();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/user-templates", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select()
    .from(userTemplatesTable)
    .where(eq(userTemplatesTable.userId, userId));
  res.json(rows);
});

router.post("/user-templates", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select({ id: userTemplatesTable.id })
    .from(userTemplatesTable)
    .where(eq(userTemplatesTable.userId, userId));

  if (existing.length >= MAX_TEMPLATES_PREMIUM) {
    res.status(400).json({ error: `Maximum of ${MAX_TEMPLATES_PREMIUM} saved templates reached.` });
    return;
  }

  const [row] = await db
    .insert(userTemplatesTable)
    .values({ userId, ...parsed.data })
    .returning();

  res.status(201).json(row);
});

router.patch("/user-templates/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const idParsed = IdParam.safeParse({ id: req.params.id });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [row] = await db
    .update(userTemplatesTable)
    .set({ ...bodyParsed.data, updatedAt: new Date() })
    .where(and(eq(userTemplatesTable.id, idParsed.data.id), eq(userTemplatesTable.userId, userId)))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.delete("/user-templates/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const idParsed = IdParam.safeParse({ id: req.params.id });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(userTemplatesTable)
    .where(and(eq(userTemplatesTable.id, idParsed.data.id), eq(userTemplatesTable.userId, userId)))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

export default router;
