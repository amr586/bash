import type { AuthUser } from "@workspace/replit-auth-web";

export function getUserRole(user: AuthUser | null | undefined): string {
  if (!user) return "guest";
  if (user.isAdmin === true) return "super_admin";
  return (user as { role?: string }).role ?? "user";
}

/** Can add / edit properties (property_manager, data_entry, admin, super_admin) */
export function canManageProperties(user: AuthUser | null | undefined): boolean {
  const role = getUserRole(user);
  return ["super_admin", "admin", "property_manager", "data_entry"].includes(role);
}

/** Can view and reply to all contact requests (support, admin, super_admin) */
export function canHandleSupport(user: AuthUser | null | undefined): boolean {
  const role = getUserRole(user);
  return ["super_admin", "admin", "support"].includes(role);
}

export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "property_manager",
  "data_entry",
  "support",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

const STAFF_ROLE_SET = new Set<string>(STAFF_ROLES);

/**
 * Returns true if the user can add, edit, or approve properties.
 * Includes super_admin, admin, property_manager, and data_entry,
 * plus any user flagged as isAdmin for backwards compatibility.
 */
export function isStaff(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const role = (user as { role?: string }).role;
  return typeof role === "string" && STAFF_ROLE_SET.has(role);
}

/**
 * Returns true only for accounts that can manage other users
 * (super_admin / admin / legacy isAdmin). Property managers and
 * data-entry staff cannot edit users.
 */
export function isUserManager(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const role = (user as { role?: string }).role;
  return role === "super_admin" || role === "admin";
}
