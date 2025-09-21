import { solarProducts, batteryProducts, evChargerProducts } from '../data/products';

export interface PricingBreakdown {
  totalPrice: number;
  rebateAmount: number;
  finalPrice: number;
  breakdown: {
    solar?: any;
    battery?: any;
    ev?: any;
  };
}

export function calculatePricing(
  selectedSystems: string[],
  solarPackage?: string,
  batterySystem?: string,
  evCharger?: string
): PricingBreakdown {
  let totalPrice = 0;
  let rebateAmount = 0;
  const breakdown: any = {};

  // Calculate solar pricing
  if (selectedSystems.includes('solar') && solarPackage) {
    const solarProduct = [...solarProducts].find(p => p.id === solarPackage);
    if (solarProduct) {
      totalPrice += parseFloat(solarProduct.price);
      if (solarProduct.rebateEligible && solarProduct.rebateAmount) {
        rebateAmount += parseFloat(solarProduct.rebateAmount);
      }
      breakdown.solar = solarProduct;
    }
  }

  // Calculate battery pricing
  if (selectedSystems.includes('battery') && batterySystem) {
    const batteryProduct = [...batteryProducts].find(p => p.id === batterySystem);
    if (batteryProduct) {
      totalPrice += parseFloat(batteryProduct.price);
      if (batteryProduct.rebateEligible && batteryProduct.rebateAmount) {
        rebateAmount += parseFloat(batteryProduct.rebateAmount);
      }
      breakdown.battery = batteryProduct;
    }
  }

  // Calculate EV charger pricing
  if (selectedSystems.includes('ev') && evCharger) {
    const evProduct = [...evChargerProducts].find(p => p.id === evCharger);
    if (evProduct) {
      totalPrice += parseFloat(evProduct.price);
      breakdown.ev = evProduct;
    }
  }

  const finalPrice = totalPrice - rebateAmount;

  return {
    totalPrice,
    rebateAmount,
    finalPrice,
    breakdown,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('$', '$');
}
