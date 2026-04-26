import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  UpdateUserAsAdminBody,
  UpdateUserAsAdminResponse,
  ListAllUsersResponse,
  DeleteUserAsAdminResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toAuthUser(row: typeof usersTable.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    profileImageUrl: row.profileImageUrl,
    phone: row.phone,
    isAdmin: row.isAdmin,
  };
}

router.patch("/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.firstName !== undefined)
    updates.firstName = parsed.data.firstName;
  if (parsed.data.lastName !== undefined)
    updates.lastName = parsed.data.lastName;
  if (parsed.data.profileImageUrl !== undefined)
    updates.profileImageUrl = parsed.data.profileImageUrl;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user.id))
    .returning();

  res.json(UpdateMyProfileResponse.parse({ user: toAuthUser(updated) }));
});

router.get("/admin/users", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(ListAllUsersResponse.parse({ users: rows.map(toAuthUser) }));
});

router.patch("/admin/users/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = UpdateUserAsAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const targetId = req.params.id;

  const updates: Record<string, unknown> = {};
  if (parsed.data.firstName !== undefined)
    updates.firstName = parsed.data.firstName;
  if (parsed.data.lastName !== undefined)
    updates.lastName = parsed.data.lastName;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.profileImageUrl !== undefined)
    updates.profileImageUrl = parsed.data.profileImageUrl;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.isAdmin !== undefined) {
    if (targetId === req.user.id && parsed.data.isAdmin === false) {
      res.status(400).json({ error: "Cannot remove admin from self" });
      return;
    }
    updates.isAdmin = parsed.data.isAdmin;
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, targetId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(UpdateUserAsAdminResponse.parse({ user: toAuthUser(updated) }));
});

router.delete("/admin/users/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (req.params.id === req.user.id) {
    res.status(400).json({ error: "Cannot delete self" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
  res.json(DeleteUserAsAdminResponse.parse({ success: true }));
});

export default router;
