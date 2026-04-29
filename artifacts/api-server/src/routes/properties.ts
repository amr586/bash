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
import { createNotification } from "../lib/notifications";

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

const propertyFinishingEnum = z.enum([
  "full",
  "semi",
  "three_quarters",
  "super_lux",
] as const);

const propertyInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  type: z.enum(propertyTypeValues),
  listingType: z.enum(propertyListingValues),
  price: z.coerce.number().min(0),
  location: z.string().trim().max(200).optional().default(""),
  addressDetails: z.string().trim().max(200).nullable().optional(),
  downPayment: z.string().trim().max(100).nullable().optional(),
  deliveryStatus: z.string().trim().max(100).nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  area: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  floor: z.coerce.number().int().min(-5).max(200).nullable().optional(),
  furnished: z.coerce.boolean().optional().default(false),
  parking: z.coerce.boolean().optional().default(false),
  elevator: z.coerce.boolean().optional().default(false),
  pool: z.coerce.boolean().optional().default(false),
  garden: z.coerce.boolean().optional().default(false),
  basement: z.coerce.boolean().optional().default(false),
  finishing: propertyFinishingEnum.nullable().optional(),
  featured: z.coerce.boolean().optional().default(false),
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
    addressDetails: p.addressDetails,
    downPayment: p.downPayment,
    deliveryStatus: p.deliveryStatus,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    floor: p.floor,
    furnished: p.furnished,
    parking: p.parking,
    elevator: p.elevator,
    pool: p.pool,
    garden: p.garden,
    basement: p.basement,
    finishing: p.finishing,
    featured: p.featured,
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
  if (!isStaff(req.user)) {
    res
      .status(403)
      .json({ error: "إضافة العقارات متاحة لفريق باشاك فقط." });
    return;
  }
  const parsed = propertyInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

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
      addressDetails: parsed.data.addressDetails ?? null,
      downPayment: parsed.data.downPayment ?? null,
      deliveryStatus: parsed.data.deliveryStatus ?? null,
      bedrooms: parsed.data.bedrooms ?? null,
      bathrooms: parsed.data.bathrooms ?? null,
      area: parsed.data.area ?? null,
      floor: parsed.data.floor ?? null,
      furnished: parsed.data.furnished ?? false,
      parking: parsed.data.parking ?? false,
      elevator: parsed.data.elevator ?? false,
      pool: parsed.data.pool ?? false,
      garden: parsed.data.garden ?? false,
      basement: parsed.data.basement ?? false,
      finishing: parsed.data.finishing ?? null,
      featured: parsed.data.featured ?? false,
      mainImageUrl:
        parsed.data.mainImageUrl ??
        (parsed.data.imageUrls && parsed.data.imageUrls.length > 0
          ? parsed.data.imageUrls[0]
          : null),
      imageUrls: parsed.data.imageUrls ?? [],
      floorPlanUrls: parsed.data.floorPlanUrls ?? [],
      mapsLink: parsed.data.mapsLink ?? null,
      contactPhone:
        (parsed.data.contactPhone && parsed.data.contactPhone.trim()) ||
        req.user.phone ||
        null,
      status: "approved",
    })
    .returning();

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
  type: z.enum(propertyTypeValues).optional(),
  listingType: z.enum(propertyListingValues).optional(),
  location: z.string().trim().max(200).optional(),
  addressDetails: z.string().trim().max(200).nullable().optional(),
  downPayment: z.string().trim().max(100).nullable().optional(),
  deliveryStatus: z.string().trim().max(100).nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  area: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  floor: z.coerce.number().int().min(-5).max(200).nullable().optional(),
  furnished: z.coerce.boolean().optional(),
  parking: z.coerce.boolean().optional(),
  elevator: z.coerce.boolean().optional(),
  pool: z.coerce.boolean().optional(),
  garden: z.coerce.boolean().optional(),
  basement: z.coerce.boolean().optional(),
  finishing: propertyFinishingEnum.nullable().optional(),
  featured: z.coerce.boolean().optional(),
  mainImageUrl: z.string().trim().max(1000).nullable().optional(),
  imageUrls: z.array(z.string().trim().min(1).max(1000)).max(40).optional(),
  floorPlanUrls: z.array(z.string().trim().min(1).max(1000)).max(20).optional(),
  mapsLink: z.string().trim().max(1000).nullable().optional(),
  contactPhone: z.string().trim().max(30).nullable().optional(),
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
  if (parsed.data.type) updates.type = parsed.data.type;
  if (parsed.data.listingType) updates.listingType = parsed.data.listingType;
  if (parsed.data.location !== undefined) updates.location = parsed.data.location;
  if (parsed.data.bedrooms !== undefined) updates.bedrooms = parsed.data.bedrooms;
  if (parsed.data.bathrooms !== undefined)
    updates.bathrooms = parsed.data.bathrooms;
  if (parsed.data.area !== undefined) updates.area = parsed.data.area;
  if (parsed.data.addressDetails !== undefined)
    updates.addressDetails = parsed.data.addressDetails;
  if (parsed.data.downPayment !== undefined)
    updates.downPayment = parsed.data.downPayment;
  if (parsed.data.deliveryStatus !== undefined)
    updates.deliveryStatus = parsed.data.deliveryStatus;
  if (parsed.data.floor !== undefined) updates.floor = parsed.data.floor;
  if (parsed.data.furnished !== undefined) updates.furnished = parsed.data.furnished;
  if (parsed.data.parking !== undefined) updates.parking = parsed.data.parking;
  if (parsed.data.elevator !== undefined) updates.elevator = parsed.data.elevator;
  if (parsed.data.pool !== undefined) updates.pool = parsed.data.pool;
  if (parsed.data.garden !== undefined) updates.garden = parsed.data.garden;
  if (parsed.data.basement !== undefined) updates.basement = parsed.data.basement;
  if (parsed.data.finishing !== undefined) updates.finishing = parsed.data.finishing;
  if (parsed.data.featured !== undefined) updates.featured = parsed.data.featured;
  if (parsed.data.mainImageUrl !== undefined)
    updates.mainImageUrl = parsed.data.mainImageUrl;
  if (parsed.data.imageUrls !== undefined)
    updates.imageUrls = parsed.data.imageUrls;
  if (parsed.data.floorPlanUrls !== undefined)
    updates.floorPlanUrls = parsed.data.floorPlanUrls;
  if (parsed.data.mapsLink !== undefined) updates.mapsLink = parsed.data.mapsLink;
  if (parsed.data.contactPhone !== undefined)
    updates.contactPhone = parsed.data.contactPhone;

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
