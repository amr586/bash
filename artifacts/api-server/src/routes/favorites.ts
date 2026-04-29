import { Router, type IRouter, type Request, type Response } from "express";
import { db, favoritesTable, propertiesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

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

router.get("/me/favorites", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select({ property: propertiesTable, createdAt: favoritesTable.createdAt })
    .from(favoritesTable)
    .innerJoin(
      propertiesTable,
      eq(favoritesTable.propertyId, propertiesTable.id),
    )
    .where(eq(favoritesTable.userId, req.user.id))
    .orderBy(desc(favoritesTable.createdAt));
  res.json({ properties: rows.map((r) => serializeProperty(r.property)) });
});

router.get("/me/favorites/ids", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json({ ids: [] });
    return;
  }
  const rows = await db
    .select({ propertyId: favoritesTable.propertyId })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, req.user.id));
  res.json({ ids: rows.map((r) => r.propertyId) });
});

router.post("/favorites/:propertyId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { propertyId } = req.params;
  const [prop] = await db
    .select({ id: propertiesTable.id })
    .from(propertiesTable)
    .where(eq(propertiesTable.id, propertyId));
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  const [existing] = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, req.user.id),
        eq(favoritesTable.propertyId, propertyId),
      ),
    );
  if (existing) {
    res.json({ favorited: true });
    return;
  }
  await db
    .insert(favoritesTable)
    .values({ userId: req.user.id, propertyId });
  res.json({ favorited: true });
});

router.delete("/favorites/:propertyId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, req.user.id),
        eq(favoritesTable.propertyId, req.params.propertyId),
      ),
    );
  res.json({ favorited: false });
});

export default router;
