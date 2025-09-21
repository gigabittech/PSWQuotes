export interface QuoteFormData {
  // Step 1: System Requirements
  systems: ('solar' | 'battery' | 'ev')[];
  powerSupply: 'single' | 'three' | 'unknown';
  
  // Step 2: Product Selection
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  
  // Step 3: Property Details
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  additionalInfo?: string;
  switchboardPhoto?: File;
}

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
  customerName: string;
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
