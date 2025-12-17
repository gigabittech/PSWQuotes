import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
import { readFileSync } from "fs";
import { join } from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createMissingTables() {
  const client = await pool.connect();
  try {
    console.log("Checking for missing tables...");
    
    // Check if session table exists (most critical for login)
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("⚠️  Session table missing! Creating it now...");
      try {
        const sql = readFileSync(join(process.cwd(), "scripts", "createSessionTable.sql"), "utf-8");
        await client.query(sql);
        console.log("✅ Session table created successfully!");
      } catch (sqlError: any) {
        console.error("❌ Failed to create session table:", sqlError.message);
        // Try a simpler version
        console.log("Attempting simpler table creation...");
        await client.query(`
          CREATE TABLE IF NOT EXISTS "session" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" varchar NOT NULL,
            "expires_at" timestamp NOT NULL,
            "data" jsonb,
            "created_at" timestamp NOT NULL DEFAULT now()
          );
        `);
        console.log("✅ Session table created with simpler structure!");
      }
    } else {
      console.log("✅ Session table already exists.");
    }

    // Check for other critical tables and warn if missing
    const criticalTables = [
      "users",
      "quotes",
      "products",
      "quote_items",
      "settings",
      "email_logs"
    ];

    let missingTables: string[] = [];
    for (const tableName of criticalTables) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      if (!exists.rows[0].exists) {
        missingTables.push(tableName);
      }
    }

    if (missingTables.length > 0) {
      console.warn(`\n⚠️  Warning: ${missingTables.length} critical table(s) missing: ${missingTables.join(", ")}`);
      console.warn("   Please run 'npm run db:push:safe' or 'npm run db:migrate' to create all tables.");
    } else {
      console.log("✅ All critical tables exist.");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error checking/creating tables:", error.message || error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createMissingTables();
