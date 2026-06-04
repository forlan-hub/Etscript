import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const manuscriptsTable = pgTable("manuscripts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  originalFilename: text("original_filename"),
  fileKey: text("file_key"),
  fileSize: integer("file_size"),
  wordCount: integer("word_count"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertManuscriptSchema = createInsertSchema(manuscriptsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertManuscript = z.infer<typeof insertManuscriptSchema>;
export type Manuscript = typeof manuscriptsTable.$inferSelect;
