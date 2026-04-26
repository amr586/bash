import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  db,
  propertiesTable,
  usersTable,
  propertyTypeValues,
  propertyListingValues,
  propertyStatusValues,
} from "@workspace/db";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { createNotification, notifyAllAdmins } from "../lib/notifications";

const router: IRouter = Router();

const STAFF_ROLES = new Set([
  "super_admin",
  "admin",
  "property_manager",
  "data_entry",
]);

function isStaff(user: Express.User | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const role = (user as { role?: string }).role;
  return typeof role === "string" && STAFF_ROLES.has(role);
}

const propertyInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  type: z.enum(propertyTypeValues),
  listingType: z.enum(propertyListingValues),
  price: z.coerce.number().min(0),
  location: z.string().trim().max(200).optional().default(""),
  bedrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  area: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  mainImageUrl: z.string().trim().max(1000).nullable().optional(),
  imageUrls: z.array(z.string().trim().min(1).max(1000)).max(40).optional(),
  floorPlanUrls: z.array(z.string().trim().min(1).max(1000)).max(20).optional(),
  mapsLink: z.string().trim().max(1000).nullable().optional(),
  contactPhone: z.string().trim().max(30).nullable().optional(),
});

function serializeProperty(p: typeof propertiesTable.$inferSelect) {
  return {
    id: p.id,
    ownerId: p.ownerId,
    title: p.title,
    description: p.description,
    type: p.type,
    listingType: p.listingType,
    price: Number(p.price),
    location: p.location,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    mainImageUrl: p.mainImageUrl,
    imageUrls: p.imageUrls ?? [],
    floorPlanUrls: p.floorPlanUrls ?? [],
    mapsLink: p.mapsLink,
    contactPhone: p.contactPhone,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.post("/properties", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = propertyInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const isAdminCreator = isStaff(req.user);
  const initialStatus = isAdminCreator ? "approved" : "pending";

  const [created] = await db
    .insert(propertiesTable)
    .values({
      ownerId: req.user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      type: parsed.data.type,
      listingType: parsed.data.listingType,
      price: String(parsed.data.price),
      location: parsed.data.location ?? "",
      bedrooms: parsed.data.bedrooms ?? null,
      bathrooms: parsed.data.bathrooms ?? null,
      area: parsed.data.area ?? null,
      mainImageUrl:
        parsed.data.mainImageUrl ??
        (parsed.data.imageUrls && parsed.data.imageUrls.length > 0
          ? parsed.data.imageUrls[0]
          : null),
      imageUrls: parsed.data.imageUrls ?? [],
      floorPlanUrls: parsed.data.floorPlanUrls ?? [],
      mapsLink: parsed.data.mapsLink ?? null,
      contactPhone: parsed.data.contactPhone ?? null,
      status: initialStatus,
    })
    .returning();

  if (isAdminCreator) {
    // Admin added a new property — notify all OTHER users so they see new listings
    const others = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(ne(usersTable.id, req.user.id));
    if (others.length > 0) {
      await Promise.all(
        others.map((u) =>
          createNotification({
            userId: u.id,
            type: "admin_added_property",
            title: "عقار جديد على باشاك",
            body: `تمت إضافة عقار جديد: ${created.title}`,
            link: `/dashboard?tab=recommended`,
            relatedId: created.id,
          }),
        ),
      );
    }
  } else {
    // User submitted property — notify all admins for review
    await notifyAllAdmins({
      type: "property_pending_review",
      title: "عقار جديد محتاج مراجعة",
      body: `${[req.user.firstName, req.user.lastName].filter(Boolean).join(" ") || req.user.email || "مستخدم"} أضاف عقار "${created.title}"`,
      link: "/admin?tab=properties",
      relatedId: created.id,
    });
  }

  res.status(201).json({ property: serializeProperty(created) });
});

router.get("/properties", async (req: Request, res: Response) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 24, 1),
    100,
  );
  const typeFilter =
    typeof req.query.type === "string" &&
    (propertyTypeValues as readonly string[]).includes(req.query.type)
      ? eq(propertiesTable.type, req.query.type as (typeof propertyTypeValues)[number])
      : undefined;
  const listingFilter =
    typeof req.query.listingType === "string" &&
    (propertyListingValues as readonly string[]).includes(req.query.listingType)
      ? eq(
          propertiesTable.listingType,
          req.query.listingType as (typeof propertyListingValues)[number],
        )
      : undefined;
  const conds = [eq(propertiesTable.status, "approved")];
  if (typeFilter) conds.push(typeFilter);
  if (listingFilter) conds.push(listingFilter);
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(and(...conds))
    .orderBy(desc(propertiesTable.createdAt))
    .limit(limit);
  res.json({ properties: rows.map(serializeProperty) });
});

router.get("/properties/:id", async (req: Request, res: Response) => {
  const [row] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, req.params.id));
  if (!row || row.status !== "approved") {
    const isOwnerOrAdmin =
      req.isAuthenticated() &&
      row &&
      (req.user.id === row.ownerId || isStaff(req.user));
    if (!row || !isOwnerOrAdmin) {
      res.status(404).json({ error: "Not found" });
      return;
    }
  }
  res.json({ property: serializeProperty(row) });
});

router.get("/me/properties", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.ownerId, req.user.id))
    .orderBy(desc(propertiesTable.createdAt));
  res.json({ properties: rows.map(serializeProperty) });
});

router.get("/me/recommended-properties", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(
      and(
        eq(propertiesTable.status, "approved"),
        ne(propertiesTable.ownerId, req.user.id),
      ),
    )
    .orderBy(sql`random()`)
    .limit(12);
  res.json({ properties: rows.map(serializeProperty) });
});

router.get("/admin/properties", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !isStaff(req.user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const statusFilter = req.query.status;
  const where =
    typeof statusFilter === "string" &&
    (propertyStatusValues as readonly string[]).includes(statusFilter)
      ? eq(propertiesTable.status, statusFilter)
      : undefined;
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(where ?? undefined)
    .orderBy(desc(propertiesTable.createdAt));
  res.json({ properties: rows.map(serializeProperty) });
});

const adminUpdateSchema = z.object({
  status: z.enum(propertyStatusValues).optional(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().min(0).optional(),
});

router.patch("/admin/properties/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !isStaff(req.user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = adminUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [existing] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, req.params.id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.title) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);

  const [updated] = await db
    .update(propertiesTable)
    .set(updates)
    .where(eq(propertiesTable.id, req.params.id))
    .returning();

  if (parsed.data.status && parsed.data.status !== existing.status) {
    if (parsed.data.status === "approved") {
      await createNotification({
        userId: existing.ownerId,
        type: "property_approved",
        title: "تم اعتماد عقارك",
        body: `عقار "${existing.title}" بقى منشور على باشاك.`,
        link: "/dashboard?tab=my-properties",
        relatedId: existing.id,
      });
    } else if (parsed.data.status === "rejected") {
      await createNotification({
        userId: existing.ownerId,
        type: "property_rejected",
        title: "تم رفض عقارك",
        body: `عقار "${existing.title}" تم رفضه. تواصل معانا للتفاصيل.`,
        link: "/dashboard?tab=my-properties",
        relatedId: existing.id,
      });
    }
  }

  res.json({ property: serializeProperty(updated) });
});

router.delete("/admin/properties/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !isStaff(req.user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(propertiesTable).where(eq(propertiesTable.id, req.params.id));
  res.json({ success: true });
});

export default router;
