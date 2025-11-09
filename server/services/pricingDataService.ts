import { promises as fs } from 'fs';
import path from 'path';

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
  size_kw: number;
  panels: number;
  wattage: number;
  price_after_rebate: number;
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
  power_kw: number;
  phase: string;
  installed_price: number;
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

  async addProduct(productData: any): Promise<any> {
    const data = await this.loadPricingData();
    const phase = productData.phase as 'single_phase' | 'three_phase';
    const productType = productData.productType;

    // Generate a unique ID for the product
    const generateId = (type: string, brand: string, size?: string) => {
      const cleanBrand = brand.toLowerCase().replace(/\s+/g, '_');
      const sizeStr = size || '';
      return `${type}-${phase === 'single_phase' ? '1ph' : '3ph'}-${cleanBrand}-${sizeStr}`.toLowerCase();
    };

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
        id: generateId('solar', productData.brand, `${productData.sizeKw}kw`),
        size_kw: productData.sizeKw,
        panels: productData.panels,
        wattage: productData.wattage,
        price_after_rebate: productData.priceAfterRebate,
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
        id: generateId('battery', productData.brand, `${productData.capacityKwh}kwh`),
        capacity_kwh: productData.capacityKwh,
        price_after_rebate: productData.priceAfterRebate,
        rrp: productData.rrp,
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
        id: generateId('ev', productData.brand, `${productData.powerKw}kw`),
        power_kw: productData.powerKw,
        phase: phase === 'single_phase' ? '1-phase' : '3-phase',
        installed_price: productData.installedPrice
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
