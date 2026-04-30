import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  db,
  contactRequestsTable,
  propertiesTable,
} from "@workspace/db";
import { desc, eq, or } from "drizzle-orm";
import {
  createNotification,
  notifyAllAdmins,
  notifyAllStaff,
} from "../lib/notifications";

const router: IRouter = Router();

const STAFF_ROLES = new Set([
  "super_admin",
  "admin",
  "property_manager",
  "data_entry",
  "support",
]);

function isStaff(user: Express.User | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const role = (user as { role?: string }).role;
  return typeof role === "string" && STAFF_ROLES.has(role);
}

const contactInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().trim().min(3).max(30).optional().nullable(),
  reason: z
    .enum(["general", "buy", "partner"])
    .optional()
    .default("general"),
  message: z.string().trim().min(2).max(5000),
  propertyId: z.string().trim().min(1).optional().nullable(),
});

router.post("/contact", async (req: Request, res: Response) => {
  const parsed = contactInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  let propertyOwnerId: string | null = null;
  let propertyTitle: string | null = null;
  if (parsed.data.propertyId) {
    const [prop] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, parsed.data.propertyId));
    if (prop) {
      propertyOwnerId = prop.ownerId;
      propertyTitle = prop.title;
    }
  }

  const senderUserId =
    req.isAuthenticated() && req.user ? req.user.id : null;

  const [created] = await db
    .insert(contactRequestsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      reason: parsed.data.reason,
      message: parsed.data.message,
      userId: senderUserId,
      propertyId: parsed.data.propertyId ?? null,
      propertyOwnerId,
    })
    .returning();

  if (propertyOwnerId) {
    await createNotification({
      userId: propertyOwnerId,
      type: "contact_request_property",
      title: "طلب تواصل جديد على عقارك",
      body: `${parsed.data.name} عايز يتواصل بخصوص "${propertyTitle ?? "عقارك"}".`,
      link: "/dashboard?tab=contact-requests",
      relatedId: created.id,
    });
  }

  // Notify every staff user (super_admin / admin / property_manager / data_entry / support)
  await notifyAllStaff({
    type: propertyOwnerId
      ? "contact_request_property"
      : "contact_request_general",
    title: propertyOwnerId
      ? "طلب تواصل على عقار"
      : "طلب تواصل جديد",
    body: `${parsed.data.name}${parsed.data.phone ? ` (${parsed.data.phone})` : ""}: ${parsed.data.message.slice(0, 80)}`,
    link: "/dashboard?tab=contact-requests",
    relatedId: created.id,
    excludeUserId: senderUserId ?? undefined,
  });

  res.status(201).json({ success: true });
});

// Requests on the *current user's listings* (existing behavior, unchanged)
router.get("/me/contact-requests", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select({
      id: contactRequestsTable.id,
      name: contactRequestsTable.name,
      email: contactRequestsTable.email,
      phone: contactRequestsTable.phone,
      message: contactRequestsTable.message,
      propertyId: contactRequestsTable.propertyId,
      isRead: contactRequestsTable.isRead,
      createdAt: contactRequestsTable.createdAt,
      replyMessage: contactRequestsTable.replyMessage,
      repliedAt: contactRequestsTable.repliedAt,
      propertyTitle: propertiesTable.title,
    })
    .from(contactRequestsTable)
    .leftJoin(
      propertiesTable,
      eq(contactRequestsTable.propertyId, propertiesTable.id),
    )
    .where(eq(contactRequestsTable.propertyOwnerId, req.user.id))
    .orderBy(desc(contactRequestsTable.createdAt));

  res.json({
    contactRequests: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
    })),
  });
});

// Requests *sent by* the current user (so they can see admin replies)
router.get(
  "/me/sent-contact-requests",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const rows = await db
      .select({
        id: contactRequestsTable.id,
        name: contactRequestsTable.name,
        email: contactRequestsTable.email,
        phone: contactRequestsTable.phone,
        reason: contactRequestsTable.reason,
        message: contactRequestsTable.message,
        propertyId: contactRequestsTable.propertyId,
        isRead: contactRequestsTable.isRead,
        createdAt: contactRequestsTable.createdAt,
        replyMessage: contactRequestsTable.replyMessage,
        repliedAt: contactRequestsTable.repliedAt,
        propertyTitle: propertiesTable.title,
      })
      .from(contactRequestsTable)
      .leftJoin(
        propertiesTable,
        eq(contactRequestsTable.propertyId, propertiesTable.id),
      )
      .where(eq(contactRequestsTable.userId, req.user.id))
      .orderBy(desc(contactRequestsTable.createdAt));

    res.json({
      contactRequests: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
      })),
    });
  },
);

// Full list for staff (super_admin / admin / property_manager / data_entry / support)
router.get("/admin/contact-requests", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !isStaff(req.user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db
    .select({
      id: contactRequestsTable.id,
      name: contactRequestsTable.name,
      email: contactRequestsTable.email,
      phone: contactRequestsTable.phone,
      reason: contactRequestsTable.reason,
      message: contactRequestsTable.message,
      propertyId: contactRequestsTable.propertyId,
      userId: contactRequestsTable.userId,
      isRead: contactRequestsTable.isRead,
      createdAt: contactRequestsTable.createdAt,
      replyMessage: contactRequestsTable.replyMessage,
      repliedAt: contactRequestsTable.repliedAt,
      propertyTitle: propertiesTable.title,
    })
    .from(contactRequestsTable)
    .leftJoin(
      propertiesTable,
      eq(contactRequestsTable.propertyId, propertiesTable.id),
    )
    .orderBy(desc(contactRequestsTable.createdAt));

  res.json({
    contactRequests: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
    })),
  });
});

const replySchema = z.object({
  replyMessage: z.string().trim().min(1).max(5000),
});

// Staff reply to a contact request — saves the reply and notifies the sender
router.post(
  "/admin/contact-requests/:id/reply",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !isStaff(req.user)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const [existing] = await db
      .select()
      .from(contactRequestsTable)
      .where(eq(contactRequestsTable.id, req.params.id));
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const now = new Date();
    await db
      .update(contactRequestsTable)
      .set({
        replyMessage: parsed.data.replyMessage,
        repliedAt: now,
        repliedById: req.user.id,
        isRead: true,
      })
      .where(eq(contactRequestsTable.id, req.params.id));

    if (existing.userId) {
      await createNotification({
        userId: existing.userId,
        type: "contact_request_reply",
        title: "فريق الدعم رد على طلبك",
        body: parsed.data.replyMessage.slice(0, 120),
        link: "/dashboard?tab=my-contact-requests",
        relatedId: existing.id,
      });
    }

    res.json({
      success: true,
      contactRequest: {
        id: existing.id,
        replyMessage: parsed.data.replyMessage,
        repliedAt: now.toISOString(),
        isRead: true,
      },
    });
  },
);

router.patch(
  "/contact-requests/:id/read",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const [existing] = await db
      .select()
      .from(contactRequestsTable)
      .where(eq(contactRequestsTable.id, req.params.id));
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (
      !isStaff(req.user) &&
      existing.propertyOwnerId !== req.user.id &&
      existing.userId !== req.user.id
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db
      .update(contactRequestsTable)
      .set({ isRead: true })
      .where(eq(contactRequestsTable.id, req.params.id));
    res.json({ success: true });
  },
);

router.delete(
  "/admin/contact-requests/:id",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !isStaff(req.user)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db
      .delete(contactRequestsTable)
      .where(eq(contactRequestsTable.id, req.params.id));
    res.json({ success: true });
  },
);

// keep `or` import in use even if unused above
void or;
void notifyAllAdmins;

export default router;
