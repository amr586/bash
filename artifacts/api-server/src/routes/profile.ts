import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";
import { and, desc, eq, ne } from "drizzle-orm";
import {
  UpdateMyProfileResponse,
  UpdateUserAsAdminBody,
  UpdateUserAsAdminResponse,
  ListAllUsersResponse,
  DeleteUserAsAdminResponse,
} from "@workspace/api-zod";
import { hashPassword } from "../lib/password";

const updateMeSchema = z.object({
  firstName: z.string().trim().max(100).nullish(),
  lastName: z.string().trim().max(100).nullish(),
  profileImageUrl: z.string().trim().max(1000).nullish(),
  phone: z.string().trim().max(30).nullish(),
  email: z.string().trim().email().max(255).nullish(),
});

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
    role: row.role,
    isDisabled: row.isDisabled,
  };
}

router.patch("/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة." });
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

  if (parsed.data.email !== undefined && parsed.data.email !== null) {
    const newEmail = parsed.data.email.toLowerCase();
    const conflict = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.email, newEmail), ne(usersTable.id, req.user.id)))
      .limit(1);
    if (conflict.length > 0) {
      res.status(409).json({ error: "الإيميل ده مستخدم بالفعل." });
      return;
    }
    updates.email = newEmail;
  } else if (parsed.data.email === null) {
    updates.email = null;
  }

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
  if (parsed.data.isDisabled !== undefined) {
    if (targetId === req.user.id && parsed.data.isDisabled === true) {
      res.status(400).json({ error: "لا يمكنك تعطيل حسابك بنفسك." });
      return;
    }
    updates.isDisabled = parsed.data.isDisabled;
  }
  if (parsed.data.password !== undefined && parsed.data.password.length > 0) {
    updates.passwordHash = await hashPassword(parsed.data.password);
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
