import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
import { execSync } from "child_process";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateFresh() {
  const client = await pool.connect();
  try {
    console.log("⚠️  WARNING: This will DROP ALL TABLES and recreate them!");
    console.log("All data will be lost!\n");

    // Get all table names from the public schema
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = result.rows.map(row => row.tablename);

    if (tables.length === 0) {
      console.log("No tables found. Creating fresh schema...");
    } else {
      console.log(`Found ${tables.length} table(s) to drop:`);
      tables.forEach(table => console.log(`  - ${table}`));
      console.log("\nDropping all tables...");

      // Drop all tables with CASCADE to handle foreign key constraints
      for (const table of tables) {
        try {
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          console.log(`  ✓ Dropped table: ${table}`);
        } catch (error: any) {
          console.error(`  ✗ Failed to drop table ${table}:`, error.message);
        }
      }
    }

    console.log("\n✅ All tables dropped successfully!");
    console.log("Creating fresh schema with drizzle-kit push...\n");

    // Now push the schema to create all tables fresh
    try {
      execSync("npx drizzle-kit push", {
        stdio: "inherit",
        env: { ...process.env }
      });
      console.log("\n✅ Fresh migration completed successfully!");
      process.exit(0);
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      
      // Check if it's the primary key constraint error (shouldn't happen on fresh, but handle it)
      if (errorMessage.includes("column \"id\" is in a primary key") || 
          errorMessage.includes("42P16")) {
        console.warn("\n⚠️  Warning: Primary key constraint error detected.");
        console.warn("This is unexpected on a fresh migration. Schema may be partially created.");
        process.exit(1);
      }
      
      console.error("\n❌ Failed to create fresh schema:", errorMessage);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Error during fresh migration:", error.message || error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateFresh();
