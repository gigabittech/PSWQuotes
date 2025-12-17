import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.js";
import { existsSync } from "fs";
import { join } from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function runMigrations() {
  try {
    const migrationsPath = join(process.cwd(), "migrations");
    
    if (!existsSync(migrationsPath)) {
      console.log("No migrations folder found. Skipping migrations.");
      process.exit(0);
    }

    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Migration failed:", error.message || error);
    // Don't fail deployment if migrations fail - this allows the app to continue running
    // with the existing schema
    console.log("Continuing despite migration failure...");
    process.exit(0);
  } finally {
    await pool.end();
  }
}

runMigrations();
