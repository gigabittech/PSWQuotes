import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

interface PricingData {
  version: string;
  lastUpdated: string;
  rebates: {
    wa_battery_rebate: {
      description: string;
      value_per_kwh: number;
      max_capacity_kwh: number;
      vpp_requirement: boolean;
    };
    national_battery_rebate: {
      description: string;
      value_per_certificate: number;
    };
    stc_rebate: {
      description: string;
      value_per_certificate: number;
      zone: number;
    };
  };
  single_phase: PhaseData;
  three_phase: PhaseData;
  sungrow_trade_in?: {
    description: string;
    models: Record<string, number>;
    note: string;
  };
}

interface PhaseData {
  solar_panels: Record<string, SolarBrand>;
  hybrid_inverters: Record<string, InverterBrand>;
  batteries: Record<string, BatteryBrand>;
  ev_chargers: Record<string, EVChargerBrand>;
}

interface SolarBrand {
  brand: string;
  model: string;
  technology: string;
  warranty_product: number;
  warranty_performance: number;
  packages: SolarPackage[];
}

interface SolarPackage {
  id?: string;
  size_kw: number;
  panels: number;
  wattage: number;
  price_after_rebate: number;
  rrp?: number;
  requires_inverter: boolean;
}

interface InverterBrand {
  brand: string;
  model_series: string;
  warranty_years: number;
  activation_fee?: number;
  models: InverterModel[];
}

interface InverterModel {
  model: string;
  power_kw: number;
  phase: string;
  price_package: number;
  price_single: number;
  includes_power_sensor: boolean;
  battery_activated?: boolean;
}

interface BatteryBrand {
  brand: string;
  model: string;
  warranty_years: number;
  requires_hybrid?: string;
  requires_controller?: boolean;
  cell_type?: string;
  note?: string;
  options: BatteryOption[];
  gateway?: {
    model: string;
    phase: string;
    price_package: number;
    price_single: number;
  };
}

interface BatteryOption {
  id?: string;
  model?: string;
  capacity_kwh: number;
  price_after_rebate: number;
  rrp: number;
  power_kw?: number;
  includes_gateway?: boolean;
  type?: string;
  stacks?: number;
  towers?: number;
  includes_sensor?: boolean;
}

interface EVChargerBrand {
  brand: string;
  model: string;
  cable_type: string;
  cable_length_m?: number;
  connector_type?: string;
  options: EVChargerOption[];
}

interface EVChargerOption {
  id?: string;
  power_kw: number;
  phase: string;
  installed_price: number;
  rrp?: number;
}

class PricingDataService {
  private pricingData: PricingData | null = null;
  private dataPath = path.join(process.cwd(), 'pricing-data.json');

  async loadPricingData(): Promise<PricingData> {
    if (this.pricingData) {
      return this.pricingData;
    }

    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.pricingData = JSON.parse(data);
      return this.pricingData!;
    } catch (error) {
      console.error('Error loading pricing data:', error);
      throw new Error('Failed to load pricing data');
    }
  }

  async reloadPricingData(): Promise<void> {
    this.pricingData = null;
    await this.loadPricingData();
  }

  async findSolarPackage(
    phaseType: 'single_phase' | 'three_phase',
    brand: string,
    sizeKw: number
  ): Promise<SolarPackage | null> {
    const data = await this.loadPricingData();
    const phaseData = data[phaseType];
    
    if (!phaseData.solar_panels[brand]) {
      return null;
    }

    const solarBrand = phaseData.solar_panels[brand];
    return solarBrand.packages.find(pkg => pkg.size_kw === sizeKw) || null;
  }

  async findInverter(
    phaseType: 'single_phase' | 'three_phase',
    brand: string,
    powerKw: number
  ): Promise<InverterModel | null> {
    const data = await this.loadPricingData();
    const phaseData = data[phaseType];
    
    if (!phaseData.hybrid_inverters[brand]) {
      return null;
    }

    const inverterBrand = phaseData.hybrid_inverters[brand];
    return inverterBrand.models.find(model => model.power_kw === powerKw) || null;
  }

  async findBattery(
    phaseType: 'single_phase' | 'three_phase',
    brand: string,
    capacityKwh: number
  ): Promise<BatteryOption | null> {
    const data = await this.loadPricingData();
    const phaseData = data[phaseType];
    
    if (!phaseData.batteries[brand]) {
      return null;
    }

    const batteryBrand = phaseData.batteries[brand];
    return batteryBrand.options.find(opt => opt.capacity_kwh === capacityKwh) || null;
  }

  async findEVCharger(
    phaseType: 'single_phase' | 'three_phase',
    brand: string,
    powerKw: number
  ): Promise<EVChargerOption | null> {
    const data = await this.loadPricingData();
    const phaseData = data[phaseType];
    
    if (!phaseData.ev_chargers[brand]) {
      return null;
    }

    const evBrand = phaseData.ev_chargers[brand];
    return evBrand.options.find(opt => opt.power_kw === powerKw) || null;
  }

  async getAllSolarBrands(phaseType: 'single_phase' | 'three_phase'): Promise<Record<string, SolarBrand>> {
    const data = await this.loadPricingData();
    return data[phaseType].solar_panels;
  }

  async getAllInverterBrands(phaseType: 'single_phase' | 'three_phase'): Promise<Record<string, InverterBrand>> {
    const data = await this.loadPricingData();
    return data[phaseType].hybrid_inverters;
  }

  async getAllBatteryBrands(phaseType: 'single_phase' | 'three_phase'): Promise<Record<string, BatteryBrand>> {
    const data = await this.loadPricingData();
    return data[phaseType].batteries;
  }

  async getAllEVChargerBrands(phaseType: 'single_phase' | 'three_phase'): Promise<Record<string, EVChargerBrand>> {
    const data = await this.loadPricingData();
    return data[phaseType].ev_chargers;
  }

  async getRebateInfo() {
    const data = await this.loadPricingData();
    return data.rebates;
  }

  async getSungrowTradeInValue(model: string): Promise<number> {
    const data = await this.loadPricingData();
    if (!data.sungrow_trade_in) {
      return 0;
    }
    return data.sungrow_trade_in.models[model] || 0;
  }

  async calculateBatteryRebates(capacityKwh: number, isTesla: boolean = false): Promise<{
    waRebate: number;
    nationalRebate: number;
    totalRebate: number;
  }> {
    const data = await this.loadPricingData();
    
    let waRebate = 0;
    let nationalRebate = 0;

    // WA Battery Rebate - Tesla products are ineligible
    if (!isTesla) {
      const { value_per_kwh, max_capacity_kwh } = data.rebates.wa_battery_rebate;
      const eligibleCapacity = Math.min(capacityKwh, max_capacity_kwh);
      waRebate = eligibleCapacity * value_per_kwh;
    }

    // National Battery Rebate - all batteries eligible
    // Estimate certificates based on capacity (rough estimate: 1 certificate per kWh)
    const estimatedCertificates = Math.floor(capacityKwh);
    nationalRebate = estimatedCertificates * data.rebates.national_battery_rebate.value_per_certificate;

    return {
      waRebate,
      nationalRebate,
      totalRebate: waRebate + nationalRebate,
    };
  }

  async calculateSolarRebates(sizeKw: number): Promise<{
    stcRebate: number;
  }> {
    const data = await this.loadPricingData();
    
    // STC calculation: System size × Deeming period × Zone rating × STC price
    const currentYear = new Date().getFullYear();
    const deemingPeriod = Math.max(1, 2031 - currentYear);
    const zoneRating = 1.536; // Perth Zone 3
    const stcPrice = data.rebates.stc_rebate.value_per_certificate;
    
    const stcRebate = sizeKw * deemingPeriod * zoneRating * stcPrice;

    return {
      stcRebate: Math.round(stcRebate),
    };
  }

  async getMinimumPrices(): Promise<{
    solar: number;
    battery: number;
    ev: number;
    inverter: number;
  }> {
    const data = await this.loadPricingData();
    
    let minSolarPrice = Infinity;
    let minBatteryPrice = Infinity;
    let minEVPrice = Infinity;
    let minInverterPrice = Infinity;

    // Check both single-phase and three-phase for minimum prices
    for (const phaseType of ['single_phase', 'three_phase'] as const) {
      const phaseData = data[phaseType];

      // Find minimum solar price
      Object.values(phaseData.solar_panels).forEach(brand => {
        brand.packages.forEach(pkg => {
          if (pkg.price_after_rebate < minSolarPrice) {
            minSolarPrice = pkg.price_after_rebate;
          }
        });
      });

      // Find minimum inverter price
      Object.values(phaseData.hybrid_inverters).forEach(brand => {
        brand.models.forEach(model => {
          if (model.price_single < minInverterPrice) {
            minInverterPrice = model.price_single;
          }
        });
      });

      // Find minimum battery price
      Object.values(phaseData.batteries).forEach(brand => {
        brand.options.forEach(option => {
          if (option.price_after_rebate < minBatteryPrice) {
            minBatteryPrice = option.price_after_rebate;
          }
        });
      });

      // Find minimum EV charger price
      Object.values(phaseData.ev_chargers).forEach(brand => {
        brand.options.forEach(option => {
          if (option.installed_price < minEVPrice) {
            minEVPrice = option.installed_price;
          }
        });
      });
    }

    return {
      solar: minSolarPrice === Infinity ? 0 : minSolarPrice,
      battery: minBatteryPrice === Infinity ? 0 : minBatteryPrice,
      ev: minEVPrice === Infinity ? 0 : minEVPrice,
      inverter: minInverterPrice === Infinity ? 0 : minInverterPrice,
    };
  }

  async getAllProductsFlat(): Promise<any[]> {
    const data = await this.loadPricingData();
    const products: any[] = [];

    // Helper to generate unique UUID if ID doesn't exist
    const ensureId = (existingId: string | undefined): string => {
      return existingId || randomUUID();
    };

    // Process solar panels
    for (const phaseType of ['single_phase', 'three_phase'] as const) {
      const phaseData = data[phaseType];
      Object.entries(phaseData.solar_panels).forEach(([brandKey, brand]) => {
        brand.packages.forEach((pkg, index) => {
          const productId = ensureId(pkg.id);
          // Ensure ID is saved if it wasn't there
          if (!pkg.id) {
            pkg.id = productId;
          }
          products.push({
            id: productId,
            phase: phaseType,
            productType: 'solar',
            brand: brand.brand,
            model: brand.model,
            sizeKw: pkg.size_kw,
            panels: pkg.panels,
            wattage: pkg.wattage,
            priceAfterRebate: pkg.price_after_rebate,
            rrp: pkg.rrp || pkg.price_after_rebate, // Default to price_after_rebate if rrp not set
            warrantyYears: brand.warranty_product,
            brandKey,
            packageIndex: index,
          });
        });
      });

      // Process batteries
      Object.entries(phaseData.batteries).forEach(([brandKey, brand]) => {
        brand.options.forEach((option, index) => {
          const productId = ensureId(option.id);
          // Ensure ID is saved if it wasn't there
          if (!option.id) {
            option.id = productId;
          }
          products.push({
            id: productId,
            phase: phaseType,
            productType: 'battery',
            brand: brand.brand,
            model: brand.model,
            capacityKwh: option.capacity_kwh,
            priceAfterRebate: option.price_after_rebate,
            rrp: option.rrp || option.price_after_rebate, // Default to price_after_rebate if rrp not set
            powerKw: option.power_kw,
            warrantyYears: brand.warranty_years,
            brandKey,
            optionIndex: index,
          });
        });
      });

      // Process EV chargers
      Object.entries(phaseData.ev_chargers).forEach(([brandKey, brand]) => {
        brand.options.forEach((option, index) => {
          const productId = ensureId(option.id);
          // Ensure ID is saved if it wasn't there
          if (!option.id) {
            option.id = productId;
          }
          products.push({
            id: productId,
            phase: phaseType,
            productType: 'ev_charger',
            brand: brand.brand,
            model: brand.model,
            powerKw: option.power_kw,
            installedPrice: option.installed_price,
            rrp: option.rrp || option.installed_price, // Default to installed_price if rrp not set
            cableType: brand.cable_type,
            cableLength: brand.cable_length_m,
            brandKey,
            optionIndex: index,
          });
        });
      });
    }

    // Migrate old format IDs to UUIDs and save synchronously
    let needsSave = false;
    const idMap = new Map<string, string>(); // Map old IDs to new UUIDs
    const isOldFormatId = (id: string) => {
      // Check if ID is in old format (e.g., "solar-1ph-brand-6.6kw")
      return id && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    };

    for (const phaseType of ['single_phase', 'three_phase'] as const) {
      const phaseData = data[phaseType];
      
      // Check solar panels
      Object.values(phaseData.solar_panels).forEach((brand) => {
        brand.packages.forEach((pkg: any) => {
          if (!pkg.id || isOldFormatId(pkg.id)) {
            const oldId = pkg.id;
            const newId = randomUUID();
            pkg.id = newId;
            if (oldId) {
              idMap.set(oldId, newId);
            }
            needsSave = true;
          }
        });
      });

      // Check batteries
      Object.values(phaseData.batteries).forEach((brand) => {
        brand.options.forEach((opt: any) => {
          if (!opt.id || isOldFormatId(opt.id)) {
            const oldId = opt.id;
            const newId = randomUUID();
            opt.id = newId;
            if (oldId) {
              idMap.set(oldId, newId);
            }
            needsSave = true;
          }
        });
      });

      // Check EV chargers
      Object.values(phaseData.ev_chargers).forEach((brand) => {
        brand.options.forEach((opt: any) => {
          if (!opt.id || isOldFormatId(opt.id)) {
            const oldId = opt.id;
            const newId = randomUUID();
            opt.id = newId;
            if (oldId) {
              idMap.set(oldId, newId);
            }
            needsSave = true;
          }
        });
      });
    }

    // Update product IDs in the products array if they were migrated
    if (idMap.size > 0) {
      products.forEach((product) => {
        if (idMap.has(product.id)) {
          product.id = idMap.get(product.id)!;
        }
      });
    }

    // Save synchronously if any IDs were migrated (so updates work immediately)
    if (needsSave) {
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.writeFile(
        path.join(process.cwd(), 'pricing-data.json'),
        JSON.stringify(data, null, 2),
        'utf-8'
      );
      // Reload pricing data to ensure consistency
      this.pricingData = null;
    }

    return products;
  }

  async updateProduct(productId: string, productData: any): Promise<any> {
    const data = await this.loadPricingData();
    const newPhase = productData.phase as 'single_phase' | 'three_phase';
    const productType = productData.productType;
    const newBrandKey = productData.brand.toLowerCase().replace(/\s+/g, '_');

    // Helper to generate old format ID for fallback search
    const generateOldFormatId = (type: string, phase: string, brand: string, size?: string) => {
      const cleanBrand = brand.toLowerCase().replace(/\s+/g, '_');
      const sizeStr = size || '';
      const phaseStr = phase === 'single_phase' ? '1ph' : '3ph';
      return `${type}-${phaseStr}-${cleanBrand}-${sizeStr}`.toLowerCase();
    };

    // Helper to find product by ID across all phases and brands for a given type
    // Also supports finding by old format ID during migration
    const findProductInType = (
      type: 'solar' | 'battery' | 'ev_charger'
    ): {
      phase: 'single_phase' | 'three_phase';
      brandKey: string;
      brand: any;
      index: number;
      type: 'package' | 'option';
      actualId?: string;
    } | null => {
      for (const phaseType of ['single_phase', 'three_phase'] as const) {
        let phaseData: any;
        if (type === 'solar') {
          phaseData = data[phaseType].solar_panels;
        } else if (type === 'battery') {
          phaseData = data[phaseType].batteries;
        } else {
          phaseData = data[phaseType].ev_chargers;
        }

        for (const [brandKey, brand] of Object.entries(phaseData) as [string, any][]) {
          if (type === 'solar') {
            const index = brand.packages.findIndex((pkg: any) => {
              // Try exact ID match first
              if (pkg.id === productId) return true;
              // If productId is old format, try matching by old format generation
              if (productId.includes('-') && !productId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const oldFormatId = generateOldFormatId('solar', phaseType, brand.brand, `${pkg.size_kw}kw`);
                return oldFormatId === productId;
              }
              return false;
            });
            if (index >= 0) {
              return { phase: phaseType, brandKey, brand, index, type: 'package', actualId: brand.packages[index].id };
            }
          } else {
            const index = brand.options.findIndex((opt: any) => {
              // Try exact ID match first
              if (opt.id === productId) return true;
              // If productId is old format, try matching by old format generation
              if (productId.includes('-') && !productId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                if (type === 'battery') {
                  const oldFormatId = generateOldFormatId('battery', phaseType, brand.brand, `${opt.capacity_kwh}kwh`);
                  return oldFormatId === productId;
                } else {
                  const oldFormatId = generateOldFormatId('ev', phaseType, brand.brand, `${opt.power_kw}kw`);
                  return oldFormatId === productId;
                }
              }
              return false;
            });
            if (index >= 0) {
              return { phase: phaseType, brandKey, brand, index, type: 'option', actualId: brand.options[index].id };
            }
          }
        }
      }
      return null;
    };

    // Find existing product regardless of its current type
    const existing = (['solar', 'battery', 'ev_charger'] as const)
      .map((type) => {
        const result = findProductInType(type);
        return result ? { ...result, existingType: type } : null;
      })
      .find((result) => result !== null);

    if (!existing) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    const {
      phase: oldPhase,
      brandKey: oldBrandKey,
      brand: oldBrand,
      index: foundIndex,
      actualId,
      existingType,
    } = existing;

    const actualProductId = actualId || productId;

    // Remove from old location based on existing type
    if (existingType === 'solar') {
      oldBrand.packages.splice(foundIndex, 1);
      if (oldBrand.packages.length === 0) {
        delete data[oldPhase].solar_panels[oldBrandKey];
      }
    } else if (existingType === 'battery') {
      oldBrand.options.splice(foundIndex, 1);
      if (oldBrand.options.length === 0) {
        delete data[oldPhase].batteries[oldBrandKey];
      }
    } else if (existingType === 'ev_charger') {
      oldBrand.options.splice(foundIndex, 1);
      if (oldBrand.options.length === 0) {
        delete data[oldPhase].ev_chargers[oldBrandKey];
      }
    }

    if (productType === 'solar') {
      // Add to new location (create brand if doesn't exist)
      const newPhaseData = data[newPhase].solar_panels;
      if (!newPhaseData[newBrandKey]) {
        newPhaseData[newBrandKey] = {
          brand: productData.brand,
          model: productData.model,
          technology: oldBrand.technology || "Monocrystalline",
          warranty_product: productData.warrantyYears || oldBrand.warranty_product || 12,
          warranty_performance: oldBrand.warranty_performance || 25,
          packages: []
        };
      }
      
      // Add updated package with same ID (use actual ID if migrated)
      newPhaseData[newBrandKey].packages.push({
        id: actualProductId,
        size_kw: productData.sizeKw,
        panels: productData.panels,
        wattage: productData.wattage,
        price_after_rebate: productData.priceAfterRebate,
        rrp: productData.rrp || productData.priceAfterRebate,
        requires_inverter: true
      });
      
      // Update brand info
      newPhaseData[newBrandKey].brand = productData.brand;
      newPhaseData[newBrandKey].model = productData.model;
      newPhaseData[newBrandKey].warranty_product = productData.warrantyYears || newPhaseData[newBrandKey].warranty_product;
    } else if (productType === 'battery') {
      // Add to new location (create brand if doesn't exist)
      const newPhaseData = data[newPhase].batteries;
      if (!newPhaseData[newBrandKey]) {
        newPhaseData[newBrandKey] = {
          brand: productData.brand,
          model: productData.model,
          warranty_years: productData.warrantyYears || oldBrand.warranty_years || 10,
          options: []
        };
      }
      
      // Add updated option with same ID (use actual ID if migrated)
      newPhaseData[newBrandKey].options.push({
        id: actualProductId,
        capacity_kwh: productData.capacityKwh,
        price_after_rebate: productData.priceAfterRebate,
        rrp: productData.rrp || productData.priceAfterRebate,
        power_kw: productData.powerKw
      });
      
      // Update brand info
      newPhaseData[newBrandKey].brand = productData.brand;
      newPhaseData[newBrandKey].model = productData.model;
      newPhaseData[newBrandKey].warranty_years = productData.warrantyYears || newPhaseData[newBrandKey].warranty_years;
    } else if (productType === 'ev_charger') {
      // Add to new location (create brand if doesn't exist)
      const newPhaseData = data[newPhase].ev_chargers;
      if (!newPhaseData[newBrandKey]) {
        newPhaseData[newBrandKey] = {
          brand: productData.brand,
          model: productData.model,
          cable_type: productData.cableType || oldBrand.cable_type || "Tethered",
          cable_length_m: productData.cableLength || oldBrand.cable_length_m,
          options: []
        };
      }
      
      // Add updated option with same ID (use actual ID if migrated)
      newPhaseData[newBrandKey].options.push({
        id: actualProductId,
        power_kw: productData.powerKw,
        phase: newPhase === 'single_phase' ? '1-phase' : '3-phase',
        installed_price: productData.installedPrice,
        rrp: productData.rrp || productData.installedPrice
      });
      
      // Update brand info
      newPhaseData[newBrandKey].brand = productData.brand;
      newPhaseData[newBrandKey].model = productData.model;
      newPhaseData[newBrandKey].cable_type = productData.cableType || newPhaseData[newBrandKey].cable_type;
      newPhaseData[newBrandKey].cable_length_m = productData.cableLength ?? newPhaseData[newBrandKey].cable_length_m;
    }

    // Write updated data back to file
    const fs = await import('fs/promises');
    const path = await import('path');
    await fs.writeFile(
      path.join(process.cwd(), 'pricing-data.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    // Reload pricing data to reflect changes
    this.pricingData = null;
    await this.loadPricingData();

    return { success: true, phase: newPhase, productType, brand: productData.brand };
  }

  async deleteProduct(productId: string, phase: 'single_phase' | 'three_phase', productType: string, brandKey: string, index: number): Promise<any> {
    const data = await this.loadPricingData();

    if (productType === 'solar') {
      if (!data[phase].solar_panels[brandKey]) {
        throw new Error('Brand not found');
      }
      const brand = data[phase].solar_panels[brandKey];
      if (index >= 0 && index < brand.packages.length) {
        brand.packages.splice(index, 1);
        // If no packages left, remove the brand
        if (brand.packages.length === 0) {
          delete data[phase].solar_panels[brandKey];
        }
      } else {
        throw new Error('Package not found');
      }
    } else if (productType === 'battery') {
      if (!data[phase].batteries[brandKey]) {
        throw new Error('Brand not found');
      }
      const brand = data[phase].batteries[brandKey];
      if (index >= 0 && index < brand.options.length) {
        brand.options.splice(index, 1);
        // If no options left, remove the brand
        if (brand.options.length === 0) {
          delete data[phase].batteries[brandKey];
        }
      } else {
        throw new Error('Option not found');
      }
    } else if (productType === 'ev_charger') {
      if (!data[phase].ev_chargers[brandKey]) {
        throw new Error('Brand not found');
      }
      const brand = data[phase].ev_chargers[brandKey];
      if (index >= 0 && index < brand.options.length) {
        brand.options.splice(index, 1);
        // If no options left, remove the brand
        if (brand.options.length === 0) {
          delete data[phase].ev_chargers[brandKey];
        }
      } else {
        throw new Error('Option not found');
      }
    }

    // Write updated data back to file
    const fs = await import('fs/promises');
    const path = await import('path');
    await fs.writeFile(
      path.join(process.cwd(), 'pricing-data.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    // Reload pricing data to reflect changes
    this.pricingData = null;
    await this.loadPricingData();

    return { success: true };
  }

  async addProduct(productData: any): Promise<any> {
    const data = await this.loadPricingData();
    const phase = productData.phase as 'single_phase' | 'three_phase';
    const productType = productData.productType;

    // Generate a unique UUID for the product
    const generateUniqueId = () => randomUUID();

    // Add product based on type
    if (productType === 'solar') {
      const brandKey = productData.brand.toLowerCase().replace(/\s+/g, '_');
      
      // Check if brand exists, if not create it
      if (!data[phase].solar_panels[brandKey]) {
        data[phase].solar_panels[brandKey] = {
          brand: productData.brand,
          model: productData.model,
          technology: "Monocrystalline",
          warranty_product: productData.warrantyYears || 12,
          warranty_performance: 25,
          packages: []
        };
      }

      // Add package
      const newPackage = {
        id: generateUniqueId(),
        size_kw: productData.sizeKw,
        panels: productData.panels,
        wattage: productData.wattage,
        price_after_rebate: productData.priceAfterRebate,
        rrp: productData.rrp || productData.priceAfterRebate,
        requires_inverter: true
      };

      data[phase].solar_panels[brandKey].packages.push(newPackage);

    } else if (productType === 'battery') {
      const brandKey = productData.brand.toLowerCase().replace(/\s+/g, '_');
      
      // Check if brand exists, if not create it
      if (!data[phase].batteries[brandKey]) {
        data[phase].batteries[brandKey] = {
          brand: productData.brand,
          model: productData.model,
          warranty_years: productData.warrantyYears || 10,
          options: []
        };
      }

      // Add option
      const newOption = {
        id: generateUniqueId(),
        capacity_kwh: productData.capacityKwh,
        price_after_rebate: productData.priceAfterRebate,
        rrp: productData.rrp || productData.priceAfterRebate,
        power_kw: productData.powerKw
      };

      data[phase].batteries[brandKey].options.push(newOption);

    } else if (productType === 'ev_charger') {
      const brandKey = productData.brand.toLowerCase().replace(/\s+/g, '_');
      
      // Check if brand exists, if not create it
      if (!data[phase].ev_chargers[brandKey]) {
        data[phase].ev_chargers[brandKey] = {
          brand: productData.brand,
          model: productData.model,
          cable_type: productData.cableType || "Tethered",
          cable_length_m: productData.cableLength,
          options: []
        };
      }

      // Add option
      const newOption = {
        id: generateUniqueId(),
        power_kw: productData.powerKw,
        phase: phase === 'single_phase' ? '1-phase' : '3-phase',
        installed_price: productData.installedPrice,
        rrp: productData.rrp || productData.installedPrice
      };

      data[phase].ev_chargers[brandKey].options.push(newOption);
    }

    // Write updated data back to file
    const fs = await import('fs/promises');
    const path = await import('path');
    await fs.writeFile(
      path.join(process.cwd(), 'pricing-data.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    // Reload pricing data to reflect changes
    this.pricingData = null;
    await this.loadPricingData();

    return { success: true, phase, productType, brand: productData.brand };
  }
}

export const pricingDataService = new PricingDataService();
export type { PricingData, SolarPackage, InverterModel, BatteryOption, EVChargerOption };
