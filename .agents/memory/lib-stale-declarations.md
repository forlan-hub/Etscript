---
name: Stale lib declarations after schema changes
description: After adding new files to lib/db/src/schema/, run typecheck:libs before checking artifact packages or you get false "no exported member" errors.
---

When new schema files are added to `lib/db/src/schema/` (or any `lib/*` package), the TypeScript build cache does not automatically update the `.d.ts` declarations. Running `pnpm --filter @workspace/api-server run typecheck` immediately after will report errors like:

```
error TS2305: Module '"@workspace/db"' has no exported member 'manuscriptsTable'.
```

**Why:** `lib/*` packages are composite and emit declarations via `tsc --build`. The artifact typechecks (leaf packages) read those emitted declarations, not source files. If the declarations haven't been rebuilt, the leaf checker sees stale types.

**How to apply:** After any change to a `lib/*` package, always run `pnpm run typecheck:libs` before running artifact-level typechecks. The codegen command already does this automatically, but manual schema edits do not.
