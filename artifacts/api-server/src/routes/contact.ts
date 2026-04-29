import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  db,
  contactRequestsTable,
  propertiesTable,
} from "@workspace/db";
import { desc, eq, or } from "drizzle-orm";
import { createNotification, notifyAllAdmins } from "../lib/notifications";

const router: IRouter = Router();

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

  const [created] = await db
    .insert(contactRequestsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      reason: parsed.data.reason,
      message: parsed.data.message,
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

  await notifyAllAdmins({
    type: propertyOwnerId
      ? "contact_request_property"
      : "contact_request_general",
    title: propertyOwnerId
      ? "طلب تواصل على عقار"
      : "طلب تواصل جديد",
    body: `${parsed.data.name}${parsed.data.phone ? ` (${parsed.data.phone})` : ""}: ${parsed.data.message.slice(0, 80)}`,
    link: "/admin?tab=contacts",
    relatedId: created.id,
  });

  res.status(201).json({ success: true });
});

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
    })),
  });
});

router.get("/admin/contact-requests", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
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
    })),
  });
});

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
      !req.user.isAdmin &&
      existing.propertyOwnerId !== req.user.id
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
    if (!req.isAuthenticated() || !req.user.isAdmin) {
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

export default router;
