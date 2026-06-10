import crypto from "crypto";
import type {
  InitializeParams,
  InitializeResult,
  NormalizedStatus,
  PaymentProvider,
  VerifyResult,
} from "./types";
import { PREMIUM_AMOUNT_KOBO, PREMIUM_PLAN_NAME, CURRENCY } from "./config";

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key;
}

interface PaystackEnvelope<T> {
  status: boolean;
  message: string;
  data: T;
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => null)) as PaystackEnvelope<T> | null;
  if (!res.ok || !body || body.status !== true) {
    const message = body?.message ?? `Paystack request failed (${res.status})`;
    throw new Error(message);
  }
  return body.data;
}

function normalizeStatus(raw: string | undefined): NormalizedStatus {
  switch (raw) {
    case "success":
      return "success";
    case "failed":
    case "reversed":
      return "failed";
    default:
      // abandoned, ongoing, pending, queued, processing, etc.
      return "pending";
  }
}

interface InitTxnData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyTxnData {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  customer?: { customer_code?: string; email?: string };
  plan?: string | { plan_code?: string } | null;
  plan_object?: { plan_code?: string } | null;
  subscription_code?: string;
  metadata?: Record<string, unknown> | string | null;
}

interface PlanData {
  plan_code: string;
  name: string;
  amount: number;
  interval: string;
}

function extractPlanCode(data: VerifyTxnData): string | undefined {
  if (typeof data.plan === "string" && data.plan) return data.plan;
  if (data.plan && typeof data.plan === "object" && data.plan.plan_code) {
    return data.plan.plan_code;
  }
  if (data.plan_object?.plan_code) return data.plan_object.plan_code;
  return undefined;
}

function coerceMetadata(
  meta: Record<string, unknown> | string | null | undefined,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  return meta;
}

let cachedPlanCode: string | null = null;

class PaystackProvider implements PaymentProvider {
  readonly name = "paystack";

  async initializeTransaction(params: InitializeParams): Promise<InitializeResult> {
    const data = await paystackFetch<InitTxnData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        currency: CURRENCY,
        metadata: params.metadata ?? {},
        ...(params.planCode ? { plan: params.planCode } : {}),
      }),
    });
    return { authorizationUrl: data.authorization_url, reference: data.reference };
  }

  async verifyTransaction(reference: string): Promise<VerifyResult> {
    const data = await paystackFetch<VerifyTxnData>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    return {
      status: normalizeStatus(data.status),
      amountKobo: data.amount,
      currency: data.currency,
      reference: data.reference,
      customerCode: data.customer?.customer_code,
      customerEmail: data.customer?.email,
      planCode: extractPlanCode(data),
      subscriptionCode: data.subscription_code,
      metadata: coerceMetadata(data.metadata),
    };
  }

  async ensurePremiumPlan(): Promise<string> {
    if (cachedPlanCode) return cachedPlanCode;

    const plans = await paystackFetch<PlanData[]>("/plan?perPage=100");
    const existing = plans.find(
      (p) =>
        p.name === PREMIUM_PLAN_NAME &&
        p.amount === PREMIUM_AMOUNT_KOBO &&
        p.interval === "monthly",
    );
    if (existing) {
      cachedPlanCode = existing.plan_code;
      return existing.plan_code;
    }

    const created = await paystackFetch<PlanData>("/plan", {
      method: "POST",
      body: JSON.stringify({
        name: PREMIUM_PLAN_NAME,
        amount: PREMIUM_AMOUNT_KOBO,
        interval: "monthly",
        currency: CURRENCY,
      }),
    });
    cachedPlanCode = created.plan_code;
    return created.plan_code;
  }

  async disableSubscription(subscriptionCode: string, emailToken: string): Promise<void> {
    await paystackFetch("/subscription/disable", {
      method: "POST",
      body: JSON.stringify({ code: subscriptionCode, token: emailToken }),
    });
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!signature) return false;
    let secret: string;
    try {
      secret = getSecretKey();
    } catch {
      return false;
    }
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const expected = Buffer.from(hash);
    const received = Buffer.from(signature);
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(expected, received);
  }
}

export const paystackProvider: PaymentProvider = new PaystackProvider();
