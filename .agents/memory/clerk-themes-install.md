---
name: Clerk themes separate install
description: @clerk/themes is not bundled with @clerk/react and must be installed explicitly on the frontend artifact.
---

The design subagent will write `import { shadcn } from '@clerk/themes'` but will not install the package even when instructed to. The main agent must run:

```bash
pnpm --filter @workspace/<slug> add @clerk/themes
```

**Why:** The package is a separate npm package (`@clerk/themes`) and is not a dependency of `@clerk/react`. When the subagent writes the import without installing, Vite throws a 500 "Failed to resolve import" error on first load.

**How to apply:** Always install this package before restarting the frontend workflow after Clerk auth setup, regardless of whether the subagent claims to have installed it.
