import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const propertyStatusValues = ["pending", "approved", "rejected"] as const;
export type PropertyStatus = (typeof propertyStatusValues)[number];

export const propertyTypeValues = [
  "apartment",
  "villa",
  "office",
  "chalet",
  "shop",
  "land",
] as const;
export type PropertyType = (typeof propertyTypeValues)[number];

export const propertyListingValues = ["sale"] as const;
export type PropertyListing = (typeof propertyListingValues)[number];

export const propertyFinishingValues = [
  "full",
  "semi",
  "three_quarters",
  "super_lux",
] as const;
export type PropertyFinishing = (typeof propertyFinishingValues)[number];

export const propertiesTable = pgTable(
  "properties",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerId: varchar("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    type: varchar("type", { length: 32 }).notNull(),
    listingType: varchar("listing_type", { length: 16 }).notNull(),
    price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
    location: varchar("location", { length: 200 }).notNull().default(""),
    addressDetails: varchar("address_details", { length: 200 }),
    downPayment: varchar("down_payment", { length: 100 }),
    deliveryStatus: varchar("delivery_status", { length: 100 }),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    area: integer("area"),
    floor: integer("floor"),
    furnished: boolean("furnished").notNull().default(false),
    parking: boolean("parking").notNull().default(false),
    elevator: boolean("elevator").notNull().default(false),
    pool: boolean("pool").notNull().default(false),
    garden: boolean("garden").notNull().default(false),
    basement: boolean("basement").notNull().default(false),
    finishing: varchar("finishing", { length: 32 }),
    featured: boolean("featured").notNull().default(false),
    mainImageUrl: varchar("main_image_url", { length: 1000 }),
    imageUrls: text("image_urls").array().notNull().default(sql`ARRAY[]::text[]`),
    floorPlanUrls: text("floor_plan_urls").array().notNull().default(sql`ARRAY[]::text[]`),
    mapsLink: varchar("maps_link", { length: 1000 }),
    contactPhone: varchar("contact_phone", { length: 30 }),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_properties_owner").on(table.ownerId),
    index("idx_properties_status").on(table.status),
    index("idx_properties_type").on(table.type),
    index("idx_properties_listing").on(table.listingType),
    index("idx_properties_featured").on(table.featured),
  ],
);

export type Property = typeof propertiesTable.$inferSelect;
export type NewProperty = typeof propertiesTable.$inferInsert;

export const contactReasonValues = [
  "general",
  "buy",
  "follow_up",
  "partner",
  "sell",
] as const;
export type ContactReason = (typeof contactReasonValues)[number];

export const contactRequestsTable = pgTable(
  "contact_requests",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    reason: varchar("reason", { length: 32 }).notNull().default("general"),
    message: text("message").notNull(),
    propertyId: varchar("property_id").references(() => propertiesTable.id, {
      onDelete: "set null",
    }),
    propertyOwnerId: varchar("property_owner_id").references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_contact_property").on(table.propertyId),
    index("idx_contact_owner").on(table.propertyOwnerId),
    index("idx_contact_created").on(table.createdAt),
  ],
);

export type ContactRequest = typeof contactRequestsTable.$inferSelect;
export type NewContactRequest = typeof contactRequestsTable.$inferInsert;

export const notificationTypeValues = [
  "property_pending_review",
  "property_approved",
  "property_rejected",
  "contact_request_general",
  "contact_request_property",
  "admin_added_property",
] as const;
export type NotificationType = (typeof notificationTypeValues)[number];

export const notificationsTable = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull().default(""),
    link: varchar("link", { length: 500 }),
    relatedId: varchar("related_id"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_notifications_user").on(table.userId, table.isRead),
    index("idx_notifications_created").on(table.createdAt),
  ],
);

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
