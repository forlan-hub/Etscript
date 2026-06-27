export type PaymentType =
  | "payg_export"
  | "premium_subscription"
  | "premium_quarterly"
  | "premium_annual"
  | "lifetime_access";

export type NormalizedStatus = "success" | "pending" | "failed";

export interface InitializeParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  /** When set, Paystack auto-creates a subscription after the first charge. */
  planCode?: string;
}

export interface InitializeResult {
  authorizationUrl: string;
  reference: string;
}

export interface VerifyResult {
  status: NormalizedStatus;
  amountKobo: number;
  currency: string;
  reference: string;
  customerCode?: string;
  customerEmail?: string;
  planCode?: string;
  subscriptionCode?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  initializeTransaction(params: InitializeParams): Promise<InitializeResult>;
  verifyTransaction(reference: string): Promise<VerifyResult>;
  /** Idempotently create-or-reuse the monthly Premium plan; returns its plan code. */
  ensurePremiumPlan(): Promise<string>;
  disableSubscription(subscriptionCode: string, emailToken: string): Promise<void>;
  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean;
}
