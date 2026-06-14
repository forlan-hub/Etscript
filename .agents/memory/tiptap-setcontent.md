---
name: TipTap setContent API
description: setContent second arg is ParseOptions, not a boolean emitUpdate flag — use a ref to skip save on initial load.
---

## Rule
`editor.commands.setContent(html)` — do NOT pass `false` as the second arg (that was an older API). The installed version's second param is `ParseOptions`.

**Why:** TypeScript error TS2559 when passing `false`: "Type 'false' has no properties in common with type 'ParseOptions'".

## How to apply
To prevent auto-save triggering when setting initial content, use a `skipNextSave` ref:

```typescript
const skipNextSave = useRef(false);

// in onUpdate:
if (skipNextSave.current) { skipNextSave.current = false; return; }

// when setting initial content:
skipNextSave.current = true;
editor.commands.setContent(html);
```
