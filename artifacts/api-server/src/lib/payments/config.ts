export const PAYG_AMOUNT_KOBO = 250000; // ₦2,500 one-time per export
export const PREMIUM_AMOUNT_KOBO = 500000; // ₦5,000 / month
export const CURRENCY = "NGN";
export const PREMIUM_PLAN_NAME = "Etscript Premium Monthly";

export function amountForType(type: "payg_export" | "premium_subscription"): number {
  return type === "payg_export" ? PAYG_AMOUNT_KOBO : PREMIUM_AMOUNT_KOBO;
}
