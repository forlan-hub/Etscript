import PDFDocument from "pdfkit";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  Footer,
  PageNumber,
  SectionType,
  convertInchesToTwip,
  PageBreak,
} from "docx";
import mammoth from "mammoth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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
  showBranding: boolean | null;
  citationStyle: string | null;
  letterData: string | null;
  editedContent?: string | null;
};

type LetterContent = {
  letterType: string;
  date: string;
  senderName: string;
  senderTitle: string;
  senderOrg: string;
  senderAddress: string;
  recipientName: string;
  recipientTitle: string;
  recipientOrg: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  bodyParagraphs: string[];
  closing: string;
  signatoryName: string;
  signatoryTitle: string;
};

const ACADEMIC_TYPES = new Set([
  "undergraduate_project", "hnd_project", "masters_thesis", "phd_thesis",
  "dissertation", "research_paper", "journal_article", "seminar_paper", "conference_paper",
]);

const BUSINESS_TYPES = new Set([
  "company_profile", "business_proposal", "business_plan", "feasibility_report",
  "annual_report", "corporate_training_manual", "internal_report",
  "consultancy_report", "market_research_report", "strategic_plan",
]);

function getDocumentSuite(bookType: string | null): "publishing" | "academic" | "business" | "letters" {
  if (!bookType) return "publishing";
  if (bookType.startsWith("letter_")) return "letters";
  if (ACADEMIC_TYPES.has(bookType)) return "academic";
  if (BUSINESS_TYPES.has(bookType)) return "business";
  return "publishing";
}

const CITATION_STYLE_LABELS: Record<string, string> = {
  apa7: "APA 7th Edition",
  mla: "MLA",
  harvard: "Harvard",
  chicago: "Chicago",
  ieee: "IEEE",
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

/** Thrown when a manuscript references an uploaded file that is gone from storage. */
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

/** True when a title string is a recognised chapter/section heading. */
function isChapterHeading(title: string): boolean {
  return /^(chapter|part|section|prologue|epilogue|introduction|preface|foreword|afterword)/i.test(
    title.trim(),
  );
}

type TitlePageContent = {
  bookTitle: string | null;
  subLines: string[];
  bodyChapters: Chapter[];
};

/**
 * Extracts title-page content from parsed chapters.
 *
 * Two cases:
 * 1. The first parsed section has no chapter heading — it is a preamble; all its
 *    paragraphs become the title page (first line = book title, rest = sub-lines).
 * 2. The first section IS a chapter — scan its leading paragraphs for lines that
 *    look like title-page material (short, ALL-CAPS, or attribution keywords) and
 *    extract them, leaving the remainder as chapter body text.
 *
 * manuscript.title (the user's upload label) is never used in the formatted output.
 */
function extractTitlePage(chapters: Chapter[]): TitlePageContent {
  if (chapters.length === 0) {
    return { bookTitle: null, subLines: [], bodyChapters: [] };
  }

  const first = chapters[0];
  const lines: string[] = [];
  let bodyChapters: Chapter[];

  if (!isChapterHeading(first.title)) {
    // Pre-chapter preamble — all paragraphs are title-page material
    lines.push(...first.paragraphs.filter((p) => p.trim().length > 0));
    bodyChapters = chapters.slice(1);
  } else {
    // First section is a chapter — extract leading title-like paragraphs
    let splitIdx = 0;
    for (let i = 0; i < Math.min(first.paragraphs.length, 10); i++) {
      const para = first.paragraphs[i].trim();
      const wordCount = para.split(/\s+/).filter(Boolean).length;
      const isTitleContent =
        wordCount <= 10 ||
        /^[A-Z\d\s:—–.,'"!?]+$/.test(para) ||
        /^(by|copyright|©|\d{4}|all rights|dedicated to|isbn|published by)/i.test(para);

      if (isTitleContent && wordCount <= 20) {
        lines.push(para);
        splitIdx = i + 1;
      } else {
        break;
      }
    }

    if (lines.length > 0) {
      bodyChapters = [
        { title: first.title, paragraphs: first.paragraphs.slice(splitIdx) },
        ...chapters.slice(1),
      ];
    } else {
      bodyChapters = chapters;
    }
  }

  if (lines.length === 0) {
    return { bookTitle: null, subLines: [], bodyChapters };
  }

  const [bookTitle, ...subLines] = lines;
  return { bookTitle, subLines, bodyChapters };
}

const SAMPLE_PARAGRAPHS = [
  "The morning light filtered through the tall windows of the study, casting long golden bars across the worn oak floor. Dust motes danced in the air, suspended in that particular stillness that precedes great events. Outside, the city was already stirring — the faint clatter of carts on cobblestones, a vendor's distant call — but here, within these four walls lined with books, time moved differently.",
  "She had read the letter three times before she allowed herself to believe it. The handwriting was unmistakable, a cramped and urgent scrawl she had not seen in seven years. Seven years of silence, of wondering, of slowly learning to stop wondering. And now this.",
  "He set the letter down on the desk and walked to the window. The garden below was overgrown, just as she had always let it grow — wild roses tumbling over the iron fence, lavender spilling onto the path. He had never understood why she preferred it that way. Now, perhaps, he was beginning to.",
  "There are moments when the past reaches forward and places its hand on your shoulder. You turn, expecting to see someone there, and find only air. But the weight of that hand remains, and you carry it with you for the rest of the day.",
  "The journey back would take three days if the roads were good. They had not been good in years. He packed only what he could carry, which turned out to be far less than he had imagined, and far more than he needed.",
];

function outputFileKey(jobId: number, format: "pdf" | "docx"): string {
  return `jobs/${jobId}/formatted.${format}`;
}

async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = (filename ?? "").toLowerCase().split(".").pop();

  if (ext === "txt") {
    return buffer.toString("utf-8");
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return "";
}

async function downloadManuscriptBuffer(fileKey: string): Promise<Buffer> {
  const service = new ObjectStorageService();
  let objectFile;
  try {
    objectFile = await service.getObjectEntityFile(fileKey);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) throw new MissingUploadError();
    throw err;
  }
  const [contents] = await objectFile.download();
  return contents;
}

/**
 * Parses academic/business documents that use numbered section headings
 * (e.g. "1.0 Introduction", "1.1 Background", "2.0 Literature Review").
 * Falls back to the chapter parser when no numbered headings are found.
 */
function parseAcademicSections(text: string, title: string): Chapter[] {
  if (!text.trim()) {
    return [
      { title: "1.0 Introduction", paragraphs: SAMPLE_PARAGRAPHS.slice(0, 3) },
      { title: "2.0 Main Content", paragraphs: SAMPLE_PARAGRAPHS.slice(2) },
    ];
  }

  // Matches: "1.0 Title", "1.1 Background", "2.0 Methodology", "ABSTRACT", "REFERENCES"
  const sectionRegex =
    /^((\d+\.)+\d*\s+\S|abstract|references?|bibliography|acknowledgements?|appendix\s*\w*|conclusion|introduction|chapter\s+[\w]+|part\s+[\w]+)/im;

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
    if (sectionRegex.test(trimmed)) {
      flushBuffer();
      if (currentTitle || currentParagraphs.length > 0) {
        chapters.push({ title: currentTitle || title, paragraphs: currentParagraphs });
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
    chapters.push({ title: currentTitle || title, paragraphs: currentParagraphs });
  }

  if (chapters.length === 0) {
    return parseChapters(text, title);
  }

  return chapters;
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

function resolvePageSize(publishingTarget: string | null): [number, number] {
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
  const boldFont =
    bodyFont === "Times-Roman"
      ? "Times-Bold"
      : bodyFont === "Helvetica"
        ? "Helvetica-Bold"
        : "Courier-Bold";
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

  const { bookTitle, subLines, bodyChapters } = extractTitlePage(chapters);

  // ── Title page ──────────────────────────────────────────
  doc.addPage();
  doc.moveDown(8);

  if (bookTitle) {
    doc.font(boldFont).fontSize(fontSize + 10).text(bookTitle, {
      align: "center",
      width: contentWidth,
    });
  }

  if (subLines.length > 0) {
    doc.moveDown(bookTitle ? 1.5 : 0);
    for (const para of subLines) {
      doc
        .font(bodyFont)
        .fontSize(fontSize - 1)
        .fillColor("#555555")
        .text(para.trim(), { align: "center", width: contentWidth });
      doc.moveDown(0.4);
    }
    doc.fillColor("#000000");
  }

  // ── Body chapters ────────────────────────────────────────────
  bodyChapters.forEach((chapter, idx) => {
    doc.addPage();

    // Use the detected chapter heading as-is; only generate a label when
    // the chapter was extracted without a heading (e.g. plain-text files).
    const label = isChapterHeading(chapter.title)
      ? chapter.title
      : chapterLabel(idx, job.chapterNumberStyle);

    doc.moveDown(4);
    doc
      .font(boldFont)
      .fontSize(fontSize + (job.theme === "premium" ? 6 : 4))
      .text(label, { align: "center", width: contentWidth });

    if (job.theme === "modern") {
      doc.moveDown(0.5);
      const lineY = doc.y;
      doc
        .moveTo(margin + contentWidth * 0.2, lineY)
        .lineTo(margin + contentWidth * 0.8, lineY)
        .strokeColor("#aaaaaa")
        .lineWidth(0.5)
        .stroke();
      doc.strokeColor("#000").lineWidth(1);
    } else if (job.theme === "premium") {
      doc.moveDown(0.5);
      doc
        .font(bodyFont)
        .fontSize(fontSize - 1)
        .fillColor("#888888")
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

  // ── Per-page: diagonal watermark + last-page badge + page numbers ────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const isLastPage = i === range.start + range.count - 1;

    if (watermark) {
      doc.save();
      doc.translate(width / 2, height / 2);
      doc.rotate(-45);
      doc
        .font(boldFont)
        .fontSize(52)
        .fillColor("#c0c0c0")
        .opacity(0.22)
        .text("PREVIEW", -200, -30, { width: 400, align: "center", lineBreak: false });
      doc.restore();
    }

    if (job.showBranding !== false && isLastPage) {
      const badgeY = pageNumPos === "none" ? height - margin / 2 - 9 : height - margin / 2 - 22;
      doc
        .font(bodyFont)
        .fontSize(7.5)
        .fillColor("#c8c8c8")
        .text("Formatted with Etscript", margin, badgeY, {
          width: contentWidth,
          align: "center",
        });
      doc.fillColor("#000");
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
  const fontSize = (job.fontSize ?? 12) * 2;
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

  const suite = getDocumentSuite(job.bookType);
  const bodyAlignment =
    suite === "academic" || suite === "business"
      ? AlignmentType.LEFT
      : AlignmentType.JUSTIFIED;

  const footerAlign =
    pageNumPos === "bottom_right" ? AlignmentType.RIGHT : AlignmentType.CENTER;

  const { bookTitle, subLines, bodyChapters } = extractTitlePage(chapters);

  const sectionChildren: Paragraph[] = [];

  // Title page — spacer + book title from document content (not upload label)
  sectionChildren.push(new Paragraph({ children: [new TextRun({ text: "", break: 8 })] }));

  if (bookTitle) {
    sectionChildren.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: bookTitle, bold: true, size: fontSize + 16 })],
      }),
    );
  }

  // Sub-lines (author, subtitle, copyright, etc.)
  for (const para of subLines) {
    sectionChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: para.trim(), size: fontSize - 4, color: "555555" })],
        spacing: { before: 120 },
      }),
    );
  }

  sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // Body chapters — use detected heading as-is; only generate a label when
  // no chapter heading was present in the source text.
  bodyChapters.forEach((chapter, idx) => {
    const label = isChapterHeading(chapter.title)
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

    if (idx < bodyChapters.length - 1) {
      sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  // Attribution badge at end of document (last page)
  if (job.showBranding !== false) {
    sectionChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Formatted with Etscript", size: 16, color: "C8C8C8" })],
        spacing: { before: 960 },
      }),
    );
  }

  // Footer: watermark text + page number
  const footerChildren: Paragraph[] = [];
  if (watermark) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "PREVIEW — Purchase to remove this watermark",
            size: 20,
            color: "BBBBBB",
            bold: true,
          }),
        ],
        spacing: { after: 120 },
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
  const lsMap: Record<string, number> = {
    "1.0": 1.4,
    single: 1.4,
    "1.15": 1.55,
    "1.5": 1.7,
    "2.0": 2.2,
    double: 2.2,
  };
  const lineHeight = lsMap[job.lineSpacing ?? ""] ?? 1.7;
  const theme = job.theme ?? "classic";

  const chapterDivider =
    theme === "modern"
      ? `<div style="width:60%;height:1px;background:#ccc;margin:0.5em auto 1.5em"></div>`
      : theme === "premium"
        ? `<div style="text-align:center;color:#aaa;font-size:${fontSize - 1}px;margin:0.5em 0 1.5em">&#10006;</div>`
        : "";

  const chapterHeadingSize = theme === "premium" ? fontSize + 6 : fontSize + 4;

  const { bookTitle, subLines, bodyChapters } = extractTitlePage(chapters);

  const subLinesHtml = subLines
    .map(
      (p) =>
        `<p style="text-align:center;color:#666;font-family:${font},serif;font-size:${fontSize - 1}px;margin:0.2em 0">${p.trim()}</p>`,
    )
    .join("");

  const titleBlockHtml = bookTitle
    ? `<h1 style="text-align:center;font-family:${font},serif;font-size:${fontSize + 10}px;margin-bottom:0.25em;font-weight:bold">${bookTitle}</h1>${subLinesHtml}`
    : subLinesHtml;

  const chaptersHtml = bodyChapters
    .slice(0, 2)
    .map(
      (ch, idx) => `
    <div style="margin-bottom:2em">
      <h2 style="text-align:center;font-family:${font},serif;font-size:${chapterHeadingSize}px;margin-bottom:0.4em;font-weight:bold">
        ${isChapterHeading(ch.title) ? ch.title : chapterLabel(idx, job.chapterNumberStyle)}
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

  const brandingHtml =
    job.showBranding !== false
      ? `<p style="text-align:center;color:#ccc;font-size:10px;margin:2em 0 0">Formatted with Etscript</p>`
      : "";

  return `
<div style="max-width:520px;margin:0 auto;padding:2em">
  ${titleBlockHtml}
  <div style="margin-top:3em">${chaptersHtml}</div>
  ${bodyChapters.length > 2 ? `<p style="text-align:center;color:#999;font-size:11px;margin-top:2em">+ ${bodyChapters.length - 2} more chapter(s) in the downloaded files</p>` : ""}
  ${brandingHtml}
</div>`;
}

// ── Letter formatters ────────────────────────────────────────────────────────

function parseLetterData(raw: string | null): LetterContent | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LetterContent;
  } catch {
    return null;
  }
}

async function generateLetterPdfBuffer(
  job: JobOptions,
  letter: LetterContent,
  watermark: boolean,
): Promise<Buffer> {
  const [width, height] = [595.28, 841.89]; // A4
  const margin = resolveMargin(job.marginSize);
  const bodyFont = resolvePdfFont(job.fontFamily);
  const boldFont =
    bodyFont === "Times-Roman"
      ? "Times-Bold"
      : bodyFont === "Helvetica"
        ? "Helvetica-Bold"
        : "Courier-Bold";
  const fontSize = job.fontSize ?? 12;
  const lineGap = resolveLineGap("1.5", fontSize);
  const contentWidth = width - margin * 2;

  const doc = new PDFDocument({
    size: [width, height],
    margins: { top: margin, bottom: margin, left: margin, right: margin },
    bufferPages: true,
    autoFirstPage: true,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // ── Sender block (top-left) ──────────────────────────────────────────────
  doc.font(boldFont).fontSize(fontSize).text(letter.senderOrg, margin, margin, { width: contentWidth * 0.6 });
  if (letter.senderName) {
    doc.font(bodyFont).fontSize(fontSize - 1).text(letter.senderName, { width: contentWidth * 0.6 });
  }
  if (letter.senderTitle) {
    doc.font(bodyFont).fontSize(fontSize - 1).text(letter.senderTitle, { width: contentWidth * 0.6 });
  }
  if (letter.senderAddress) {
    doc.font(bodyFont).fontSize(fontSize - 1).fillColor("#555").text(letter.senderAddress, { width: contentWidth * 0.6 });
    doc.fillColor("#000");
  }

  // ── Date (right-aligned) ────────────────────────────────────────────────
  doc.font(bodyFont).fontSize(fontSize).text(letter.date, margin, margin, {
    width: contentWidth,
    align: "right",
  });

  doc.moveDown(2);

  // ── Recipient block ──────────────────────────────────────────────────────
  doc.font(boldFont).fontSize(fontSize).text(letter.recipientName, { lineGap: 2 });
  doc.font(bodyFont);
  if (letter.recipientTitle) doc.text(letter.recipientTitle, { lineGap: 2 });
  if (letter.recipientOrg) doc.text(letter.recipientOrg, { lineGap: 2 });
  if (letter.recipientAddress) doc.fillColor("#555").text(letter.recipientAddress, { lineGap: 2 }).fillColor("#000");

  doc.moveDown(1.2);

  // ── Subject line ─────────────────────────────────────────────────────────
  doc.font(boldFont).fontSize(fontSize).text(letter.subject);
  doc.moveDown(0.8);

  // ── Salutation ───────────────────────────────────────────────────────────
  doc.font(bodyFont).fontSize(fontSize).text(letter.salutation);
  doc.moveDown(0.5);

  // ── Body paragraphs ──────────────────────────────────────────────────────
  for (const para of letter.bodyParagraphs) {
    if (!para.trim()) continue;
    doc.font(bodyFont).fontSize(fontSize).text(para.trim(), { lineGap, paragraphGap: fontSize * 0.5 });
    doc.moveDown(0.5);
  }

  doc.moveDown(0.5);

  // ── Closing ──────────────────────────────────────────────────────────────
  doc.font(bodyFont).fontSize(fontSize).text(letter.closing);
  doc.moveDown(3);

  // ── Signatory ────────────────────────────────────────────────────────────
  doc.font(boldFont).fontSize(fontSize).text(letter.signatoryName);
  if (letter.signatoryTitle) {
    doc.font(bodyFont).fontSize(fontSize - 1).fillColor("#555").text(letter.signatoryTitle);
    doc.fillColor("#000");
  }

  // ── Attribution + watermark ──────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (watermark) {
      doc.save();
      doc.translate(width / 2, height / 2);
      doc.rotate(-45);
      doc.font(boldFont).fontSize(52).fillColor("#c0c0c0").opacity(0.22)
        .text("PREVIEW", -200, -30, { width: 400, align: "center", lineBreak: false });
      doc.restore();
    }
    if (job.showBranding !== false && i === range.start + range.count - 1) {
      doc.font(bodyFont).fontSize(7.5).fillColor("#c8c8c8")
        .text("Formatted with Etscript", margin, height - margin / 2 - 9, { width: contentWidth, align: "center" });
      doc.fillColor("#000");
    }
  }

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

async function generateLetterDocxBuffer(
  job: JobOptions,
  letter: LetterContent,
  watermark: boolean,
): Promise<Buffer> {
  const fontSize = (job.fontSize ?? 12) * 2;
  const margin = resolveMargin(job.marginSize);
  const marginTwips = Math.round((margin / 72) * 1440);

  const children: Paragraph[] = [];

  // Sender block
  children.push(
    new Paragraph({ children: [new TextRun({ text: letter.senderOrg, bold: true, size: fontSize })] }),
  );
  if (letter.senderName) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.senderName, size: fontSize - 2 })] }));
  }
  if (letter.senderTitle) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.senderTitle, size: fontSize - 2 })] }));
  }
  if (letter.senderAddress) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.senderAddress, size: fontSize - 2, color: "555555" })] }));
  }

  // Date (right-aligned)
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: letter.date, size: fontSize })],
      spacing: { before: 240, after: 480 },
    }),
  );

  // Recipient block
  children.push(
    new Paragraph({ children: [new TextRun({ text: letter.recipientName, bold: true, size: fontSize })] }),
  );
  if (letter.recipientTitle) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.recipientTitle, size: fontSize })] }));
  }
  if (letter.recipientOrg) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.recipientOrg, size: fontSize })] }));
  }
  if (letter.recipientAddress) {
    children.push(new Paragraph({ children: [new TextRun({ text: letter.recipientAddress, size: fontSize, color: "555555" })] }));
  }

  // Subject line
  children.push(
    new Paragraph({
      children: [new TextRun({ text: letter.subject, bold: true, size: fontSize })],
      spacing: { before: 360, after: 240 },
    }),
  );

  // Salutation
  children.push(
    new Paragraph({
      children: [new TextRun({ text: letter.salutation, size: fontSize })],
      spacing: { after: 240 },
    }),
  );

  // Body paragraphs
  for (const para of letter.bodyParagraphs) {
    if (!para.trim()) continue;
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: para.trim(), size: fontSize })],
        spacing: { line: 360, after: 240 },
      }),
    );
  }

  // Closing
  children.push(
    new Paragraph({
      children: [new TextRun({ text: letter.closing, size: fontSize })],
      spacing: { before: 360, after: 960 },
    }),
  );

  // Signatory
  children.push(
    new Paragraph({ children: [new TextRun({ text: letter.signatoryName, bold: true, size: fontSize })] }),
  );
  if (letter.signatoryTitle) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: letter.signatoryTitle, size: fontSize - 2, color: "555555" })] }),
    );
  }

  if (job.showBranding !== false) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Formatted with Etscript", size: 16, color: "C8C8C8" })],
        spacing: { before: 960 },
      }),
    );
  }

  const footerChildren: Paragraph[] = [];
  if (watermark) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PREVIEW — Purchase to remove this watermark", size: 20, color: "BBBBBB", bold: true })],
      }),
    );
  }

  const docx = new Document({
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: { margin: { top: marginTwips, bottom: marginTwips, left: marginTwips, right: marginTwips } },
      },
      footers: footerChildren.length > 0 ? { default: new Footer({ children: footerChildren }) } : undefined,
      children,
    }],
  });

  return Packer.toBuffer(docx);
}

function buildLetterPreviewHtml(letter: LetterContent, job: JobOptions): string {
  const font = job.fontFamily ?? "Times New Roman";
  const fontSize = job.fontSize ?? 12;

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const senderBlock = [
    `<strong>${esc(letter.senderOrg)}</strong>`,
    letter.senderName ? esc(letter.senderName) : "",
    letter.senderTitle ? esc(letter.senderTitle) : "",
    letter.senderAddress ? `<span style="color:#666">${esc(letter.senderAddress)}</span>` : "",
  ]
    .filter(Boolean)
    .map((l) => `<div>${l}</div>`)
    .join("");

  const recipientBlock = [
    `<strong>${esc(letter.recipientName)}</strong>`,
    letter.recipientTitle ? esc(letter.recipientTitle) : "",
    letter.recipientOrg ? esc(letter.recipientOrg) : "",
    letter.recipientAddress ? `<span style="color:#666">${esc(letter.recipientAddress)}</span>` : "",
  ]
    .filter(Boolean)
    .map((l) => `<div>${l}</div>`)
    .join("");

  const bodyHtml = letter.bodyParagraphs
    .map((p) => `<p style="margin:0 0 0.8em;text-align:justify">${esc(p)}</p>`)
    .join("");

  const brandingHtml =
    job.showBranding !== false
      ? `<p style="text-align:center;color:#ccc;font-size:10px;margin:2em 0 0">Formatted with Etscript</p>`
      : "";

  return `
<div style="max-width:520px;margin:0 auto;padding:2em;font-family:${esc(font)},serif;font-size:${fontSize}px;line-height:1.6">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2em">
    <div style="font-size:${fontSize}px">${senderBlock}</div>
    <div style="font-size:${fontSize}px;text-align:right">${esc(letter.date)}</div>
  </div>
  <div style="margin-bottom:1.5em;font-size:${fontSize}px">${recipientBlock}</div>
  <p style="font-weight:bold;margin:0 0 1em;font-size:${fontSize}px">${esc(letter.subject)}</p>
  <p style="margin:0 0 0.8em;font-size:${fontSize}px">${esc(letter.salutation)}</p>
  <div style="font-size:${fontSize}px">${bodyHtml}</div>
  <p style="margin:1.5em 0 3em;font-size:${fontSize}px">${esc(letter.closing)}</p>
  <div style="font-size:${fontSize}px">
    <strong>${esc(letter.signatoryName)}</strong>
    ${letter.signatoryTitle ? `<div style="color:#555;font-size:${fontSize - 1}px">${esc(letter.signatoryTitle)}</div>` : ""}
  </div>
  ${brandingHtml}
</div>`;
}

/** Parse TipTap-generated HTML back into chapters. */
function parseHtmlToChapters(html: string): Chapter[] {
  const decode = (s: string): string =>
    s
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();

  const tokenRe = /<(h1|h2|h3|p)(?:\s[^>]*)?>([^]*?)<\/\1>/gi;
  const tokens: Array<{ tag: string; text: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(html)) !== null) {
    const text = decode(m[2]);
    if (text) tokens.push({ tag: m[1].toLowerCase(), text });
  }

  const chapters: Chapter[] = [];
  let currentTitle = "";
  let currentParagraphs: string[] = [];

  for (const token of tokens) {
    if (token.tag === "h1") {
      if (currentParagraphs.length > 0 || currentTitle) {
        chapters.push({ title: currentTitle, paragraphs: currentParagraphs });
      }
      currentTitle = "";
      currentParagraphs = [token.text];
    } else if (token.tag === "h2" || token.tag === "h3") {
      if (currentParagraphs.length > 0 || currentTitle) {
        chapters.push({ title: currentTitle, paragraphs: currentParagraphs });
      }
      currentTitle = token.text;
      currentParagraphs = [];
    } else {
      currentParagraphs.push(token.text);
    }
  }

  if (currentTitle || currentParagraphs.length > 0) {
    chapters.push({ title: currentTitle, paragraphs: currentParagraphs });
  }

  return chapters;
}

/** Build clean TipTap-editable HTML from extracted title-page content. */
function buildEditorHtml(titlePage: TitlePageContent): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const parts: string[] = [];
  if (titlePage.bookTitle) parts.push(`<h1>${esc(titlePage.bookTitle)}</h1>`);
  for (const line of titlePage.subLines) parts.push(`<p>${esc(line)}</p>`);
  for (const ch of titlePage.bodyChapters) {
    parts.push(`<h2>${esc(ch.title)}</h2>`);
    for (const para of ch.paragraphs) parts.push(`<p>${esc(para)}</p>`);
  }

  return parts.join("\n");
}

export async function generateFormattedFiles(
  job: JobOptions,
  manuscript: ManuscriptInfo,
): Promise<FormattedResult> {
  const suite = getDocumentSuite(job.bookType);

  // ── Letter suite: use structured letter data, no manuscript file needed ──
  if (suite === "letters") {
    const letter = parseLetterData(job.letterData);
    const previewHtml = letter
      ? buildLetterPreviewHtml(letter, job)
      : `<p style="color:#999;font-style:italic;padding:2em">Letter data not found.</p>`;
    const wordCount = letter
      ? letter.bodyParagraphs.join(" ").split(/\s+/).filter(Boolean).length
      : 0;
    return { pdfKey: outputFileKey(job.id, "pdf"), docxKey: outputFileKey(job.id, "docx"), previewHtml, wordCount };
  }

  let chapters: Chapter[];
  let wordCount = 0;

  if (job.editedContent) {
    chapters = parseHtmlToChapters(job.editedContent);
    wordCount = chapters
      .flatMap((c) => c.paragraphs)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
  } else {
    let rawText = "";
    if (manuscript.fileKey && manuscript.originalFilename) {
      try {
        const fileBuffer = await downloadManuscriptBuffer(manuscript.fileKey);
        rawText = await extractTextFromBuffer(fileBuffer, manuscript.originalFilename);
      } catch (err) {
        if (!(err instanceof MissingUploadError)) throw err;
      }
    }
    wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
    chapters =
      suite === "academic" || suite === "business"
        ? parseAcademicSections(rawText, manuscript.title)
        : parseChapters(rawText, manuscript.title);
  }

  const previewHtml = buildPreviewHtml(manuscript, chapters, job);

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
  const suite = getDocumentSuite(job.bookType);

  // ── Letter suite: generate from structured letter data ───────────────────
  if (suite === "letters") {
    const letter = parseLetterData(job.letterData);
    if (!letter) throw new Error("Letter data missing or malformed");
    return format === "pdf"
      ? generateLetterPdfBuffer(job, letter, opts.watermark)
      : generateLetterDocxBuffer(job, letter, opts.watermark);
  }

  let chapters: Chapter[];

  if (job.editedContent) {
    chapters = parseHtmlToChapters(job.editedContent);
  } else {
    let rawText = "";
    if (manuscript.fileKey) {
      const fileBuffer = await downloadManuscriptBuffer(manuscript.fileKey);
      rawText = await extractTextFromBuffer(fileBuffer, manuscript.originalFilename ?? "");
    }
    chapters =
      suite === "academic" || suite === "business"
        ? parseAcademicSections(rawText, manuscript.title)
        : parseChapters(rawText, manuscript.title);
  }

  return format === "pdf"
    ? generatePdfBuffer(job, manuscript, chapters, opts.watermark)
    : generateDocxBuffer(job, manuscript, chapters, opts.watermark);
}

/** Generate clean editor HTML from the manuscript source for the first-time editor load. */
export async function generateEditorContent(
  manuscript: ManuscriptInfo,
): Promise<{ html: string; wordCount: number }> {
  let rawText = "";
  if (manuscript.fileKey && manuscript.originalFilename) {
    try {
      const fileBuffer = await downloadManuscriptBuffer(manuscript.fileKey);
      rawText = await extractTextFromBuffer(fileBuffer, manuscript.originalFilename);
    } catch (err) {
      if (!(err instanceof MissingUploadError)) throw err;
    }
  }

  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const chapters = parseChapters(rawText, manuscript.title);
  const titlePage = extractTitlePage(chapters);
  const html = buildEditorHtml(titlePage);

  return { html, wordCount };
}
