---
name: Tailwind v4 + Clerk themes config
description: Two required config changes to make Clerk themes work correctly in Tailwind v4 projects (dev+prod).
---

For Clerk themes to render correctly in Tailwind v4 projects (both dev and prod builds), two changes are required:

1. **`artifacts/<slug>/src/index.css`** — Add this line BEFORE `@import 'tailwindcss'`:
   ```css
   @layer theme, base, clerk, components, utilities;
   ```

2. **`artifacts/<slug>/vite.config.ts`** — Pass `optimize: false` to the tailwindcss plugin:
   ```typescript
   tailwindcss({ optimize: false }),
   ```

**Why:** Without the layer declaration, Clerk's `@layer clerk` CSS gets reordered. Without `optimize: false`, lightningcss optimization reorders nested `@layer` imports from `@clerk/themes/*.css` in production builds, causing Clerk UI to look correct in dev but broken in prod.

**How to apply:** Always apply both changes together when setting up Clerk auth on a react-vite artifact with Tailwind v4.
