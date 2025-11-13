import "dotenv/config";
import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function seedAdmin() {
  console.log("Starting admin user seeding...");

  // Validate DATABASE_URL before attempting connection
  if (!process.env.DATABASE_URL) {
    console.error("\n❌ DATABASE_URL is not set in your .env file!");
    console.error("Please add DATABASE_URL to your .env file.");
    console.error("Example format: postgresql://user:password@host/database?sslmode=require");
    process.exit(1);
  }

  // Basic validation of DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error("\n❌ Invalid DATABASE_URL format!");
    console.error("DATABASE_URL should start with 'postgresql://' or 'postgres://'");
    console.error(`Current value starts with: ${dbUrl.substring(0, 20)}...`);
    process.exit(1);
  }

  // Check if it's a Neon database URL
  const isNeonUrl = dbUrl.includes('neon.tech') || dbUrl.includes('neon') || dbUrl.includes('ep-');
  if (!isNeonUrl) {
    console.warn("\n⚠️  Warning: DATABASE_URL doesn't appear to be a Neon database URL.");
    console.warn("The application uses Neon serverless driver which requires WebSocket connections.");
    console.warn("If you're using a local PostgreSQL database, you may need to switch to a standard driver.");
    console.warn(`URL host: ${new URL(dbUrl).hostname}`);
  }

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  try {
    // Check if admin user already exists
    const existingUser = await storage.getUserByUsername(adminUsername);
    
    if (existingUser) {
      console.log(`Admin user "${adminUsername}" already exists. Skipping...`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const user = await storage.createUserWithRole({
      username: adminUsername,
      password: hashedPassword,
      role: "admin"
    });

    console.log(`✓ Admin user created successfully!`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  ID: ${user.id}`);
    console.log(`\nYou can now login at /admin with:`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Password: ${adminPassword}`);
  } catch (error: any) {
    console.error("\n❌ Error seeding admin user");
    
    // Check for database connection errors
    // Handle nested error structures (ErrorEvent, AggregateError, etc.)
    let errorMessage = '';
    let errorCode = '';
    
    // Try multiple ways to extract error message
    if (error?.message) {
      errorMessage = String(error.message);
    } else if (error?.[Symbol.for('kError')]?.message) {
      errorMessage = String(error[Symbol.for('kError')].message);
    } else if (error?.errors && Array.isArray(error.errors) && error.errors[0]?.message) {
      errorMessage = String(error.errors[0].message);
    } else if (typeof error?.toString === 'function') {
      errorMessage = error.toString();
    } else {
      // Try JSON.stringify for complex objects
      try {
        errorMessage = JSON.stringify(error, null, 2);
      } catch {
        errorMessage = String(error);
      }
    }
    
    // Try to extract error code from various error structures
    if (error?.code) {
      errorCode = String(error.code);
    } else if (error?.[Symbol.for('kError')]?.code) {
      errorCode = String(error[Symbol.for('kError')].code);
    } else if (error?.errors && Array.isArray(error.errors) && error.errors[0]?.code) {
      errorCode = String(error.errors[0].code);
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorCode = 'ECONNREFUSED';
    }
    
    // Check for WebSocket/localhost connection errors (Neon serverless issue)
    const hasWebSocketError = errorMessage.includes('WebSocket') || 
                              errorMessage.includes('wss://') || 
                              errorMessage.includes('localhost/v2') ||
                              (error?.[Symbol.for('kError')] && error[Symbol.for('kError')].code === 'ECONNREFUSED');
    
    if (errorCode === 'ECONNREFUSED' || errorMessage.includes('ECONNREFUSED') || hasWebSocketError) {
      console.error("\n❌ Database connection failed!");
      console.error("The Neon serverless WebSocket connection could not be established.");
      console.error("\nThis might happen if:");
      console.error("1. Your DATABASE_URL is not a valid Neon connection string");
      console.error("2. The connection string format is incorrect");
      console.error("3. Network/firewall is blocking WebSocket connections");
      console.error("\nNote: drizzle-kit push succeeded, which means your database is accessible.");
      console.error("The issue is with the Neon serverless WebSocket connection used by the application.");
      console.error("\nTry:");
      console.error("- Verify your DATABASE_URL is from Neon dashboard (not a local connection)");
      console.error("- Make sure it includes '?sslmode=require' at the end");
      console.error("- Check if you need to use a different connection method");
    } else if (errorMessage.includes('authentication') || errorMessage.includes('password')) {
      console.error("\n❌ Database authentication failed!");
      console.error("Please check your DATABASE_URL credentials (username/password).");
    } else if (errorMessage.includes('does not exist') || errorMessage.includes('database')) {
      console.error("\n❌ Database does not exist!");
      console.error("Please create the database first, or check your DATABASE_URL.");
      console.error("The database name in your connection string must exist.");
    } else {
      console.error(`Error details: ${errorMessage}`);
      if (errorCode) {
        console.error(`Error code: ${errorCode}`);
      }
    }
    
    throw error;
  }
}

// Run seeding if this file is executed directly
seedAdmin()
  .then(() => {
    console.log("\nAdmin seeding finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exit(1);
  });

