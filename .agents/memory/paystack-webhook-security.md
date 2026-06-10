---
name: Paystack webhook security
description: Amount/currency checks in the charge.success webhook handler, and the effectivePeriodEnd re-subscribe fix.
---

## Rules

### Amount + currency defense-in-depth (charge.success webhook)

The HMAC signature confirms the payload came from Paystack, but it does NOT confirm it is for the right product/price. The webhook handler must also:

- For **known txn references**: compare `data.amount` and `data.currency` against the stored `transactions` row. Refuse to grant (log error, return 200) if they disagree.
- For **renewal charges** (no stored txn row): only call `handleRenewalByCustomer` when `amount === PREMIUM_AMOUNT_KOBO && currency === CURRENCY`. Without this check, any Paystack charge for that customer (wrong plan, wrong amount) would silently extend the premium period.

**Why:** An attacker who can craft a valid Paystack charge (e.g. a ₦1 charge via a different plan) would otherwise receive premium entitlement. Amount/currency checks are parity with the verify-on-callback path, which already compares these fields.

**How to apply:** Import `PREMIUM_AMOUNT_KOBO` and `CURRENCY` from `../lib/payments` in the payments route. Add the conditional before calling `markTransactionSuccess` or `handleRenewalByCustomer`.

### effectivePeriodEnd — re-subscribe after expiry fix

When a user re-subscribes after their premium has lapsed, `activateSubscriptionForUser` must NOT reuse the old (past) `currentPeriodEnd` from the DB row.

`effectivePeriodEnd(incoming, existing)` returns:
- `incoming` if provided (always prefer the webhook-supplied date).
- `provisionalPeriodEnd()` (now + 31 days) if `existing` is null/undefined OR if `existing` is in the past.
- `existing` only when it is still in the future (active subscription being updated, not a lapsed re-subscribe).

**Why:** Without this, a user who re-subscribes after expiry would keep the past `currentPeriodEnd`, `isPremium()` would immediately return false, and the subscription would appear expired the moment it was granted.
