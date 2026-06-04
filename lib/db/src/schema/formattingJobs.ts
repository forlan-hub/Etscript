import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { manuscriptsTable } from "./manuscripts";
import { relations } from "drizzle-orm";

export const formattingJobsTable = pgTable("formatting_jobs", {
  id: serial("id").primaryKey(),
  manuscriptId: integer("manuscript_id")
    .notNull()
    .references(() => manuscriptsTable.id, { onDelete: "cascade" }),
  bookType: text("book_type"),
  publishingTarget: text("publishing_target"),
  theme: text("theme"),
  fontFamily: text("font_family"),
  fontSize: integer("font_size"),
  lineSpacing: text("line_spacing"),
  marginSize: text("margin_size"),
  pageNumberPosition: text("page_number_position"),
  chapterNumberStyle: text("chapter_number_style"),
  status: text("status").notNull().default("draft"),
  outputPdfKey: text("output_pdf_key"),
  outputDocxKey: text("output_docx_key"),
  previewText: text("preview_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const formattingJobsRelations = relations(formattingJobsTable, ({ one }) => ({
  manuscript: one(manuscriptsTable, {
    fields: [formattingJobsTable.manuscriptId],
    references: [manuscriptsTable.id],
  }),
}));

export const manuscriptsRelations = relations(manuscriptsTable, ({ many }) => ({
  jobs: many(formattingJobsTable),
}));

export const insertFormattingJobSchema = createInsertSchema(formattingJobsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFormattingJob = z.infer<typeof insertFormattingJobSchema>;
export type FormattingJob = typeof formattingJobsTable.$inferSelect;
