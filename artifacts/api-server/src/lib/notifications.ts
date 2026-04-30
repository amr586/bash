import { db, notificationsTable, usersTable } from "@workspace/db";
import { eq, inArray, or } from "drizzle-orm";
import type { NotificationType } from "@workspace/db";

const STAFF_ROLES = [
  "super_admin",
  "admin",
  "property_manager",
  "data_entry",
  "support",
] as const;

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  relatedId?: string;
}): Promise<void> {
  await db.insert(notificationsTable).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? "",
    link: params.link ?? null,
    relatedId: params.relatedId ?? null,
  });
}

export async function notifyAllAdmins(params: {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  relatedId?: string;
  excludeUserId?: string;
}): Promise<void> {
  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.isAdmin, true));
  const targets = admins.filter(
    (a) => !params.excludeUserId || a.id !== params.excludeUserId,
  );
  if (targets.length === 0) return;
  await db.insert(notificationsTable).values(
    targets.map((a) => ({
      userId: a.id,
      type: params.type,
      title: params.title,
      body: params.body ?? "",
      link: params.link ?? null,
      relatedId: params.relatedId ?? null,
    })),
  );
}

// Notifies every staff member (admins + super_admin/property_manager/data_entry/support)
export async function notifyAllStaff(params: {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  relatedId?: string;
  excludeUserId?: string;
}): Promise<void> {
  const staff = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      or(
        eq(usersTable.isAdmin, true),
        inArray(usersTable.role, STAFF_ROLES as unknown as string[]),
      ),
    );
  const targets = staff.filter(
    (a) => !params.excludeUserId || a.id !== params.excludeUserId,
  );
  if (targets.length === 0) return;
  await db.insert(notificationsTable).values(
    targets.map((a) => ({
      userId: a.id,
      type: params.type,
      title: params.title,
      body: params.body ?? "",
      link: params.link ?? null,
      relatedId: params.relatedId ?? null,
    })),
  );
}
