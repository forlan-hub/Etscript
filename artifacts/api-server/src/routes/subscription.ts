import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";
import { GetSubscriptionResponse, CancelSubscriptionResponse } from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/supabaseAuth";
import { getActiveSubscription } from "../lib/entitlements";
import { getProvider } from "../lib/payments";

const router: IRouter = Router();

// GET /subscription — current plan status
router.get("/subscription", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const sub = await getActiveSubscription(userId);
  if (!sub) {
    res.json(GetSubscriptionResponse.parse({ plan: "free", status: null, currentPeriodEnd: null }));
    return;
  }
  res.json(
    GetSubscriptionResponse.parse({
      plan: "premium",
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    }),
  );
});

// POST /subscription/cancel — stop auto-renewal (access continues until period end)
router.post("/subscription/cancel", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const sub = await getActiveSubscription(userId);
  if (!sub) {
    res.status(404).json({ error: "No active subscription" });
    return;
  }

  if (sub.providerSubscriptionCode && sub.providerEmailToken) {
    try {
      await getProvider().disableSubscription(
        sub.providerSubscriptionCode,
        sub.providerEmailToken,
      );
    } catch (err) {
      req.log.error({ err: String(err) }, "disableSubscription failed");
      res.status(502).json({ error: "Could not cancel subscription with provider" });
      return;
    }
  } else {
    req.log.warn(
      { userId },
      "cancelling subscription without provider code/token; marking cancelled locally",
    );
  }

  const [updated] = await db
    .update(subscriptionsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptionsTable.id, sub.id))
    .returning();

  const stillActive = !!updated.currentPeriodEnd && updated.currentPeriodEnd.getTime() > Date.now();

  res.json(
    CancelSubscriptionResponse.parse({
      plan: stillActive ? "premium" : "free",
      status: updated.status,
      currentPeriodEnd: updated.currentPeriodEnd ? updated.currentPeriodEnd.toISOString() : null,
    }),
  );
});

export default router;
