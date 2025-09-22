import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/quote";

interface ProductSelectionProps {
  data: {
    systems?: string[];
    solarPackage?: string;
    batterySystem?: string;
    evCharger?: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isCalculating?: boolean;
  pricingData?: any;
  products: Product[];
}

export default function ProductSelection({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev, 
  isCalculating = false,
  pricingData,
  products 
}: ProductSelectionProps) {
  
  const solarProducts = products.filter(p => p.type === 'solar');
  const batteryProducts = products.filter(p => p.type === 'battery');
  const evProducts = products.filter(p => p.type === 'ev_charger');

  const handleProductSelect = (type: string, productId: string) => {
    onUpdate({ [type]: productId });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8" data-testid="product-selection">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center">
          Choose Your Solar System
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 px-4">
          Based on your selections, here are our recommended packages with real-time pricing.
        </p>

        {/* Solar Package Selection */}
        {data.systems?.includes('solar') && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">Solar Power Systems</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {solarProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.solarPackage === product.id}
                  onSelect={() => handleProductSelect('solarPackage', product.id)}
                  badge={product.popular ? "POPULAR" : undefined}
                  badgeColor="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  productType="solar"
                />
              ))}
            </div>
          </div>
        )}

        {/* Battery Selection */}
        {data.systems?.includes('battery') && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">Battery Storage Systems</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {batteryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.batterySystem === product.id}
                  onSelect={() => handleProductSelect('batterySystem', product.id)}
                  badge={product.popular ? "VALUE" : product.specifications?.premium ? "PREMIUM" : undefined}
                  badgeColor={product.popular ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"}
                  productType="battery"
                />
              ))}
            </div>
          </div>
        )}

        {/* EV Charger Selection */}
        {data.systems?.includes('ev') && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">EV Charging Solutions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {evProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.evCharger === product.id}
                  onSelect={() => handleProductSelect('evCharger', product.id)}
                  badge={product.popular ? "FAST CHARGING" : undefined}
                  badgeColor="bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                  productType="ev_charger"
                />
              ))}
            </div>
          </div>
        )}

      {/* Real-time Pricing Display */}
      {pricingData && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white">💰</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Current Quote Summary</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white/50 dark:bg-gray-900/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground mb-1">${pricingData.totalPrice?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total System Price</div>
            </div>
            <div className="text-center bg-white/50 dark:bg-gray-900/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">-${pricingData.rebateAmount?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Rebates & Incentives</div>
            </div>
            <div className="text-center bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg p-4 border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">${pricingData.finalPrice?.toLocaleString()}</div>
              <div className="text-sm font-medium text-primary/80">Your Investment</div>
            </div>
          </div>
        </div>
      )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 mt-8">
          <button
            className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto min-h-[56px] touch-manipulation shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            onClick={onPrev}
            data-testid="button-back"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back
            </span>
          </button>
          <button
            className={cn(
              "group relative bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto min-h-[56px] touch-manipulation shadow-xl",
              "hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-xl"
            )}
            onClick={onNext}
            disabled={isCalculating}
            data-testid="button-continue-to-details"
          >
            <span className="flex items-center justify-center">
              <span className="mr-3">
                {isCalculating ? "Calculating..." : "Continue to Property Details"}
              </span>
              {!isCalculating && (
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
              {isCalculating && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </span>
            
            {/* Shine effect on hover */}
            {!isCalculating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 rounded-xl"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
