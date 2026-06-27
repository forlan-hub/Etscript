import { Router } from "express";
import { db, plansTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

const DEFAULT_PLANS = [
  {
    slug: "free",
    name: "Free",
    description: "Get started with Etscript at no cost",
    priceKobo: 0,
    billingPeriod: "free",
    isActive: true,
    isFeatured: false,
    maxManuscripts: 3,
    maxStorageMb: 50,
    features: [
      "Up to 3 manuscripts",
      "50 MB storage",
      "DOCX & TXT upload",
      "Formatting preview",
      "Watermarked PDF export",
    ],
    sortOrder: 0,
  },
  {
    slug: "payg",
    name: "Pay-As-You-Go",
    description: "Unlock clean exports one book at a time",
    priceKobo: 250_000,
    billingPeriod: "one_time",
    isActive: true,
    isFeatured: false,
    maxManuscripts: 10,
    maxStorageMb: 200,
    features: [
      "Up to 10 manuscripts",
      "200 MB storage",
      "Clean PDF + DOCX (per book)",
      "All book types & themes",
      "Priority formatting",
    ],
    sortOrder: 1,
  },
  {
    slug: "premium_monthly",
    name: "Premium Monthly",
    description: "Unlimited clean exports every month",
    priceKobo: 500_000,
    billingPeriod: "monthly",
    isActive: true,
    isFeatured: false,
    maxManuscripts: -1,
    maxStorageMb: 2048,
    features: [
      "Unlimited manuscripts",
      "2 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
    ],
    sortOrder: 2,
  },
  {
    slug: "premium_quarterly",
    name: "Premium Quarterly",
    description: "3 months of unlimited exports — save 20%",
    priceKobo: 1_200_000,
    billingPeriod: "quarterly",
    isActive: true,
    isFeatured: true,
    maxManuscripts: -1,
    maxStorageMb: 2048,
    features: [
      "Unlimited manuscripts",
      "2 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
      "20% savings vs monthly",
    ],
    sortOrder: 3,
  },
  {
    slug: "premium_annual",
    name: "Premium Annual",
    description: "12 months of unlimited exports — save 40%",
    priceKobo: 3_600_000,
    billingPeriod: "annual",
    isActive: true,
    isFeatured: false,
    maxManuscripts: -1,
    maxStorageMb: 5120,
    features: [
      "Unlimited manuscripts",
      "5 GB storage",
      "Unlimited clean exports",
      "All themes & book types",
      "Custom templates",
      "Priority support",
      "40% savings vs monthly",
      "Early access to new features",
    ],
    sortOrder: 4,
  },
  {
    slug: "lifetime",
    name: "Founder's Lifetime",
    description: "One payment. Access forever.",
    priceKobo: 10_000_000,
    billingPeriod: "lifetime",
    isActive: true,
    isFeatured: false,
    maxManuscripts: -1,
    maxStorageMb: 10240,
    features: [
      "Unlimited manuscripts",
      "10 GB storage",
      "Unlimited clean exports — forever",
      "All themes & book types",
      "Custom templates",
      "Founder badge",
      "Priority support — lifetime",
      "All future features included",
    ],
    sortOrder: 5,
  },
];

async function seedPlansIfEmpty(): Promise<void> {
  const existing = await db.select({ id: plansTable.id }).from(plansTable).limit(1);
  if (existing.length > 0) return;
  await db.insert(plansTable).values(DEFAULT_PLANS);
}

// Seed on module load (safe to call multiple times — idempotent)
seedPlansIfEmpty().catch(() => {});

// GET /plans — active plans ordered by sortOrder (public, no auth)
router.get("/plans", async (_req, res): Promise<void> => {
  await seedPlansIfEmpty();
  const rows = await db
    .select()
    .from(plansTable)
    .where(eq(plansTable.isActive, true))
    .orderBy(asc(plansTable.sortOrder));
  res.json(rows);
});

export { seedPlansIfEmpty };
export default router;
