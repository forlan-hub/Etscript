import { Router } from "express";
import { requireAuth, getUserId, supabaseAdmin } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { manuscriptsTable, activityLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.delete("/account", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  // 1. Delete all manuscripts (cascades to formatting_jobs via FK)
  await db.delete(manuscriptsTable).where(eq(manuscriptsTable.userId, userId));

  // 2. Delete activity log entries
  await db.delete(activityLogTable).where(eq(activityLogTable.userId, userId));

  // 3. Delete the Supabase auth user (uses service role — can delete any user)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    req.log.error({ err: error }, "Failed to delete Supabase auth user");
    res.status(500).json({ error: "Failed to delete account. Please try again." });
    return;
  }

  res.status(204).send();
});

export default router;
