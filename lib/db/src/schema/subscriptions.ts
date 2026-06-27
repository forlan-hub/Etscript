import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull().default("paystack"),
  providerCustomerCode: text("provider_customer_code"),
  providerSubscriptionCode: text("provider_subscription_code"),
  providerEmailToken: text("provider_email_token"),
  providerPlanCode: text("provider_plan_code"),
  planType: text("plan_type").notNull().default("monthly"),
  status: text("status").notNull().default("pending"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
