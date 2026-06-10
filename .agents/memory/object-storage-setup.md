---
name: Object storage setup
description: GCS bucket is provisioned; manuscript uploads use presigned PUT URLs; fileKey is a /objects/ path.
---

## Rules

- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` are set as env secrets — already provisioned, do NOT call `setupObjectStorage()` again.
- `manuscripts.fileKey` is now a normalized GCS object path (`/objects/uploads/<uuid>`), NOT a local filesystem path like `manuscripts/{userId}/{id}/{filename}`.
- The upload flow: browser calls `POST /manuscripts/:id/upload-url` → gets `{ uploadUrl (GCS presigned URL), fileKey }` → PUTs file directly to GCS with `Content-Type` header only (no auth header — GCS presigned URLs are self-authenticating).
- `POST /api/storage/uploads/request-url` is the generic presigned URL endpoint (for other upload use cases).
- `GET /api/storage/objects/*` and `GET /api/storage/public-objects/*` serve from GCS.
- Multer and `lib/fileStorage.ts` (disk-based) have been removed from manuscripts.ts — do not re-add them.

**Why:** Replit servers have ephemeral disk (`/tmp`) — files are lost on restart/redeploy. GCS storage persists across deploys.

**How to apply:** When the formatter needs to READ uploaded manuscript content (for real PDF/DOCX generation), use `objectStorageService.getObjectEntityFile(manuscript.fileKey)` then `objectStorageService.downloadObject(file)` to stream the bytes.
