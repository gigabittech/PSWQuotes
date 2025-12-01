import "dotenv/config";
import { storage } from "./storage";
import { pricingDataService } from "./services/pricingDataService";

export async function seedProducts() {
  console.log("Starting product seeding from pricing-data.json...");

  const flatProducts = await pricingDataService.getAllProductsFlat();
  let createdCount = 0;

  for (const p of flatProducts) {
    try {
      // Base fields shared across product types
      let name = "";
      let capacity = "";
      let priceNumber = 0;
      let rebateEligible = false;
      let rebateAmountNumber = 0;
      let warranty = "";
      let specifications: any = {};

      if (p.productType === "solar") {
        name = `${p.sizeKw}kW ${p.brand} Solar System`;
        capacity = `${p.sizeKw}kW`;
        priceNumber = Number(p.priceAfterRebate);
        const rrp = Number(p.rrp);
        rebateAmountNumber = Math.max(0, rrp - priceNumber);
        rebateEligible = rebateAmountNumber > 0;
        warranty = `${p.warrantyYears || 25} years`;
        specifications = {
          brand: p.brand,
          model: p.model,
          sizeKw: p.sizeKw,
          panels: p.panels,
          wattage: p.wattage,
          rrp,
          phase: p.phase,
          brandKey: p.brandKey,
          packageIndex: p.packageIndex,
          description: `${p.panels} × ${p.wattage}W panels`,
        };
      } else if (p.productType === "battery") {
        name = `${p.brand} ${p.model} ${p.capacityKwh}kWh Battery`;
        capacity = `${p.capacityKwh}kWh`;
        priceNumber = Number(p.priceAfterRebate);
        const rrp = Number(p.rrp);
        rebateAmountNumber = Math.max(0, rrp - priceNumber);
        rebateEligible = rebateAmountNumber > 0;
        warranty = `${p.warrantyYears || 10} years`;
        specifications = {
          brand: p.brand,
          model: p.model,
          capacityKwh: p.capacityKwh,
          powerKw: p.powerKw,
          rrp,
          phase: p.phase,
          brandKey: p.brandKey,
          optionIndex: p.optionIndex,
        };
      } else if (p.productType === "ev_charger") {
        name = `${p.brand} ${p.model} ${p.powerKw}kW EV Charger`;
        capacity = `${p.powerKw}kW`;
        priceNumber = Number(p.installedPrice);
        rebateAmountNumber = 0;
        rebateEligible = false;
        warranty = "3 years";
        specifications = {
          brand: p.brand,
          model: p.model,
          powerKw: p.powerKw,
          installedPrice: p.installedPrice,
          rrp: p.rrp,
          cableType: p.cableType,
          cableLength: p.cableLength,
          phase: p.phase,
          brandKey: p.brandKey,
          optionIndex: p.optionIndex,
        };
      } else {
        // Unknown type, skip safely
        console.log(`! Skipping unknown product type for: ${p.brand} ${p.model}`);
        continue;
      }

      const insertProduct = {
        name,
        type: p.productType,
        category: p.phase, // single_phase / three_phase
        capacity,
        price: priceNumber.toFixed(2),
        rebateEligible,
        rebateAmount: rebateAmountNumber.toFixed(2),
        specifications,
        warranty,
        popular: false,
        active: true,
      } as any;

      await storage.createProduct(insertProduct);
      createdCount++;
      console.log(`✓ Created product: ${name}`);
    } catch (error) {
      console.log(`! Product from pricing-data may already exist, skipping...`);
    }
  }

  console.log(`Product seeding from pricing-data.json completed. Inserted ${createdCount} products.`);
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts()
    .then(() => {
      console.log("Seeding finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
