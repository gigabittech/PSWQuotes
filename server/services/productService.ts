import "dotenv/config";
import { storage } from "../storage";
import { pricingDataService } from "./pricingDataService";
import type { Product, InsertProduct } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import { products } from "@shared/schema";
import { db } from "../db";

/**
 * Unified Product Service that switches between JSON and Database based on DATA_SOURCE
 * If DATA_SOURCE=json: Uses pricing-data.json for CRUD operations
 * Otherwise: Uses products table in database
 */
export class ProductService {
  private getDataSource(): 'json' | 'database' {
    return (process.env.DATA_SOURCE || 'json').toLowerCase() === 'json' ? 'json' : 'database';
  }

  /**
   * Get all products filtered by phase (power supply)
   */
  async getProducts(phaseType: 'single_phase' | 'three_phase' = 'single_phase'): Promise<Product[]> {
    if (this.getDataSource() === 'json') {
      // Transform JSON data to Product format
      return this.getProductsFromJson(phaseType);
    } else {
      // Get from database
      return await db.select()
        .from(products)
        .where(and(
          eq(products.active, true),
          eq(products.category, phaseType)
        ));
    }
  }

  /**
   * Get products by type (solar, battery, ev_charger, hybrid_inverter)
   */
  async getProductsByType(type: string, phaseType: 'single_phase' | 'three_phase' = 'single_phase'): Promise<Product[]> {
    if (this.getDataSource() === 'json') {
      const allProducts = await this.getProductsFromJson(phaseType);
      return allProducts.filter(p => p.type === type);
    } else {
      return await db.select()
        .from(products)
        .where(and(
          eq(products.type, type),
          eq(products.category, phaseType),
          eq(products.active, true)
        ));
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product | undefined> {
    if (this.getDataSource() === 'json') {
      const flatProducts = await pricingDataService.getAllProductsFlat();
      const product = flatProducts.find(p => p.id === id);
      if (!product) return undefined;
      return this.transformJsonToProduct(product);
    } else {
      return await storage.getProduct(id);
    }
  }

  /**
   * Get minimum prices for each product type
   */
  async getMinimumPrices(): Promise<{
    solar: number;
    battery: number;
    ev: number;
    inverter: number;
  }> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getMinimumPrices();
    } else {
      // Calculate from database
      const allProducts = await db.select().from(products).where(eq(products.active, true));
      
      let minSolar = Infinity;
      let minBattery = Infinity;
      let minEV = Infinity;
      let minInverter = Infinity;

      allProducts.forEach(product => {
        const price = parseFloat(product.price.toString());
        if (product.type === 'solar' && price < minSolar) minSolar = price;
        if (product.type === 'battery' && price < minBattery) minBattery = price;
        if (product.type === 'ev_charger' && price < minEV) minEV = price;
        if (product.type === 'hybrid_inverter' && price < minInverter) minInverter = price;
      });

      return {
        solar: minSolar === Infinity ? 0 : minSolar,
        battery: minBattery === Infinity ? 0 : minBattery,
        ev: minEV === Infinity ? 0 : minEV,
        inverter: minInverter === Infinity ? 0 : minInverter,
      };
    }
  }

  /**
   * Get all solar brands with packages
   */
  async getAllSolarBrands(phaseType: 'single_phase' | 'three_phase'): Promise<any> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getAllSolarBrands(phaseType);
    } else {
      // Transform database products to brand format
      return this.transformProductsToBrands(await this.getProductsByType('solar', phaseType), 'solar');
    }
  }

  /**
   * Get all battery brands with options
   */
  async getAllBatteryBrands(phaseType: 'single_phase' | 'three_phase'): Promise<any> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getAllBatteryBrands(phaseType);
    } else {
      return this.transformProductsToBrands(await this.getProductsByType('battery', phaseType), 'battery');
    }
  }

  /**
   * Get all EV charger brands with options
   */
  async getAllEVChargerBrands(phaseType: 'single_phase' | 'three_phase'): Promise<any> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getAllEVChargerBrands(phaseType);
    } else {
      return this.transformProductsToBrands(await this.getProductsByType('ev_charger', phaseType), 'ev_charger');
    }
  }

  /**
   * Get all inverter brands with models
   */
  async getAllInverterBrands(phaseType: 'single_phase' | 'three_phase'): Promise<any> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getAllInverterBrands(phaseType);
    } else {
      return this.transformProductsToBrands(await this.getProductsByType('hybrid_inverter', phaseType), 'hybrid_inverter');
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: InsertProduct | any): Promise<Product> {
    if (this.getDataSource() === 'json') {
      let jsonProductData: any;
      
      // If already in JSON format (from admin API), use as-is
      if (productData.phase && productData.productType) {
        jsonProductData = productData;
      } else {
        // Transform InsertProduct to pricing-data.json format
        const specs = productData.specifications || {};
        jsonProductData = {
          phase: productData.category || 'single_phase',
          productType: productData.type,
          brand: specs.brand || productData.brand || 'Unknown',
          model: specs.model || productData.model || 'Unknown',
          warrantyYears: specs.warrantyYears || 10,
          ...specs,
        };
        
        // Map product fields to JSON format based on type
        if (productData.type === 'solar') {
          jsonProductData.sizeKw = specs.sizeKw || parseFloat(productData.capacity?.replace('kW', '') || '0');
          jsonProductData.panels = specs.panels || 0;
          jsonProductData.wattage = specs.wattage || 0;
          jsonProductData.priceAfterRebate = parseFloat(productData.price.toString());
          jsonProductData.rrp = specs.rrp || parseFloat(productData.price.toString());
        } else if (productData.type === 'battery') {
          jsonProductData.capacityKwh = specs.capacityKwh || parseFloat(productData.capacity?.replace('kWh', '') || '0');
          jsonProductData.powerKw = specs.powerKw || 0;
          jsonProductData.priceAfterRebate = parseFloat(productData.price.toString());
          jsonProductData.rrp = specs.rrp || parseFloat(productData.price.toString());
        } else if (productData.type === 'ev_charger') {
          jsonProductData.powerKw = specs.powerKw || parseFloat(productData.capacity?.replace('kW', '') || '0');
          jsonProductData.installedPrice = parseFloat(productData.price.toString());
          jsonProductData.rrp = specs.rrp || parseFloat(productData.price.toString());
          jsonProductData.cableType = specs.cableType || 'Tethered';
          jsonProductData.cableLength = specs.cableLength;
        }
      }
      
      // Add to pricing-data.json
      await pricingDataService.addProduct(jsonProductData);
      
      // Fetch the newly created product to return it
      const flatProducts = await pricingDataService.getAllProductsFlat();
      const newProduct = flatProducts.find((p: any) => 
        p.phase === jsonProductData.phase && 
        p.productType === jsonProductData.productType &&
        p.brand === jsonProductData.brand &&
        p.model === jsonProductData.model &&
        ((jsonProductData.productType === 'solar' && p.sizeKw === jsonProductData.sizeKw) ||
         (jsonProductData.productType === 'battery' && p.capacityKwh === jsonProductData.capacityKwh) ||
         (jsonProductData.productType === 'ev_charger' && p.powerKw === jsonProductData.powerKw))
      );
      
      if (newProduct) {
        return this.transformJsonToProduct(newProduct);
      }
      
      // Fallback: return a transformed version of the input
      return this.transformJsonToProduct({ ...jsonProductData, id: 'temp' });
    } else {
      // Add to database
      return await storage.createProduct(productData);
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<InsertProduct> | any): Promise<Product | undefined> {
    if (this.getDataSource() === 'json') {
      // Transform to pricing-data.json format
      const specs = productData.specifications || {};
      const jsonProductData: any = {};
      if (productData.category) jsonProductData.phase = productData.category;
      if (productData.type) jsonProductData.productType = productData.type;
      if (specs.brand || productData.brand) jsonProductData.brand = specs.brand || productData.brand;
      if (specs.model || productData.model) jsonProductData.model = specs.model || productData.model;
      if (productData.price) jsonProductData.priceAfterRebate = parseFloat(productData.price.toString());
      Object.assign(jsonProductData, specs);
      
      // Update in pricing-data.json
      const result = await pricingDataService.updateProduct(id, jsonProductData);
      // Transform result to Product format if needed
      if (result) {
        return this.transformJsonToProduct(result);
      }
      return undefined;
    } else {
      // Update in database
      return await storage.updateProduct(id, productData);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string, phase?: string, productType?: string, brandKey?: string, index?: number): Promise<boolean> {
    if (this.getDataSource() === 'json') {
      // Delete from pricing-data.json - requires phase/productType/brandKey/index
      if (phase && productType && brandKey && index !== undefined) {
        await pricingDataService.deleteProduct(id, phase as any, productType, brandKey, index);
        return true;
      }
      // If params missing, try to get product first to extract needed info
      const product = await this.getProduct(id);
      if (product) {
        const specs = product.specifications as any;
        const deletePhase = phase || product.category;
        const deleteType = productType || product.type;
        const deleteBrandKey = brandKey || specs.brandKey;
        const deleteIndex = index !== undefined ? index : (specs.packageIndex !== undefined ? specs.packageIndex : specs.optionIndex);
        
        if (deletePhase && deleteType && deleteBrandKey && deleteIndex !== undefined) {
          await pricingDataService.deleteProduct(id, deletePhase as any, deleteType, deleteBrandKey, deleteIndex);
          return true;
        }
      }
      return false;
    } else {
      // Delete from database - only needs ID
      return await storage.deleteProduct(id);
    }
  }

  /**
   * Get all products in flat list format (for admin)
   */
  async getAllProductsFlat(): Promise<any[]> {
    if (this.getDataSource() === 'json') {
      return await pricingDataService.getAllProductsFlat();
    } else {
      // Transform database products to flat format
      const dbProducts = await db.select().from(products).where(eq(products.active, true));
      return dbProducts.map(p => this.transformProductToFlat(p));
    }
  }

  // Private helper methods

  private async getProductsFromJson(phaseType: 'single_phase' | 'three_phase'): Promise<Product[]> {
    const [solarBrands, batteryBrands, evChargerBrands] = await Promise.all([
      pricingDataService.getAllSolarBrands(phaseType),
      pricingDataService.getAllBatteryBrands(phaseType),
      pricingDataService.getAllEVChargerBrands(phaseType)
    ]);

    const products: Product[] = [];

    // Transform solar panels
    Object.entries(solarBrands).forEach(([brandKey, brandData]) => {
      brandData.packages.forEach((pkg: any) => {
        products.push({
          id: pkg.id || `solar-${brandKey}-${pkg.size_kw}kw`,
          name: `${pkg.size_kw}kW ${brandData.brand} Solar System`,
          type: 'solar',
          category: phaseType,
          capacity: `${pkg.size_kw}kW`,
          price: pkg.price_after_rebate.toString(),
          rebateEligible: true,
          rebateAmount: '0',
          specifications: {
            panels: `${pkg.panels} × ${pkg.wattage}W ${brandData.brand} ${brandData.model}`,
            technology: brandData.technology,
            warranty: `${brandData.warranty_product} years product, ${brandData.warranty_performance} years performance`,
            generation: `~${Math.round(pkg.size_kw * 1500)} kWh annually`,
          },
          warranty: `${brandData.warranty_product} years`,
          popular: false,
          active: true,
          createdAt: new Date(),
        } as Product);
      });
    });

    // Transform batteries
    Object.entries(batteryBrands).forEach(([brandKey, brandData]) => {
      brandData.options.forEach((opt: any) => {
        products.push({
          id: opt.id || `battery-${brandKey}-${opt.capacity_kwh}kwh`,
          name: opt.model || `${brandData.brand} ${opt.capacity_kwh}kWh`,
          type: 'battery',
          category: phaseType,
          capacity: `${opt.capacity_kwh}kWh`,
          price: opt.price_after_rebate.toString(),
          rebateEligible: brandKey !== 'tesla',
          rebateAmount: '0',
          specifications: {
            capacity: `${opt.capacity_kwh}kWh usable`,
            power: opt.power_kw ? `${opt.power_kw}kW continuous` : 'Varies',
            warranty: `${brandData.warranty_years} years`,
            cellType: brandData.cell_type || 'N/A',
          },
          warranty: `${brandData.warranty_years} years`,
          popular: false,
          active: true,
          createdAt: new Date(),
        } as Product);
      });
    });

    // Transform EV chargers
    Object.entries(evChargerBrands).forEach(([brandKey, brandData]) => {
      brandData.options.forEach((opt: any) => {
        products.push({
          id: opt.id || `ev-${brandKey}-${opt.power_kw}kw`,
          name: `${brandData.brand} ${brandData.model} ${opt.power_kw}kW`,
          type: 'ev_charger',
          category: phaseType,
          capacity: `${opt.power_kw}kW`,
          price: opt.installed_price.toString(),
          rebateEligible: false,
          rebateAmount: null,
          specifications: {
            power: `${opt.power_kw}kW`,
            phase: opt.phase,
            cableType: brandData.cable_type,
            cableLength: brandData.cable_length_m ? `${brandData.cable_length_m}m` : 'N/A',
          },
          warranty: '2 years',
          popular: false,
          active: true,
          createdAt: new Date(),
        } as Product);
      });
    });

    return products;
  }

  private transformJsonToProduct(p: any): Product {
    const specs = p.specifications || {};
    return {
      id: p.id,
      name: p.name || `${p.brand} ${p.model}`,
      type: p.productType,
      category: p.phase,
      capacity: p.capacity || `${p.sizeKw || p.capacityKwh || p.powerKw}${p.productType === 'solar' ? 'kW' : p.productType === 'battery' ? 'kWh' : 'kW'}`,
      price: (p.priceAfterRebate || p.installedPrice || 0).toString(),
      rebateEligible: p.rebateEligible || false,
      rebateAmount: p.rebateAmount || null,
      specifications: specs,
      warranty: p.warranty || 'N/A',
      popular: p.popular || false,
      active: p.active !== false,
      createdAt: new Date(),
    } as Product;
  }

  private transformProductsToBrands(products: Product[], type: string): any {
    // Group products by brand from specifications
    const brands: Record<string, any> = {};

    products.forEach(product => {
      const specs = product.specifications as any;
      const brandKey = specs.brandKey || specs.brand?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
      const brand = specs.brand || 'Unknown';
      const model = specs.model || 'Unknown';

      if (!brands[brandKey]) {
        brands[brandKey] = {
          brand,
          model,
          packages: [],
          options: [],
          models: [],
        };
      }

      // Add to appropriate array based on type
      if (type === 'solar') {
        brands[brandKey].packages.push({
          id: product.id,
          size_kw: parseFloat(product.capacity.replace('kW', '')),
          panels: specs.panels?.split('×')[0]?.trim() || specs.panels,
          wattage: specs.wattage || 0,
          price_after_rebate: parseFloat(product.price.toString()),
          rrp: specs.rrp ? parseFloat(specs.rrp) : parseFloat(product.price.toString()),
        });
      } else if (type === 'battery') {
        brands[brandKey].options.push({
          id: product.id,
          model: specs.model || product.name,
          capacity_kwh: parseFloat(product.capacity.replace('kWh', '')),
          power_kw: specs.powerKw || specs.power,
          price_after_rebate: parseFloat(product.price.toString()),
          rrp: specs.rrp ? parseFloat(specs.rrp) : parseFloat(product.price.toString()),
        });
      } else if (type === 'ev_charger') {
        brands[brandKey].options.push({
          id: product.id,
          power_kw: parseFloat(product.capacity.replace('kW', '')),
          installed_price: parseFloat(product.price.toString()),
          rrp: specs.rrp ? parseFloat(specs.rrp) : parseFloat(product.price.toString()),
          phase: specs.phase || '1ph',
        });
      }
    });

    return brands;
  }

  private transformProductToFlat(product: Product): any {
    const specs = product.specifications as any;
    return {
      id: product.id,
      phase: product.category,
      productType: product.type,
      brand: specs.brand || 'Unknown',
      model: specs.model || 'Unknown',
      ...specs,
      price: product.price,
      rebateEligible: product.rebateEligible,
      rebateAmount: product.rebateAmount,
      warranty: product.warranty,
    };
  }
}

export const productService = new ProductService();
