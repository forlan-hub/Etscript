import PDFDocument from "pdfkit";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  Footer,
  Header,
  PageNumber,
  SectionType,
  convertInchesToTwip,
  PageBreak,
} from "docx";
import fs from "fs";
import mammoth from "mammoth";
import { outputFileKey, resolveUploadPath, fileExists } from "./fileStorage";

type JobOptions = {
  id: number;
  bookType: string | null;
  publishingTarget: string | null;
  theme: string | null;
  fontFamily: string | null;
  fontSize: number | null;
  lineSpacing: string | null;
  marginSize: string | null;
  pageNumberPosition: string | null;
  chapterNumberStyle: string | null;
};

type ManuscriptInfo = {
  id: number;
  title: string;
  userId: string;
  fileKey: string | null;
  originalFilename: string | null;
};

export type FormattedResult = {
  pdfKey: string;
  docxKey: string;
  previewHtml: string;
  wordCount: number;
};

/** Thrown when a manuscript references an uploaded file that is gone from disk. */
export class MissingUploadError extends Error {
  override readonly name = "MissingUploadError";
  constructor() {
    super("Uploaded manuscript file is missing");
  }
}

type Chapter = {
  title: string;
  paragraphs: string[];
};

const SAMPLE_PARAGRAPHS = [
  "The morning light filtered through the tall windows of the study, casting long golden bars across the worn oak floor. Dust motes danced in the air, suspended in that particular stillness that precedes great events. Outside, the city was already stirring — the faint clatter of carts on cobblestones, a vendor's distant call — but here, within these four walls lined with books, time moved differently.",
  "She had read the letter three times before she allowed herself to believe it. The handwriting was unmistakable, a cramped and urgent scrawl she had not seen in seven years. Seven years of silence, of wondering, of slowly learning to stop wondering. And now this.",
  "He set the letter down on the desk and walked to the window. The garden below was overgrown, just as she had always let it grow — wild roses tumbling over the iron fence, lavender spilling onto the path. He had never understood why she preferred it that way. Now, perhaps, he was beginning to.",
  "There are moments when the past reaches forward and places its hand on your shoulder. You turn, expecting to see someone there, and find only air. But the weight of that hand remains, and you carry it with you for the rest of the day.",
  "The journey back would take three days if the roads were good. They had not been good in years. He packed only what he could carry, which turned out to be far less than he had imagined, and far more than he needed.",
];

async function extractText(fileKey: string, filename: string): Promise<string> {
  const filePath = resolveUploadPath(fileKey);
  if (!fileExists(filePath)) {
    return "";
  }

  const ext = (filename ?? "").toLowerCase().split(".").pop();

  if (ext === "txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  return "";
}

function parseChapters(text: string, title: string): Chapter[] {
  if (!text.trim()) {
    return [
      {
        title: "Chapter One",
        paragraphs: SAMPLE_PARAGRAPHS,
      },
      {
        title: "Chapter Two",
        paragraphs: [
          ...SAMPLE_PARAGRAPHS.slice(2),
          SAMPLE_PARAGRAPHS[0],
          SAMPLE_PARAGRAPHS[1],
        ],
      },
    ];
  }

  const chapterRegex =
    /^(chapter\s+[\w]+|part\s+[\w]+|section\s+[\w]+|prologue|epilogue|introduction|preface|foreword|afterword)[\s:—]*/im;

  const lines = text.split(/\r?\n/);
  const chapters: Chapter[] = [];
  let currentTitle = "";
  let currentParagraphs: string[] = [];
  let buffer = "";

  const flushBuffer = () => {
    const trimmed = buffer.trim();
    if (trimmed) currentParagraphs.push(trimmed);
    buffer = "";
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (chapterRegex.test(trimmed)) {
      flushBuffer();
      if (currentTitle || currentParagraphs.length > 0) {
        chapters.push({
          title: currentTitle || title,
          paragraphs: currentParagraphs,
        });
      }
      currentTitle = trimmed;
      currentParagraphs = [];
    } else if (trimmed === "") {
      flushBuffer();
    } else {
      buffer = buffer ? buffer + " " + trimmed : trimmed;
    }
  }

  flushBuffer();
  if (currentTitle || currentParagraphs.length > 0) {
    chapters.push({
      title: currentTitle || title,
      paragraphs: currentParagraphs,
    });
  }

  if (chapters.length === 0) {
    const allText = text.replace(/\s+/g, " ").trim();
    const chunks = allText.match(/.{1,800}(\s|$)/g) ?? [allText];
    return [{ title: title, paragraphs: chunks.map((c) => c.trim()) }];
  }

  return chapters;
}

function resolvePdfFont(fontFamily: string | null): string {
  const f = (fontFamily ?? "").toLowerCase();
  if (f.includes("helvetica") || f.includes("arial") || f.includes("sans")) {
    return "Helvetica";
  }
  if (f.includes("courier") || f.includes("mono")) {
    return "Courier";
  }
  return "Times-Roman";
}

function resolvePageSize(
  publishingTarget: string | null,
): [number, number] {
  switch (publishingTarget) {
    case "a4":
    case "a4_print":
      return [595.28, 841.89];
    case "ebook":
      return [432, 576];
    default:
      return [432, 648];
  }
}

function resolveMargin(marginSize: string | null): number {
  switch (marginSize) {
    case "narrow":
      return 36;
    case "wide":
      return 90;
    default:
      return 72;
  }
}

function resolveLineGap(lineSpacing: string | null, fontSize: number): number {
  switch (lineSpacing) {
    case "single":
    case "1.0":
      return fontSize * 0.15;
    case "1.15":
      return fontSize * 0.25;
    case "1.5":
      return fontSize * 0.45;
    case "double":
    case "2.0":
      return fontSize * 0.85;
    default:
      return fontSize * 0.45;
  }
}

function chapterLabel(index: number, style: string | null): string {
  const n = index + 1;
  switch (style) {
    case "roman": {
      const vals = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
      ] as [number, string][];
      let num = n;
      let result = "";
      for (const [v, s] of vals) {
        while (num >= v) {
          result += s;
          num -= v;
        }
      }
      return `Chapter ${result}`;
    }
    case "word":
    case "words": {
      const words = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
      ];
      return `Chapter ${words[n] ?? n}`;
    }
    default:
      return `Chapter ${n}`;
  }
}

async function generatePdfBuffer(
  job: JobOptions,
  manuscript: ManuscriptInfo,
  chapters: Chapter[],
  watermark: boolean,
): Promise<Buffer> {
  const [width, height] = resolvePageSize(job.publishingTarget);
  const margin = resolveMargin(job.marginSize);
  const bodyFont = resolvePdfFont(job.fontFamily);
  const boldFont = bodyFont === "Times-Roman" ? "Times-Bold" : bodyFont === "Helvetica" ? "Helvetica-Bold" : "Courier-Bold";
  const fontSize = job.fontSize ?? 12;
  const lineGap = resolveLineGap(job.lineSpacing, fontSize);
  const pageNumPos = job.pageNumberPosition ?? "bottom_center";

  const doc = new PDFDocument({
    size: [width, height],
    margins: { top: margin, bottom: margin, left: margin, right: margin },
    bufferPages: true,
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const contentWidth = width - margin * 2;

  // ── Title page ──────────────────────────────────────────
  doc.addPage();
  doc.moveDown(8);
  doc.font(boldFont).fontSize(fontSize + 10).text(manuscript.title, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown(2);
  doc.font(bodyFont).fontSize(fontSize - 2).fillColor("#666").text("Formatted by Etscript", {
    align: "center",
    width: contentWidth,
  });
  doc.fillColor("#000");

  // ── Chapters ────────────────────────────────────────────
  chapters.forEach((chapter, idx) => {
    doc.addPage();

    const label = chapter.title && /^(chapter|part|prologue|epilogue)/i.test(chapter.title)
      ? chapter.title
      : chapterLabel(idx, job.chapterNumberStyle);

    doc.moveDown(4);
    doc.font(boldFont)
      .fontSize(fontSize + (job.theme === "premium" ? 6 : 4))
      .text(label, { align: "center", width: contentWidth });

    if (job.theme === "modern") {
      doc.moveDown(0.5);
      const lineY = doc.y;
      doc.moveTo(margin + contentWidth * 0.2, lineY)
        .lineTo(margin + contentWidth * 0.8, lineY)
        .strokeColor("#aaaaaa")
        .lineWidth(0.5)
        .stroke();
      doc.strokeColor("#000").lineWidth(1);
    } else if (job.theme === "premium") {
      doc.moveDown(0.5);
      doc.font(bodyFont).fontSize(fontSize - 1).fillColor("#888888")
        .text("— \u2756 —", { align: "center", width: contentWidth });
      doc.fillColor("#000");
    }

    doc.moveDown(3);
    doc.font(bodyFont).fontSize(fontSize);

    for (const para of chapter.paragraphs) {
      if (!para.trim()) continue;
      doc.text(para.trim(), {
        align: "justify",
        lineGap,
        width: contentWidth,
        paragraphGap: fontSize * 0.6,
        indent: fontSize,
      });
    }
  });

  // ── Per-page watermark + page numbers ───────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    if (watermark) {
      // Diagonal translucent stamp across the whole page.
      doc.save();
      doc.rotate(-45, { origin: [width / 2, height / 2] });
      doc
        .font(boldFont)
        .fontSize(46)
        .fillColor("#888888")
        .opacity(0.1)
        .text("ETSCRIPT  SAMPLE", width / 2 - 300, height / 2 - 28, {
          width: 600,
          align: "center",
        });
      doc.restore();

      // Footer notice repeated on every page.
      doc.save();
      doc
        .font(bodyFont)
        .fontSize(7.5)
        .fillColor("#999999")
        .opacity(0.95)
        .text(
          "Preview generated with Etscript — purchase to remove this watermark",
          margin,
          height - margin / 2 + 6,
          { width: contentWidth, align: "center" },
        );
      doc.restore();
    }

    if (pageNumPos !== "none" && i !== range.start) {
      const pageNum = String(i - range.start);
      doc.font(bodyFont).fontSize(9).fillColor("#555");

      if (pageNumPos === "top_right") {
        doc.text(pageNum, margin, margin / 2, { align: "right", width: contentWidth });
      } else if (pageNumPos === "bottom_right") {
        doc.text(pageNum, margin, height - margin / 2 - 9, {
          align: "right",
          width: contentWidth,
        });
      } else {
        doc.text(pageNum, margin, height - margin / 2 - 9, {
          align: "center",
          width: contentWidth,
        });
      }
      doc.fillColor("#000");
    }
  }

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

async function generateDocxBuffer(
  job: JobOptions,
  manuscript: ManuscriptInfo,
  chapters: Chapter[],
  watermark: boolean,
): Promise<Buffer> {
  const fontSize = (job.fontSize ?? 12) * 2; // docx uses half-points
  const margin = resolveMargin(job.marginSize);
  const marginTwips = Math.round((margin / 72) * 1440);
  const pageNumPos = job.pageNumberPosition ?? "bottom_center";

  const lineSpacingMap: Record<string, number> = {
    single: 240,
    "1.0": 240,
    "1.15": 276,
    "1.5": 360,
    double: 480,
    "2.0": 480,
  };
  const lineRule = lineSpacingMap[job.lineSpacing ?? ""] ?? 360;

  const bodyAlignment =
    job.bookType === "business" || job.bookType === "academic"
      ? AlignmentType.LEFT
      : AlignmentType.JUSTIFIED;

  const footerAlign =
    pageNumPos === "bottom_right"
      ? AlignmentType.RIGHT
      : AlignmentType.CENTER;

  const sectionChildren: Paragraph[] = [];

  // Title page
  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: "", break: 8 })],
    }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: manuscript.title, bold: true, size: fontSize + 16 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Formatted by Etscript", size: fontSize - 4, color: "888888" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // Chapters
  chapters.forEach((chapter, idx) => {
    const label =
      chapter.title && /^(chapter|part|prologue|epilogue)/i.test(chapter.title)
        ? chapter.title
        : chapterLabel(idx, job.chapterNumberStyle);

    sectionChildren.push(
      new Paragraph({
        children: [new TextRun({ text: "", break: 4 })],
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: label, bold: true, size: fontSize + 8 })],
        spacing: { before: 480, after: 480 },
      }),
    );

    for (const para of chapter.paragraphs) {
      if (!para.trim()) continue;
      sectionChildren.push(
        new Paragraph({
          alignment: bodyAlignment,
          indent: { firstLine: convertInchesToTwip(0.25) },
          spacing: { line: lineRule, after: 120 },
          children: [new TextRun({ text: para.trim(), size: fontSize })],
        }),
      );
    }

    if (idx < chapters.length - 1) {
      sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const footerChildren: Paragraph[] = [];
  if (watermark) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Preview generated with Etscript — purchase to remove this watermark",
            size: 14,
            color: "999999",
            italics: true,
          }),
        ],
      }),
    );
  }
  if (pageNumPos !== "none") {
    footerChildren.push(
      new Paragraph({
        alignment: footerAlign,
        children: [new TextRun({ children: [PageNumber.CURRENT] })],
      }),
    );
  }

  const headers = watermark
    ? {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "ETSCRIPT SAMPLE — PURCHASE TO REMOVE WATERMARK",
                  size: 16,
                  color: "BBBBBB",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      }
    : undefined;

  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },
        headers,
        footers:
          footerChildren.length > 0
            ? { default: new Footer({ children: footerChildren }) }
            : undefined,
        children: sectionChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function buildPreviewHtml(
  manuscript: ManuscriptInfo,
  chapters: Chapter[],
  job: JobOptions,
): string {
  const font = job.fontFamily ?? "Georgia";
  const fontSize = job.fontSize ?? 12;
  const lsMap: Record<string, number> = { "1.0": 1.4, single: 1.4, "1.15": 1.55, "1.5": 1.7, "2.0": 2.2, double: 2.2 };
  const lineHeight = lsMap[job.lineSpacing ?? ""] ?? 1.7;
  const theme = job.theme ?? "classic";

  const chapterDivider =
    theme === "modern"
      ? `<div style="width:60%;height:1px;background:#ccc;margin:0.5em auto 1.5em"></div>`
      : theme === "premium"
        ? `<div style="text-align:center;color:#aaa;font-size:${fontSize - 1}px;margin:0.5em 0 1.5em">&#10006;</div>`
        : "";

  const chapterHeadingSize = theme === "premium" ? fontSize + 6 : fontSize + 4;

  const chaptersHtml = chapters
    .slice(0, 2)
    .map(
      (ch, idx) => `
    <div style="margin-bottom:2em">
      <h2 style="text-align:center;font-family:${font},serif;font-size:${chapterHeadingSize}px;margin-bottom:0.4em;font-weight:bold">
        ${ch.title && /^(chapter|part)/i.test(ch.title) ? ch.title : chapterLabel(idx, job.chapterNumberStyle)}
      </h2>
      ${chapterDivider}
      ${ch.paragraphs
        .slice(0, 4)
        .map(
          (p) =>
            `<p style="text-indent:1.5em;margin:0 0 0.75em;text-align:justify;font-family:${font},serif;font-size:${fontSize}px;line-height:${lineHeight}">${p.trim()}</p>`,
        )
        .join("")}
    </div>`,
    )
    .join('<div style="border:none;border-top:1px solid #eee;margin:2em 0"></div>');

  return `
<div style="max-width:520px;margin:0 auto;padding:2em">
  <h1 style="text-align:center;font-family:${font},serif;font-size:${fontSize + 10}px;margin-bottom:0.25em">${manuscript.title}</h1>
  <p style="text-align:center;color:#888;font-size:11px;margin-bottom:3em">Formatted by Etscript</p>
  ${chaptersHtml}
  ${chapters.length > 2 ? `<p style="text-align:center;color:#999;font-size:11px;margin-top:2em">+ ${chapters.length - 2} more chapter(s) in the downloaded files</p>` : ""}
</div>`;
}

export async function generateFormattedFiles(
  job: JobOptions,
  manuscript: ManuscriptInfo,
): Promise<FormattedResult> {
  let rawText = "";

  if (manuscript.fileKey && manuscript.originalFilename) {
    rawText = await extractText(manuscript.fileKey, manuscript.originalFilename);
  }

  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const chapters = parseChapters(rawText, manuscript.title);
  const previewHtml = buildPreviewHtml(manuscript, chapters, job);

  // Output files are regenerated on demand at download time (autoscale uses an
  // ephemeral disk), so processing only produces the preview and metadata.
  return {
    pdfKey: outputFileKey(job.id, "pdf"),
    docxKey: outputFileKey(job.id, "docx"),
    previewHtml,
    wordCount,
  };
}

export type DocumentFormat = "pdf" | "docx";

export async function generateDocumentBuffer(
  job: JobOptions,
  manuscript: ManuscriptInfo,
  format: DocumentFormat,
  opts: { watermark: boolean },
): Promise<Buffer> {
  let rawText = "";

  if (manuscript.fileKey) {
    const filePath = resolveUploadPath(manuscript.fileKey);
    if (!fileExists(filePath)) {
      throw new MissingUploadError();
    }
    rawText = await extractText(manuscript.fileKey, manuscript.originalFilename ?? "");
  }

  const chapters = parseChapters(rawText, manuscript.title);

  return format === "pdf"
    ? generatePdfBuffer(job, manuscript, chapters, opts.watermark)
    : generateDocxBuffer(job, manuscript, chapters, opts.watermark);
}
