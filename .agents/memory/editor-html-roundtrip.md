---
name: Editor engine HTML round-trip
description: How TipTap editedContent (HTML) is converted back to Chapter[] for PDF/DOCX generation.
---

## Rule
The editor stores the manuscript as TipTap HTML in `formattingJobs.editedContent`. The formatter uses `parseHtmlToChapters(html)` to reconstruct `Chapter[]` before generating files.

**Why:** The formatter's `extractTitlePage + generatePdfBuffer/generateDocxBuffer` pipeline works on `Chapter[]`, not raw HTML. The HTML→Chapter[] conversion must preserve the book structure.

## HTML structure contract
- `<h1>` → first paragraph of preamble chapter (title = ''), `extractTitlePage` picks it up as `bookTitle`
- `<p>` after h1 → remaining preamble lines (author, copyright)
- `<h2>` → body chapter heading (title = heading text)
- `<p>` after h2 → chapter body paragraphs

## How to apply
When `job.editedContent` is set, `generateFormattedFiles` and `generateDocumentBuffer` call `parseHtmlToChapters(job.editedContent)` instead of downloading and parsing the original file. Word count is derived from the chapter paragraphs in this path.

`generateEditorContent(manuscript)` is the inverse: parses the original file → `extractTitlePage` → `buildEditorHtml` → clean TipTap HTML for the first editor load.
