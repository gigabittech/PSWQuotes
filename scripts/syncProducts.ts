import "dotenv/config";
import { productSyncService } from "../server/services/productSyncService";

async function syncProducts() {
  try {
    console.log("🔄 Starting product sync from pricing-data.json to products table...\n");
    
    const result = await productSyncService.syncAllProducts();
    
    console.log("\n✅ Product sync completed successfully!");
    console.log(`   Created: ${result.created} products`);
    console.log(`   Updated: ${result.updated} products`);
    console.log(`   Errors: ${result.errors} products`);
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Product sync failed:", error.message || error);
    process.exit(1);
  }
}

syncProducts();
