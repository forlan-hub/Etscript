import type { PaymentType } from "./types";

export { type PaymentType };

export const PAYG_AMOUNT_KOBO = 250_000;              // ₦2,500 per export
export const PREMIUM_MONTHLY_AMOUNT_KOBO = 500_000;   // ₦5,000 / month
export const PREMIUM_QUARTERLY_AMOUNT_KOBO = 1_200_000; // ₦12,000 / 3 months (~20% off)
export const PREMIUM_ANNUAL_AMOUNT_KOBO = 3_600_000;   // ₦36,000 / year (~40% off)
export const LIFETIME_AMOUNT_KOBO = 10_000_000;        // ₦100,000 one-time

/** Kept for backward compatibility with paystack.ts + webhook renewal logic. */
export const PREMIUM_AMOUNT_KOBO = PREMIUM_MONTHLY_AMOUNT_KOBO;

export const CURRENCY = "NGN";
export const PREMIUM_PLAN_NAME = "Etscript Premium Monthly";

export type PlanType = "monthly" | "quarterly" | "annual" | "lifetime";

export function amountForType(type: PaymentType): number {
  switch (type) {
    case "payg_export":          return PAYG_AMOUNT_KOBO;
    case "premium_subscription": return PREMIUM_MONTHLY_AMOUNT_KOBO;
    case "premium_quarterly":    return PREMIUM_QUARTERLY_AMOUNT_KOBO;
    case "premium_annual":       return PREMIUM_ANNUAL_AMOUNT_KOBO;
    case "lifetime_access":      return LIFETIME_AMOUNT_KOBO;
  }
}

export function planTypeForPaymentType(type: PaymentType): PlanType {
  switch (type) {
    case "premium_quarterly": return "quarterly";
    case "premium_annual":    return "annual";
    case "lifetime_access":   return "lifetime";
    default:                  return "monthly";
  }
}

/** Is this payment type a subscription-style activation (not PAYG)? */
export function isSubscriptionType(type: PaymentType): boolean {
  return type !== "payg_export";
}
