import type { PaymentProvider } from "./types";
import { paystackProvider } from "./paystack";

export * from "./types";
export * from "./config";

/**
 * Returns the active payment provider. Paystack today; a Flutterwave provider
 * implementing the same {@link PaymentProvider} interface drops in here next.
 */
export function getProvider(): PaymentProvider {
  return paystackProvider;
}
