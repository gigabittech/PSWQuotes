import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PricingRequest {
  selectedSystems: string[];
  solarPackage?: string;
  batterySystem?: string;
  evCharger?: string;
  powerSupply: string;
}

interface PricingResponse {
  totalPrice: number;
  rebateAmount: number;
  finalPrice: number;
  breakdown: {
    solarPrice: number;
    batteryPrice: number;
    evPrice: number;
    solarRebate: number;
    batteryRebate: number;
  };
}

export function usePricingCalculator() {
  const [pricing, setPricing] = useState<PricingResponse>({
    totalPrice: 0,
    rebateAmount: 0,
    finalPrice: 0,
    breakdown: {
      solarPrice: 0,
      batteryPrice: 0,
      evPrice: 0,
      solarRebate: 0,
      batteryRebate: 0,
    },
  });

  const pricingMutation = useMutation({
    mutationFn: async (data: PricingRequest) => {
      const response = await apiRequest('POST', '/api/calculate-pricing', data);
      return response.json();
    },
    onSuccess: (data: PricingResponse) => {
      setPricing(data);
    },
  });

  const calculatePricing = (request: PricingRequest) => {
    // Only calculate if there are systems selected
    if (request.selectedSystems.length > 0) {
      pricingMutation.mutate(request);
    } else {
      // Reset pricing and clear any errors if no systems selected
      pricingMutation.reset();
      setPricing({
        totalPrice: 0,
        rebateAmount: 0,
        finalPrice: 0,
        breakdown: {
          solarPrice: 0,
          batteryPrice: 0,
          evPrice: 0,
          solarRebate: 0,
          batteryRebate: 0,
        },
      });
    }
  };

  return {
    pricing,
    calculatePricing,
    isCalculating: pricingMutation.isPending,
    error: pricingMutation.error,
  };
}
