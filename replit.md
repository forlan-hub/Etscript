# Manuskript AI

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
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned by Clerk setup

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Wouter + shadcn/ui + Clerk auth
- API: Express 5 + Clerk Express middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit-managed Clerk (email + Google sign-in)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema files (manuscripts, formattingJobs, activityLog)
- `artifacts/api-server/src/routes/` — Express route handlers (manuscripts, jobs, dashboard, health)
- `artifacts/manuskript/src/pages/` — React pages (landing, dashboard, upload, format, customize, preview, manuscripts, pricing, settings)
- `artifacts/manuskript/src/App.tsx` — Clerk provider + router setup
- `artifacts/manuskript/public/logo.svg` — app logo

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`; codegen produces React Query hooks and Zod validators — never hand-write these
- The formatting engine is rule-based and never modifies the author's content — it only applies structural/typographic formatting
- Auth is cookie-based via Clerk; no explicit token handling needed on browser API calls
- Formatting "processing" is currently synchronous and simulated; the `processJob` endpoint generates a preview text and marks the job completed (real PDF generation is a future milestone)
- Activity log table tracks user actions for the dashboard recent-activity feed

## Product

- Upload manuscripts (DOCX, TXT) and create formatting jobs
- Choose book type (Novel, Memoir, Business, Academic, etc.), publishing target (Amazon KDP, A4, Ebook), and design theme (Classic, Modern, Premium, Corporate, Academic)
- Customize typography: font, size, line spacing, margins, page number position, chapter style
- Preview formatted output with book readiness checker (score + checklist)
- Export to PDF and DOCX (download)
- Dashboard with manuscript list, job history, and recent activity feed
- Free, Pay-As-You-Go (₦2,500/export), and Premium (₦5,000/month) pricing tiers

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/*` schema change, run `pnpm run typecheck:libs` before typechecking artifact packages, or you'll get stale "no exported member" errors
- The Tailwind v4 Clerk themes integration requires `@layer theme, base, clerk, components, utilities;` BEFORE `@import 'tailwindcss'` in index.css, and `tailwindcss({ optimize: false })` in vite.config.ts
- `@clerk/themes` must be installed separately (`pnpm --filter @workspace/manuskript add @clerk/themes`)
- Clerk dev keys show a console warning about development mode — this is expected and not an error
- The Clerk proxy middleware in `app.ts` must be mounted BEFORE body parsers

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth customization (login providers, branding, troubleshooting)
