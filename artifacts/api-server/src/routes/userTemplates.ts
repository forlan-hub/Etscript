import { Router } from "express";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { userTemplatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateUserTemplateBody,
  UpdateUserTemplateBody,
  UpdateUserTemplateParams,
  DeleteUserTemplateParams,
} from "@workspace/api-zod";

const router = Router();

const MAX_TEMPLATES = 5;

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
  const parsed = CreateUserTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select({ id: userTemplatesTable.id })
    .from(userTemplatesTable)
    .where(eq(userTemplatesTable.userId, userId));

  if (existing.length >= MAX_TEMPLATES) {
    res.status(400).json({ error: `Maximum of ${MAX_TEMPLATES} saved templates reached.` });
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
  const idParsed = UpdateUserTemplateParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateUserTemplateBody.safeParse(req.body);
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
  const idParsed = DeleteUserTemplateParams.safeParse({ id: Number(req.params.id) });
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
