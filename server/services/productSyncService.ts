import "dotenv/config";
import { storage } from "../storage";
import { db } from "../db";
import { products } from "@shared/schema";
import { pricingDataService } from "./pricingDataService";
import type { InsertProduct } from "@shared/schema";

/**
 * Service to sync pricing data from pricing-data.json to the products table
 * This allows products to be stored in the database instead of being read from JSON on every request
 */
export class ProductSyncService {
  /**
   * Sync all products from pricing-data.json to the products table
   * Uses upsert logic: updates existing products or creates new ones
   */
  async syncAllProducts(): Promise<{ created: number; updated: number; errors: number }> {
    console.log("Starting product sync from pricing-data.json...");

    const flatProducts = await pricingDataService.getAllProductsFlat();
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const p of flatProducts) {
      try {
        const productData = this.transformToProduct(p);
        
        // Check if product already exists (by ID from pricing-data.json)
        const existingProduct = await storage.getProduct(p.id);
        
        // Use upsert pattern: insert or update based on existence
        if (existingProduct) {
          // Update existing product
          await storage.updateProduct(p.id, productData);
          updatedCount++;
          console.log(`✓ Updated product: ${productData.name} (ID: ${p.id})`);
        } else {
          // Create new product with ID from pricing-data.json
          // Insert with explicit ID (bypassing InsertProduct type which omits id)
          await db.insert(products)
            .values({
              ...productData,
              id: p.id,
            } as any); // Type assertion needed since InsertProduct omits id
          createdCount++;
          console.log(`✓ Created product: ${productData.name} (ID: ${p.id})`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`✗ Error syncing product ${p.id}:`, error.message || error);
      }
    }

    console.log(`\nProduct sync completed:`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total processed: ${flatProducts.length}`);

    return { created: createdCount, updated: updatedCount, errors: errorCount };
  }

  /**
   * Transform pricing data product to database product format
   */
  private transformToProduct(p: any): InsertProduct {
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
      const rrp = Number(p.rrp) || priceNumber;
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
        technology: p.technology,
        warrantyProduct: p.warrantyYears,
        warrantyPerformance: p.warrantyPerformance,
        generation: `~${Math.round(p.sizeKw * 1500)} kWh annually`,
      };
    } else if (p.productType === "battery") {
      name = p.model || `${p.brand} ${p.capacityKwh}kWh Battery`;
      capacity = `${p.capacityKwh}kWh`;
      priceNumber = Number(p.priceAfterRebate);
      const rrp = Number(p.rrp) || priceNumber;
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
        cellType: p.cellType,
      };
    } else if (p.productType === "ev_charger") {
      name = `${p.brand} ${p.model} ${p.powerKw}kW EV Charger`;
      capacity = `${p.powerKw}kW`;
      priceNumber = Number(p.installedPrice);
      rebateAmountNumber = 0;
      rebateEligible = false;
      warranty = "2 years";
      specifications = {
        brand: p.brand,
        model: p.model,
        powerKw: p.powerKw,
        installedPrice: p.installedPrice,
        rrp: p.rrp || p.installedPrice,
        cableType: p.cableType,
        cableLength: p.cableLength,
        phase: p.phase,
        brandKey: p.brandKey,
        optionIndex: p.optionIndex,
      };
    } else if (p.productType === "hybrid_inverter") {
      name = `${p.brand} ${p.model} ${p.powerKw}kW Hybrid Inverter`;
      capacity = `${p.powerKw}kW`;
      priceNumber = Number(p.pricePackage || p.priceSingle);
      rebateAmountNumber = 0;
      rebateEligible = false;
      warranty = `${p.warrantyYears || 10} years`;
      specifications = {
        brand: p.brand,
        model: p.model,
        modelSeries: p.modelSeries,
        powerKw: p.powerKw,
        phase: p.phase,
        pricePackage: p.pricePackage,
        priceSingle: p.priceSingle,
        includesPowerSensor: p.includesPowerSensor,
        activationFee: p.activationFee,
        brandKey: p.brandKey,
        modelIndex: p.modelIndex,
      };
    } else {
      throw new Error(`Unknown product type: ${p.productType}`);
    }

    return {
      name,
      type: p.productType,
      category: p.phase, // single_phase / three_phase
      capacity,
      price: priceNumber.toFixed(2),
      rebateEligible,
      rebateAmount: rebateAmountNumber > 0 ? rebateAmountNumber.toFixed(2) : null,
      specifications,
      warranty,
      popular: false,
      active: true,
    };
  }

  /**
   * Sync products for a specific phase
   */
  async syncProductsByPhase(phase: 'single_phase' | 'three_phase'): Promise<{ created: number; updated: number }> {
    const flatProducts = await pricingDataService.getAllProductsFlat();
    const phaseProducts = flatProducts.filter(p => p.phase === phase);
    
    let created = 0;
    let updated = 0;

    for (const p of phaseProducts) {
      try {
        const productData = this.transformToProduct(p);
        const existingProduct = await storage.getProduct(p.id);
        
        if (existingProduct) {
          // Update logic here
          updated++;
        } else {
          await storage.createProduct({
            ...productData,
            id: p.id,
          } as InsertProduct & { id: string });
          created++;
        }
      } catch (error) {
        console.error(`Error syncing product ${p.id}:`, error);
      }
    }

    return { created, updated };
  }

  /**
   * Sync products for a specific type
   */
  async syncProductsByType(type: 'solar' | 'battery' | 'ev_charger' | 'hybrid_inverter'): Promise<{ created: number; updated: number }> {
    const flatProducts = await pricingDataService.getAllProductsFlat();
    const typeProducts = flatProducts.filter(p => p.productType === type);
    
    let created = 0;
    let updated = 0;

    for (const p of typeProducts) {
      try {
        const productData = this.transformToProduct(p);
        const existingProduct = await storage.getProduct(p.id);
        
        if (existingProduct) {
          updated++;
        } else {
          await storage.createProduct({
            ...productData,
            id: p.id,
          } as InsertProduct & { id: string });
          created++;
        }
      } catch (error) {
        console.error(`Error syncing product ${p.id}:`, error);
      }
    }

    return { created, updated };
  }
}

export const productSyncService = new ProductSyncService();
