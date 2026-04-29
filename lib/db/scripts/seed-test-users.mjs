#!/usr/bin/env node
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const { Pool } = pg;
const scrypt = promisify(_scrypt);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

const PASSWORD = "Bashak@2026";

const TEST_USERS = [
  {
    email: "superadmin@bashak.test",
    firstName: "Super",
    lastName: "Admin",
    phone: "+201111111111",
    role: "super_admin",
    isAdmin: true,
  },
  {
    email: "manager@bashak.test",
    firstName: "Property",
    lastName: "Manager",
    phone: "+201222222222",
    role: "property_manager",
    isAdmin: false,
  },
  {
    email: "dataentry@bashak.test",
    firstName: "Data",
    lastName: "Entry",
    phone: "+201333333333",
    role: "data_entry",
    isAdmin: false,
  },
  {
    email: "support@bashak.test",
    firstName: "Support",
    lastName: "Team",
    phone: "+201444444444",
    role: "support",
    isAdmin: false,
  },
  {
    email: "demo@bashak.test",
    firstName: "Demo",
    lastName: "User",
    phone: "+201555555555",
    role: "demo",
    isAdmin: false,
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    for (const u of TEST_USERS) {
      const passwordHash = await hashPassword(PASSWORD);
      await client.query(
        `INSERT INTO users (email, first_name, last_name, phone, password_hash, role, is_admin, is_disabled)
         VALUES ($1,$2,$3,$4,$5,$6,$7,false)
         ON CONFLICT (email) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = EXCLUDED.phone,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           is_admin = EXCLUDED.is_admin,
           is_disabled = false,
           updated_at = now()`,
        [
          u.email,
          u.firstName,
          u.lastName,
          u.phone,
          passwordHash,
          u.role,
          u.isAdmin,
        ],
      );
      console.log(`✓ Seeded ${u.email} (${u.role})`);
    }
    console.log(`\nDone. Password for all accounts: ${PASSWORD}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
