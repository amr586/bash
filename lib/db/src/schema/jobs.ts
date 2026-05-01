import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const jobApplicationsTable = pgTable("job_applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  qualifications: text("qualifications").notNull(),
  cvUrl: text("cv_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
