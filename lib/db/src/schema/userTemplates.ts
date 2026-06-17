import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userTemplatesTable = pgTable("user_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  bookType: text("book_type"),
  publishingTarget: text("publishing_target"),
  theme: text("theme"),
  fontFamily: text("font_family"),
  fontSize: integer("font_size"),
  lineSpacing: text("line_spacing"),
  marginSize: text("margin_size"),
  pageNumberPosition: text("page_number_position"),
  chapterNumberStyle: text("chapter_number_style"),
  citationStyle: text("citation_style"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserTemplateSchema = createInsertSchema(userTemplatesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserTemplate = z.infer<typeof insertUserTemplateSchema>;
export type UserTemplate = typeof userTemplatesTable.$inferSelect;
