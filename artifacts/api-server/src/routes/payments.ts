import { Router, type IRouter, type Request } from "express";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db, transactionsTable, formattingJobsTable, manuscriptsTable } from "@workspace/db";
import {
  CreateCheckoutBody,
  CreateCheckoutResponse,
  VerifyPaymentQueryParams,
  VerifyPaymentResponse,
  GetExportAccessResponse,
} from "@workspace/api-zod";
import { requireAuth, getUserId, supabaseAdmin } from "../middlewares/supabaseAuth";
import { sendReceipt } from "../lib/email";
import { getProvider, amountForType, CURRENCY, PREMIUM_AMOUNT_KOBO } from "../lib/payments";
import { getCleanAccess, isPremium } from "../lib/entitlements";
import {
  getTransactionByReference,
  markTransactionSuccess,
  markTransactionFailed,
  activateSubscriptionForUser,
  enrichSubscriptionByCustomer,
  handleRenewalByCustomer,
  cancelSubscriptionByCode,
} from "../lib/paymentService";

const router: IRouter = Router();

type PaymentTypeValue = "payg_export" | "premium_subscription";

function getOrigin(req: Request): string {
  const origin = req.headers.origin;
  if (typeof origin === "string" && origin) return origin;
  const referer = req.headers.referer;
  if (typeof referer === "string" && referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore malformed referer */
    }
  }
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0].trim()}`;
  return "";
}

function extractWebhookPlanCode(data: Record<string, unknown>): string | undefined {
  const plan = data.plan;
  if (typeof plan === "string") return plan || undefined;
  if (plan && typeof plan === "object") {
    const code = (plan as Record<string, unknown>).plan_code;
    if (typeof code === "string") return code;
  }
  const planObject = data.plan_object as Record<string, unknown> | undefined;
  if (planObject && typeof planObject.plan_code === "string") {
    return planObject.plan_code;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a user's email: prefer the value from the Paystack payload (already
 *  verified by Paystack), fall back to the Supabase auth record. */
async function resolveUserEmail(
  userId: string,
  paystackEmail?: string,
): Promise<string | undefined> {
  if (paystackEmail) return paystackEmail;
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data?.user?.email ?? undefined;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// POST /payments/checkout — initialize a payment, return authorization URL
// ---------------------------------------------------------------------------
router.post("/payments/checkout", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const email = (req as unknown as { supabaseUser?: { email?: string } }).supabaseUser?.email;
  if (!email) {
    res.status(400).json({ error: "User email unavailable" });
    return;
  }

  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const type = parsed.data.type as PaymentTypeValue;
  const jobId = parsed.data.jobId ?? null;

  const provider = getProvider();
  const amountKobo = amountForType(type);
  let planCode: string | undefined;

  if (type === "payg_export") {
    if (!jobId) {
      res.status(400).json({ error: "jobId is required for export payment" });
      return;
    }
    const [row] = await db
      .select({ id: formattingJobsTable.id })
      .from(formattingJobsTable)
      .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
      .where(and(eq(formattingJobsTable.id, jobId), eq(manuscriptsTable.userId, userId)));
    if (!row) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const access = await getCleanAccess(userId, jobId);
    if (access.canDownloadClean) {
      res.status(400).json({ error: "This export is already unlocked" });
      return;
    }
  } else {
    if (await isPremium(userId)) {
      res.status(400).json({ error: "You already have an active Premium subscription" });
      return;
    }
    try {
      planCode = await provider.ensurePremiumPlan();
    } catch (err) {
      req.log.error({ err: String(err) }, "ensurePremiumPlan failed");
      res.status(502).json({ error: "Payment provider unavailable" });
      return;
    }
  }

  const reference = `etx_${crypto.randomUUID().replace(/-/g, "")}`;

  await db.insert(transactionsTable).values({
    userId,
    provider: provider.name,
    reference,
    type,
    jobId: type === "payg_export" ? jobId : null,
    amount: amountKobo,
    currency: CURRENCY,
    status: "pending",
    metadata: { type, jobId, userId },
  });

  let init;
  try {
    init = await provider.initializeTransaction({
      email,
      amountKobo,
      reference,
      callbackUrl: `${getOrigin(req)}/payment/callback`,
      planCode,
      metadata: { type, jobId, userId },
    });
  } catch (err) {
    req.log.error({ err: String(err) }, "initializeTransaction failed");
    res.status(502).json({ error: "Could not start payment" });
    return;
  }

  res.json(
    CreateCheckoutResponse.parse({
      authorizationUrl: init.authorizationUrl,
      reference: init.reference,
    }),
  );
});

// ---------------------------------------------------------------------------
// GET /payments/verify — confirm a payment after redirect (primary UX path)
// ---------------------------------------------------------------------------
router.get("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = VerifyPaymentQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { reference } = parsed.data;

  const txn = await getTransactionByReference(reference);
  if (!txn || txn.userId !== userId) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  const provider = getProvider();
  let result;
  try {
    result = await provider.verifyTransaction(reference);
  } catch (err) {
    req.log.error({ err: String(err) }, "verifyTransaction failed");
    res.status(502).json({ error: "Could not verify payment" });
    return;
  }

  const txnType = txn.type as PaymentTypeValue;

  if (result.status === "success") {
    if (result.amountKobo !== txn.amount || result.currency !== txn.currency) {
      req.log.error(
        { reference, expected: txn.amount, got: result.amountKobo },
        "payment amount/currency mismatch",
      );
      res.json(
        VerifyPaymentResponse.parse({ status: "failed", type: txnType, jobId: txn.jobId ?? null }),
      );
      return;
    }
    await markTransactionSuccess(reference);
    if (txnType === "premium_subscription") {
      await activateSubscriptionForUser(userId, {
        customerCode: result.customerCode,
        planCode: result.planCode,
      });
    }
  } else if (result.status === "failed") {
    await markTransactionFailed(reference);
  }

  res.json(
    VerifyPaymentResponse.parse({ status: result.status, type: txnType, jobId: txn.jobId ?? null }),
  );
});

// ---------------------------------------------------------------------------
// GET /payments/export-access/:jobId — can the user download a clean export?
// ---------------------------------------------------------------------------
router.get("/payments/export-access/:jobId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const jobId = Number(req.params.jobId);
  if (!Number.isInteger(jobId)) {
    res.status(400).json({ error: "Invalid jobId" });
    return;
  }
  const access = await getCleanAccess(userId, jobId);
  res.json(GetExportAccessResponse.parse(access));
});

// ---------------------------------------------------------------------------
// POST /payments/webhook — Paystack server-to-server events (no auth; HMAC)
// ---------------------------------------------------------------------------
router.post("/payments/webhook", async (req, res): Promise<void> => {
  const provider = getProvider();
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
  const sigHeader = req.headers["x-paystack-signature"];
  const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;

  if (!rawBody || !provider.verifyWebhookSignature(rawBody, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body as { event?: string; data?: Record<string, unknown> };
  const eventType = event.event;
  const data = (event.data ?? {}) as Record<string, unknown>;
  const customer = data.customer as { customer_code?: string } | undefined;

  try {
    if (eventType === "charge.success") {
      const reference = typeof data.reference === "string" ? data.reference : undefined;
      const planCode = extractWebhookPlanCode(data);
      const customerCode = customer?.customer_code;
      const amount = typeof data.amount === "number" ? data.amount : undefined;
      const currency = typeof data.currency === "string" ? data.currency : undefined;
      const customerEmail =
        typeof (data.customer as Record<string, unknown> | undefined)?.email === "string"
          ? (data.customer as Record<string, unknown>).email as string
          : undefined;
      const txn = reference ? await getTransactionByReference(reference) : null;

      if (txn && reference) {
        // The reference is already amount-bound at initialize; this is
        // defense-in-depth parity with the verify path — refuse to grant when
        // the charged amount/currency disagrees with the stored row.
        if (
          (amount !== undefined && amount !== txn.amount) ||
          (currency !== undefined && currency !== txn.currency)
        ) {
          req.log.error(
            { reference, expected: txn.amount, got: amount },
            "webhook amount/currency mismatch",
          );
        } else {
          await markTransactionSuccess(reference);
          if (txn.type === "premium_subscription") {
            await activateSubscriptionForUser(txn.userId, { customerCode, planCode });
          }

          // Send receipt — resolve email from Paystack payload or Supabase
          const receiptEmail = await resolveUserEmail(txn.userId, customerEmail);
          if (receiptEmail) {
            let manuscriptTitle: string | null = null;
            if (txn.type === "payg_export" && txn.jobId) {
              const [row] = await db
                .select({ title: manuscriptsTable.title })
                .from(formattingJobsTable)
                .innerJoin(manuscriptsTable, eq(formattingJobsTable.manuscriptId, manuscriptsTable.id))
                .where(eq(formattingJobsTable.id, txn.jobId));
              manuscriptTitle = row?.title ?? null;
            }
            sendReceipt({
              to: receiptEmail,
              type: txn.type as "payg_export" | "premium_subscription",
              amountKobo: txn.amount,
              manuscriptTitle,
            }).catch((err: unknown) =>
              req.log.error({ err: String(err) }, "receipt email failed"),
            );
          }
        }
      } else if (
        customerCode &&
        planCode &&
        amount === PREMIUM_AMOUNT_KOBO &&
        currency === CURRENCY
      ) {
        // Recurring renewal charge (no matching initiating transaction row);
        // only extend when the charge matches the premium plan price.
        await handleRenewalByCustomer(customerCode);

        // Send renewal receipt using the email from the Paystack payload
        if (customerEmail) {
          sendReceipt({
            to: customerEmail,
            type: "renewal",
            amountKobo: PREMIUM_AMOUNT_KOBO,
          }).catch((err: unknown) =>
            req.log.error({ err: String(err) }, "renewal receipt email failed"),
          );
        }
      }
    } else if (eventType === "subscription.create") {
      const customerCode = customer?.customer_code;
      const subscriptionCode =
        typeof data.subscription_code === "string" ? data.subscription_code : undefined;
      const emailToken = typeof data.email_token === "string" ? data.email_token : undefined;
      const nextPayment =
        typeof data.next_payment_date === "string" ? new Date(data.next_payment_date) : undefined;
      if (customerCode) {
        await enrichSubscriptionByCustomer(customerCode, {
          subscriptionCode,
          emailToken,
          currentPeriodEnd: nextPayment,
        });
      }
    } else if (eventType === "subscription.disable" || eventType === "subscription.not_renew") {
      const subscriptionCode =
        typeof data.subscription_code === "string" ? data.subscription_code : undefined;
      if (subscriptionCode) await cancelSubscriptionByCode(subscriptionCode);
    }
  } catch (err) {
    req.log.error({ err: String(err), event: eventType }, "webhook handler error");
    // Acknowledge anyway; handlers are idempotent and verify-on-callback backstops.
  }

  res.status(200).json({ received: true });
});

export default router;
