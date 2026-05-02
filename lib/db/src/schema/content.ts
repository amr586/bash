import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const jobListingsTable = pgTable(
  "job_listings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    titleAr: varchar("title_ar", { length: 255 }).notNull(),
    titleEn: varchar("title_en", { length: 255 }).notNull().default(""),
    descriptionAr: text("description_ar").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    requirementsAr: text("requirements_ar").default(""),
    requirementsEn: text("requirements_en").default(""),
    location: varchar("location", { length: 255 }).default("التجمع الخامس، القاهرة الجديدة"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

export const portfolioItemsTable = pgTable(
  "portfolio_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    titleAr: varchar("title_ar", { length: 255 }).notNull(),
    titleEn: varchar("title_en", { length: 255 }).notNull().default(""),
    descriptionAr: text("description_ar").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    coverImageUrl: varchar("cover_image_url", { length: 1000 }).default(""),
    images: jsonb("images").notNull().default(sql`'[]'::jsonb`),
    location: varchar("location", { length: 255 }).default(""),
    category: varchar("category", { length: 100 }).default(""),
    yearLabel: varchar("year_label", { length: 50 }).default(""),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: text("sort_order").default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

export const blogPostsTable = pgTable(
  "blog_posts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    titleAr: varchar("title_ar", { length: 500 }).notNull(),
    titleEn: varchar("title_en", { length: 500 }).notNull().default(""),
    excerptAr: text("excerpt_ar").notNull().default(""),
    excerptEn: text("excerpt_en").notNull().default(""),
    coverImageUrl: varchar("cover_image_url", { length: 1000 }).default(""),
    bodyAr: jsonb("body_ar").notNull().default(sql`'[]'::jsonb`),
    bodyEn: jsonb("body_en").notNull().default(sql`'[]'::jsonb`),
    dateLabel: varchar("date_label", { length: 100 }).notNull().default(""),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_blog_slug").on(table.slug)],
);
