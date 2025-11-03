export interface QuoteFormData {
  // Step 1: System Requirements
  systems: ('solar' | 'battery' | 'ev')[];
  powerSupply: 'single' | 'three' | 'unknown';
  
  // Step 2: Product Selection
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  
  // Step 3: Property Details
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  additionalInfo?: string;
  switchboardPhoto?: File;
  roofDirection?: string;
  averageMonthlyBill?: number;
  currentElectricityRate?: number;
}

export interface RebateBreakdown {
  stcRebate: number;
  stateRebate: number;
  localRebate: number;
  totalRebates: number;
}

export interface FinancingOption {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  interestRate: number;
  termYears: number;
}

export interface SavingsProjection {
  yearOne: number;
  year5: number;
  year10: number;
  year25: number;
  lifetimeSavings: number;
  paybackPeriod: number;
  returnOnInvestment: number;
}

export interface EnvironmentalImpact {
  co2ReductionAnnual: number;
  co2ReductionLifetime: number;
  treesEquivalent: number;
  carsOffRoadEquivalent: number;
}

export interface EnhancedPricingData {
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

// Legacy interface for backwards compatibility
export interface PricingData {
  totalPrice: number;
  rebateAmount: number;
  finalPrice: number;
  breakdown: {
    solar?: Product;
    battery?: Product;
    ev?: Product;
  };
}

export interface Product {
  id: string;
  name: string;
  type: 'solar' | 'battery' | 'ev_charger';
  category: string;
  capacity: string;
  price: string;
  rebateEligible: boolean;
  rebateAmount?: string;
  specifications: {
    [key: string]: any;
  };
  warranty: string;
  popular: boolean;
  active: boolean;
  createdAt?: string;
}

export interface Quote {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  powerSupply: string;
  selectedSystems: string[];
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  totalPrice: string;
  rebateAmount: string;
  finalPrice: string;
  additionalInfo?: string;
  switchboardPhotoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
