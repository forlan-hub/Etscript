# Etscript

A manuscript formatting and publishing preparation platform for authors, novelists, consultants, trainers, and publishers. Users upload manuscripts, choose book type, publishing target, and design theme, then download professionally formatted PDFs and DOCX files.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/manuskript run dev` — run the frontend (port 25934)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run after any schema/openapi change)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase project credentials
- Required env: `PAYSTACK_SECRET_KEY`, `VITE_PAYSTACK_PUBLIC_KEY` — Paystack test/live keys

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Wouter + shadcn/ui + Supabase auth
- API: Express 5 + Supabase JWT middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Supabase (Google OAuth only)
- Payments: Paystack (PAYG ₦2,500 / Premium ₦5,000 per month); provider abstraction ready for Flutterwave
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema files (manuscripts, formattingJobs, activityLog, transactions, subscriptions)
- `artifacts/api-server/src/routes/` — Express route handlers (manuscripts, jobs, dashboard, health, payments, subscription)
- `artifacts/api-server/src/lib/payments/` — provider abstraction (paystack.ts, index.ts, config.ts)
- `artifacts/api-server/src/lib/entitlements.ts` — cleanAccess / isPremium helpers
- `artifacts/api-server/src/lib/paymentService.ts` — activateSubscriptionForUser, effectivePeriodEnd
- `artifacts/manuskript/src/pages/` — React pages (landing, dashboard, upload, format, customize, preview, manuscripts, pricing, settings, payment-callback)
- `artifacts/manuskript/src/App.tsx` — Supabase provider + router setup
- `artifacts/manuskript/public/logo.svg` — app logo

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`; codegen produces React Query hooks and Zod validators — never hand-write these
- The formatting engine is rule-based and never modifies the author's content — it only applies structural/typographic formatting
- Auth is Supabase JWT; the frontend passes the session `access_token` as `Authorization: Bearer <token>`; the API verifies it server-side via `requireAuth` / `getUserId`
- Entitlement is DERIVED: `cleanAccess(userId, jobId)` = active premium sub OR a successful `payg_export` transaction for that `(userId, jobId)` pair
- Watermark is applied at download time (not stored) — regenerated per request based on entitlement
- Webhook (`POST /api/payments/webhook`) is HMAC-SHA512 verified, checks amount+currency against stored transaction row, and grants entitlement; verify-on-callback is the primary UX path, webhook is backstop
- `effectivePeriodEnd` helper prevents stale past `currentPeriodEnd` on re-subscribe after expiry
- Formatting "processing" is currently synchronous and simulated; real PDF generation is a future milestone
- Activity log table tracks user actions for the dashboard recent-activity feed

## Product

- Upload manuscripts (DOCX, TXT) and create formatting jobs
- Choose book type (Novel, Memoir, Business, Academic, etc.), publishing target (Amazon KDP, A4, Ebook), and design theme (Classic, Modern, Premium, Corporate, Academic)
- Customize typography: font, size, line spacing, margins, page number position, chapter style
- Preview formatted output with book readiness checker (score + checklist)
- Export to PDF and DOCX — free tier includes watermark; unlock clean export per-book (₦2,500) or go Premium (₦5,000/month) for unlimited clean exports
- Dashboard with manuscript list, job history, and recent activity feed

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/*` schema change, run `pnpm run typecheck:libs` before typechecking artifact packages, or you'll get stale "no exported member" errors
- Paystack rejects `.test` TLD emails — always use `@gmail.com` or another real TLD in test harnesses
- `pg` is a dep of `@workspace/db`, not `api-server` — resolve it via `createRequire("/home/runner/workspace/lib/db/package.json")` in scripts
- Env secrets are available in bash but NOT in the code_execution (JS notebook) sandbox
- Do not change `info.title` in `lib/api-spec/openapi.yaml` — it controls generated filenames and import paths

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `database` skill for DB schema changes and migrations
