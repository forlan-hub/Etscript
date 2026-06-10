---
name: Paystack e2e quirks
description: Environment and email gotchas when running Paystack test-mode end-to-end harnesses.
---

## Rules

1. **Use @gmail.com addresses** — Paystack's initialize endpoint rejects emails with `.test` TLDs ("Invalid Email Address Passed"). Always use `something@gmail.com` (or another real TLD) in e2e harnesses.

2. **pg is only resolvable from lib/db** — `pg` is a dependency of `@workspace/db`, not `api-server`. In harness scripts, resolve it via `createRequire("/home/runner/workspace/lib/db/package.json")`.

3. **Env secrets in bash but not code_execution** — The bash tool inherits the Replit secrets environment. The `code_execution` (JS notebook) sandbox does NOT have access to `PAYSTACK_SECRET_KEY`, `DATABASE_URL`, etc. Run payment harnesses as `.mjs` scripts via `bash`, not in the code_execution notebook.

**Why:** Discovered during T007 e2e: first harness run failed only on email validation; second (pg) issue surfaced when harness was prototyped in code_execution. All three learned the hard way.
