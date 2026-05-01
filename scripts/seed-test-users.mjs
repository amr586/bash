import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const normalized = password.normalize("NFKC");
  const key = await scryptAsync(normalized, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PASSWORD = "Bashak@2026";

const USERS = [
  {
    email: "superadmin@bashak.test",
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    isAdmin: true,
  },
  {
    email: "manager@bashak.test",
    firstName: "Property",
    lastName: "Manager",
    role: "property_manager",
    isAdmin: false,
  },
  {
    email: "dataentry@bashak.test",
    firstName: "Data",
    lastName: "Entry",
    role: "data_entry",
    isAdmin: false,
  },
  {
    email: "support@bashak.test",
    firstName: "Support",
    lastName: "Team",
    role: "support",
    isAdmin: false,
  },
  {
    email: "demo@bashak.test",
    firstName: "Demo",
    lastName: "User",
    role: "demo",
    isAdmin: false,
  },
];

const hash = await hashPassword(PASSWORD);
console.log("Hashed password:", hash.slice(0, 30) + "...");

for (const u of USERS) {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);
  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users SET
         first_name=$1, last_name=$2, role=$3, is_admin=$4,
         password_hash=$5, is_disabled=false, updated_at=NOW()
       WHERE email=$6`,
      [u.firstName, u.lastName, u.role, u.isAdmin, hash, u.email],
    );
    console.log(`✅ Updated: ${u.email} (${u.role})`);
  } else {
    await pool.query(
      `INSERT INTO users (email, first_name, last_name, role, is_admin, password_hash, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [u.email, u.firstName, u.lastName, u.role, u.isAdmin, hash],
    );
    console.log(`✅ Created: ${u.email} (${u.role})`);
  }
}

await pool.end();
console.log("\nDone! All test users are ready.");
