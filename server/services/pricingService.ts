import { storage } from '../storage';
import type { Product } from '@shared/schema';

interface PricingCalculationParams {
  systemTypes: string[];
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  powerSupply: string;
}

interface PricingResult {
  totalPrice: string;
  subtotal: string;
  rebatesTotal: string;
  annualSavings?: string;
  paybackPeriod?: string;
  co2Reduction?: string;
}

class PricingService {
  async calculateQuotePrice(params: PricingCalculationParams): Promise<PricingResult> {
    let subtotal = 0;
    let rebatesTotal = 0;

    // Calculate solar pricing
    if (params.systemTypes.includes('solar') && params.solarPackage) {
      const solarProducts = await storage.getProductsByCategory('solar', params.powerSupply);
      const solarProduct = solarProducts.find(p => p.model === params.solarPackage);
      if (solarProduct) {
        subtotal += parseFloat(solarProduct.price);
        rebatesTotal += parseFloat(solarProduct.rebateAmount || '0');
      }
    }

    // Calculate battery pricing
    if (params.systemTypes.includes('battery') && params.batterySystem) {
      const batteryProducts = await storage.getProductsByCategory('battery');
      const batteryProduct = batteryProducts.find(p => p.model === params.batterySystem);
      if (batteryProduct) {
        subtotal += parseFloat(batteryProduct.price);
        rebatesTotal += parseFloat(batteryProduct.rebateAmount || '0');
      }
    }

    // Calculate EV charger pricing
    if (params.systemTypes.includes('ev') && params.evCharger) {
      const evProducts = await storage.getProductsByCategory('ev_charger');
      const evProduct = evProducts.find(p => p.model === params.evCharger);
      if (evProduct) {
        subtotal += parseFloat(evProduct.price);
        rebatesTotal += parseFloat(evProduct.rebateAmount || '0');
      }
    }

    const totalPrice = subtotal - rebatesTotal;

    // Calculate estimated savings and payback (simplified calculation)
    const annualSavings = this.calculateAnnualSavings(params);
    const paybackPeriod = annualSavings > 0 ? Math.ceil(totalPrice / annualSavings) + ' years' : undefined;
    const co2Reduction = this.calculateCO2Reduction(params);

    return {
      totalPrice: totalPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
      rebatesTotal: rebatesTotal.toFixed(2),
      annualSavings: annualSavings > 0 ? annualSavings.toFixed(2) : undefined,
      paybackPeriod,
      co2Reduction: co2Reduction > 0 ? co2Reduction.toFixed(1) : undefined,
    };
  }

  private calculateAnnualSavings(params: PricingCalculationParams): number {
    // Simplified calculation - would be more complex in reality
    let savings = 0;
    
    if (params.systemTypes.includes('solar')) {
      if (params.solarPackage?.includes('6.6')) savings += 2100;
      else if (params.solarPackage?.includes('10')) savings += 3200;
      else if (params.solarPackage?.includes('13')) savings += 4100;
    }
    
    if (params.systemTypes.includes('battery')) {
      savings += 800; // Additional savings from battery usage
    }
    
    return savings;
  }

  private calculateCO2Reduction(params: PricingCalculationParams): number {
    // Simplified calculation based on system size
    let co2 = 0;
    
    if (params.systemTypes.includes('solar')) {
      if (params.solarPackage?.includes('6.6')) co2 += 5.2;
      else if (params.solarPackage?.includes('10')) co2 += 7.9;
      else if (params.solarPackage?.includes('13')) co2 += 10.3;
    }
    
    return co2;
  }

  async seedProducts(): Promise<void> {
    // Seed solar products
    const solarProducts = [
      {
        category: 'solar',
        subcategory: 'single_phase',
        name: '6.6kW Solar System',
        brand: 'Risen',
        model: 'solar-6.6kw',
        capacity: '6.6kW',
        panels: 15,
        panelWattage: 440,
        price: '7078.00',
        rebateAmount: '2088.00',
        warrantyYears: 15,
        description: 'Risen N-Type 440W panels with premium inverter',
        features: ['15 × 440W panels', '15 years warranty', '~10,500 kWh annual generation'],
        annualGeneration: 10500,
        isPopular: true,
        isActive: true,
      },
      {
        category: 'solar',
        subcategory: 'single_phase',
        name: '10kW Solar System',
        brand: 'Jinko',
        model: 'solar-10kw',
        capacity: '10kW',
        panels: 21,
        panelWattage: 475,
        price: '9890.00',
        rebateAmount: '3327.00',
        warrantyYears: 25,
        description: 'Jinko Neo 475W panels with hybrid-ready inverter',
        features: ['21 × 475W panels', '25 years warranty', '~15,900 kWh annual generation'],
        annualGeneration: 15900,
        isActive: true,
      },
      {
        category: 'solar',
        subcategory: 'three_phase',
        name: '13kW Solar System',
        brand: 'AIKO',
        model: 'solar-13kw',
        capacity: '13kW',
        panels: 27,
        panelWattage: 475,
        price: '12990.00',
        rebateAmount: '4159.00',
        warrantyYears: 25,
        description: 'AIKO Neostar 3S 475W premium efficiency panels',
        features: ['27 × 475W panels', '25 years warranty', '~20,700 kWh annual generation'],
        annualGeneration: 20700,
        isActive: true,
      }
    ];

    // Seed battery products
    const batteryProducts = [
      {
        category: 'battery',
        name: 'Tesla Powerwall 3',
        brand: 'Tesla',
        model: 'tesla-powerwall3',
        capacity: '13.5kWh',
        price: '10990.00',
        rebateAmount: '0.00',
        warrantyYears: 10,
        description: '13.5kWh capacity with integrated inverter',
        features: ['13.5 kWh usable capacity', '10 years warranty', 'Blackout protection included'],
        isPremium: true,
        isActive: true,
      },
      {
        category: 'battery',
        name: 'Alpha ESS SMILE-M5',
        brand: 'Alpha ESS',
        model: 'alpha-smile-m5',
        capacity: '10.1kWh',
        price: '9490.00',
        rebateAmount: '3000.00',
        warrantyYears: 10,
        description: '10.1kWh modular lithium battery system',
        features: ['10.1 kWh usable capacity', '10 years warranty', 'Expandable modular design'],
        isPopular: true,
        isActive: true,
      },
      {
        category: 'battery',
        name: 'Sigenergy SigenStor',
        brand: 'Sigenergy',
        model: 'sigenergy-sigenstor',
        capacity: '25.6kWh',
        price: '16990.00',
        rebateAmount: '0.00',
        warrantyYears: 10,
        description: '25.6kWh AC coupled battery system',
        features: ['25.6 kWh usable capacity', '10 years warranty', 'EV charging ready'],
        isActive: true,
      }
    ];

    // Seed EV charger products
    const evProducts = [
      {
        category: 'ev_charger',
        name: 'Tesla Wall Connector',
        brand: 'Tesla',
        model: 'tesla-wall-connector',
        capacity: '11kW',
        price: '2090.00',
        rebateAmount: '0.00',
        description: '11kW, 7.3m cable',
        features: ['11kW charging power', '7.3m cable length'],
        isActive: true,
      },
      {
        category: 'ev_charger',
        name: 'Fronius Wattpilot',
        brand: 'Fronius',
        model: 'fronius-wattpilot',
        capacity: '22kW',
        price: '3290.00',
        rebateAmount: '0.00',
        description: '22kW, untethered',
        features: ['22kW charging power', 'Untethered design'],
        isActive: true,
      },
      {
        category: 'ev_charger',
        name: 'GoodWe HCA',
        brand: 'GoodWe',
        model: 'goodwe-hca',
        capacity: '11kW',
        price: '2390.00',
        rebateAmount: '0.00',
        description: '11kW, 6m cable',
        features: ['11kW charging power', '6m cable length'],
        isActive: true,
      },
      {
        category: 'ev_charger',
        name: 'Growatt Thor',
        brand: 'Growatt',
        model: 'growatt-thor',
        capacity: '22kW',
        price: '2790.00',
        rebateAmount: '0.00',
        description: '22kW, 5m cable',
        features: ['22kW charging power', '5m cable length'],
        isActive: true,
      }
    ];

    // Insert all products
    for (const product of [...solarProducts, ...batteryProducts, ...evProducts]) {
      try {
        await storage.createProduct(product as any);
      } catch (error) {
        console.log(`Product ${product.name} may already exist`);
      }
    }

    console.log('Products seeded successfully');
  }
}

export const pricingService = new PricingService();
