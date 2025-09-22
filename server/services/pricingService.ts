import { storage } from '../storage';
import type { Product } from '@shared/schema';

interface PricingCalculationParams {
  systemTypes: string[];
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  powerSupply: string;
  postcode?: string;
  averageMonthlyBill?: number;
  roofDirection?: string;
  currentElectricityRate?: number;
}

interface RebateBreakdown {
  stcRebate: number;
  stateRebate: number;
  localRebate: number;
  totalRebates: number;
}

interface FinancingOption {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  interestRate: number;
  termYears: number;
}

interface SavingsProjection {
  yearOne: number;
  year5: number;
  year10: number;
  year25: number;
  lifetimeSavings: number;
  paybackPeriod: number;
  returnOnInvestment: number;
}

interface EnvironmentalImpact {
  co2ReductionAnnual: number;
  co2ReductionLifetime: number;
  treesEquivalent: number;
  carsOffRoadEquivalent: number;
}

interface PricingResult {
  totalPrice: string;
  subtotal: string;
  rebatesTotal: string;
  finalPrice: string;
  rebateBreakdown: RebateBreakdown;
  financingOptions: FinancingOption[];
  savingsProjection: SavingsProjection;
  environmentalImpact: EnvironmentalImpact;
  annualSavings?: string;
  paybackPeriod?: string;
  co2Reduction?: string;
}

class PricingService {
  async calculateQuotePrice(params: PricingCalculationParams): Promise<PricingResult> {
    let subtotal = 0;
    let systemCapacity = 0;
    let batteryCapacity = 0;
    const selectedProducts: Product[] = [];

    // Calculate solar pricing and capacity
    if (params.systemTypes.includes('solar') && params.solarPackage) {
      const solarProducts = await storage.getProductsByType('solar');
      const solarProduct = solarProducts.find((p: Product) => p.name === params.solarPackage);
      if (solarProduct) {
        subtotal += parseFloat(solarProduct.price.toString());
        systemCapacity = parseFloat(solarProduct.capacity?.replace('kW', '') || '0');
        selectedProducts.push(solarProduct);
      }
    }

    // Calculate battery pricing and capacity
    if (params.systemTypes.includes('battery') && params.batterySystem) {
      const batteryProducts = await storage.getProductsByType('battery');
      const batteryProduct = batteryProducts.find((p: Product) => p.name === params.batterySystem);
      if (batteryProduct) {
        subtotal += parseFloat(batteryProduct.price.toString());
        batteryCapacity = parseFloat(batteryProduct.capacity?.replace('kWh', '') || '0');
        selectedProducts.push(batteryProduct);
      }
    }

    // Calculate EV charger pricing
    if (params.systemTypes.includes('ev') && params.evCharger) {
      const evProducts = await storage.getProductsByType('ev_charger');
      const evProduct = evProducts.find((p: Product) => p.name === params.evCharger);
      if (evProduct) {
        subtotal += parseFloat(evProduct.price.toString());
        selectedProducts.push(evProduct);
      }
    }

    // Calculate advanced rebate breakdown
    const rebateBreakdown = this.calculateAdvancedRebates(systemCapacity, batteryCapacity, params.postcode);
    const finalPrice = subtotal - rebateBreakdown.totalRebates;

    // Calculate comprehensive savings projection
    const savingsProjection = this.calculateSavingsProjection(
      systemCapacity, 
      batteryCapacity, 
      finalPrice, 
      params
    );

    // Calculate environmental impact
    const environmentalImpact = this.calculateEnvironmentalImpact(systemCapacity);

    // Calculate financing options
    const financingOptions = this.calculateFinancingOptions(finalPrice);

    // Legacy calculations for backwards compatibility
    const annualSavings = savingsProjection.yearOne;
    const paybackPeriod = `${savingsProjection.paybackPeriod} years`;
    const co2Reduction = environmentalImpact.co2ReductionAnnual;

    return {
      totalPrice: subtotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      rebatesTotal: rebateBreakdown.totalRebates.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      rebateBreakdown,
      financingOptions,
      savingsProjection,
      environmentalImpact,
      annualSavings: annualSavings > 0 ? annualSavings.toFixed(2) : undefined,
      paybackPeriod: savingsProjection.paybackPeriod > 0 ? paybackPeriod : undefined,
      co2Reduction: co2Reduction > 0 ? co2Reduction.toFixed(1) : undefined,
    };
  }

  private calculateAdvancedRebates(solarCapacity: number, batteryCapacity: number, postcode?: string): RebateBreakdown {
    let stcRebate = 0;
    let stateRebate = 0;
    let localRebate = 0;

    // Small-scale Technology Certificates (STC) - Federal rebate
    if (solarCapacity > 0) {
      // STC calculation: System size × Deeming period × Zone rating × STC price
      // Perth is Zone 4, deeming period decreases each year until 2030
      const currentYear = new Date().getFullYear();
      const deemingPeriod = Math.max(1, 2031 - currentYear);
      const zoneRating = 1.536; // Perth Zone 4
      const stcPrice = 35; // Approximate current STC price
      
      stcRebate = solarCapacity * deemingPeriod * zoneRating * stcPrice;
    }

    // WA State Government Rebates
    if (postcode && this.isWAPostcode(postcode)) {
      // Solar rebate for households under income threshold
      if (solarCapacity >= 6.6) {
        stateRebate += Math.min(2400, solarCapacity * 300);
      }
      
      // Battery rebate - up to $3000 for eligible households
      if (batteryCapacity > 0) {
        stateRebate += Math.min(3000, batteryCapacity * 300);
      }
    }

    // Local council rebates (example for Perth metro)
    if (postcode && this.isPerthMetro(postcode)) {
      if (solarCapacity > 0) {
        localRebate += 500; // Example local council solar rebate
      }
      if (batteryCapacity > 0) {
        localRebate += 300; // Example local council battery rebate
      }
    }

    const totalRebates = stcRebate + stateRebate + localRebate;

    return {
      stcRebate: Math.round(stcRebate),
      stateRebate: Math.round(stateRebate),
      localRebate: Math.round(localRebate),
      totalRebates: Math.round(totalRebates)
    };
  }

  private calculateSavingsProjection(
    solarCapacity: number, 
    batteryCapacity: number, 
    systemCost: number, 
    params: PricingCalculationParams
  ): SavingsProjection {
    // Base electricity rate (WA average: $0.29/kWh)
    const electricityRate = params.currentElectricityRate || 0.29;
    const feedInTariff = 0.10; // WA feed-in tariff
    const annualInflation = 0.025; // 2.5% annual electricity price increase
    
    // Solar generation calculation (Perth gets ~4.5 peak sun hours)
    const peakSunHours = this.getPeakSunHours(params.roofDirection);
    const annualGeneration = solarCapacity * peakSunHours * 365;
    
    // Self-consumption vs export ratios
    let selfConsumptionRatio = 0.30; // Default 30% self-consumption
    let exportRatio = 0.70; // 70% exported to grid
    
    if (batteryCapacity > 0) {
      // Battery increases self-consumption
      selfConsumptionRatio = Math.min(0.80, 0.30 + (batteryCapacity / solarCapacity) * 0.3);
      exportRatio = 1 - selfConsumptionRatio;
    }
    
    const annualSelfConsumption = annualGeneration * selfConsumptionRatio;
    const annualExport = annualGeneration * exportRatio;
    
    // Year 1 savings
    const yearOneSavings = (annualSelfConsumption * electricityRate) + (annualExport * feedInTariff);
    
    // Calculate savings over time with electricity price inflation
    let year5Savings = 0;
    let year10Savings = 0;
    let year25Savings = 0;
    let lifetimeSavings = 0;
    
    for (let year = 1; year <= 25; year++) {
      const inflatedRate = electricityRate * Math.pow(1 + annualInflation, year - 1);
      const systemDegradation = Math.pow(0.995, year - 1); // 0.5% annual degradation
      
      const yearlyGeneration = annualGeneration * systemDegradation;
      const yearlySelfConsumption = yearlyGeneration * selfConsumptionRatio;
      const yearlyExport = yearlyGeneration * exportRatio;
      
      const yearlySavings = (yearlySelfConsumption * inflatedRate) + (yearlyExport * feedInTariff);
      lifetimeSavings += yearlySavings;
      
      if (year === 5) year5Savings = yearlySavings;
      if (year === 10) year10Savings = yearlySavings;
      if (year === 25) year25Savings = yearlySavings;
    }
    
    // Calculate payback period
    let cumulativeSavings = 0;
    let paybackPeriod = 0;
    
    for (let year = 1; year <= 25; year++) {
      const inflatedRate = electricityRate * Math.pow(1 + annualInflation, year - 1);
      const systemDegradation = Math.pow(0.995, year - 1);
      const yearlyGeneration = annualGeneration * systemDegradation;
      const yearlySavings = (yearlyGeneration * selfConsumptionRatio * inflatedRate) + 
                           (yearlyGeneration * exportRatio * feedInTariff);
      
      cumulativeSavings += yearlySavings;
      
      if (cumulativeSavings >= systemCost && paybackPeriod === 0) {
        paybackPeriod = year + (systemCost - (cumulativeSavings - yearlySavings)) / yearlySavings;
        break;
      }
    }
    
    const returnOnInvestment = systemCost > 0 ? (lifetimeSavings / systemCost) * 100 : 0;
    
    return {
      yearOne: Math.round(yearOneSavings),
      year5: Math.round(year5Savings),
      year10: Math.round(year10Savings),
      year25: Math.round(year25Savings),
      lifetimeSavings: Math.round(lifetimeSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10, // Round to 1 decimal
      returnOnInvestment: Math.round(returnOnInvestment)
    };
  }

  private calculateEnvironmentalImpact(solarCapacity: number): EnvironmentalImpact {
    if (solarCapacity === 0) {
      return {
        co2ReductionAnnual: 0,
        co2ReductionLifetime: 0,
        treesEquivalent: 0,
        carsOffRoadEquivalent: 0
      };
    }
    
    // Perth averages ~4.5 peak sun hours per day
    const annualGeneration = solarCapacity * 4.5 * 365;
    
    // WA grid emission factor: ~0.7 kg CO2 per kWh
    const emissionFactor = 0.7;
    const co2ReductionAnnual = annualGeneration * emissionFactor;
    
    // Calculate 25-year impact with system degradation
    let co2ReductionLifetime = 0;
    for (let year = 1; year <= 25; year++) {
      const systemDegradation = Math.pow(0.995, year - 1); // 0.5% annual degradation
      const yearlyGeneration = annualGeneration * systemDegradation;
      co2ReductionLifetime += yearlyGeneration * emissionFactor;
    }
    
    // Convert to meaningful equivalents
    const treesEquivalent = Math.round(co2ReductionLifetime / 22); // 1 tree absorbs ~22kg CO2/year
    const carsOffRoadEquivalent = Math.round(co2ReductionLifetime / 4600); // Average car emits ~4.6 tonnes CO2/year
    
    return {
      co2ReductionAnnual: Math.round(co2ReductionAnnual),
      co2ReductionLifetime: Math.round(co2ReductionLifetime),
      treesEquivalent,
      carsOffRoadEquivalent
    };
  }

  private calculateFinancingOptions(systemCost: number): FinancingOption[] {
    const options: FinancingOption[] = [];
    
    // Green loan options with different terms and rates
    const financingTerms = [
      { years: 5, rate: 0.065 }, // 6.5% for 5 years
      { years: 7, rate: 0.075 }, // 7.5% for 7 years
      { years: 10, rate: 0.085 } // 8.5% for 10 years
    ];
    
    financingTerms.forEach(term => {
      const monthlyRate = term.rate / 12;
      const numPayments = term.years * 12;
      
      // Calculate monthly payment using loan formula
      const monthlyPayment = systemCost * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      const totalPayments = monthlyPayment * numPayments;
      const totalInterest = totalPayments - systemCost;
      
      options.push({
        loanAmount: Math.round(systemCost),
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalPayments: Math.round(totalPayments),
        interestRate: term.rate,
        termYears: term.years
      });
    });
    
    return options;
  }

  private getPeakSunHours(roofDirection?: string): number {
    // Perth peak sun hours by roof direction
    switch (roofDirection?.toLowerCase()) {
      case 'north': return 4.8;
      case 'northeast': return 4.6;
      case 'northwest': return 4.6;
      case 'east': return 4.2;
      case 'west': return 4.2;
      case 'southeast': return 3.8;
      case 'southwest': return 3.8;
      case 'south': return 3.2;
      default: return 4.5; // Average for mixed orientations
    }
  }

  private isWAPostcode(postcode: string): boolean {
    const waPostcodes = /^(6[0-7]\d{2})$/;
    return waPostcodes.test(postcode);
  }

  private isPerthMetro(postcode: string): boolean {
    const perthMetroPostcodes = /^(6[0-1]\d{2}|6[2][0-5]\d)$/;
    return perthMetroPostcodes.test(postcode);
  }

  // Legacy methods for backwards compatibility
  private calculateAnnualSavings(params: PricingCalculationParams): number {
    let solarCapacity = 0;
    let batteryCapacity = 0;
    
    if (params.solarPackage?.includes('6.6')) solarCapacity = 6.6;
    else if (params.solarPackage?.includes('10')) solarCapacity = 10;
    else if (params.solarPackage?.includes('13')) solarCapacity = 13;
    
    if (params.systemTypes.includes('battery')) batteryCapacity = 10; // Default battery size
    
    const projection = this.calculateSavingsProjection(solarCapacity, batteryCapacity, 0, params);
    return projection.yearOne;
  }

  private calculateCO2Reduction(params: PricingCalculationParams): number {
    let solarCapacity = 0;
    
    if (params.solarPackage?.includes('6.6')) solarCapacity = 6.6;
    else if (params.solarPackage?.includes('10')) solarCapacity = 10;
    else if (params.solarPackage?.includes('13')) solarCapacity = 13;
    
    const impact = this.calculateEnvironmentalImpact(solarCapacity);
    return impact.co2ReductionAnnual / 1000; // Convert to tonnes
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
