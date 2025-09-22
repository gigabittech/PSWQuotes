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
                  badgeColor="bg-secondary text-secondary-foreground"
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
                  badgeColor={product.popular ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}
                />
              ))}
            </div>
          </div>
        )}

        {/* EV Charger Selection */}
        {data.systems?.includes('ev') && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">EV Charging Solutions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {evProducts.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "pricing-card border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg touch-manipulation min-h-[140px] sm:min-h-[160px]",
                    data.evCharger === product.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary active:scale-[0.98]"
                  )}
                  onClick={() => handleProductSelect('evCharger', product.id)}
                  data-testid={`ev-charger-${product.id}`}
                >
                  <div className="text-center h-full flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base leading-tight">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3 leading-tight">
                        {product.capacity}, {product.specifications?.cable || 'Standard cable'}
                      </p>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-primary">${parseFloat(product.price).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Installed</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Real-time Pricing Display */}
      {pricingData && (
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Quote Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">${pricingData.totalPrice?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total System Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">-${pricingData.rebateAmount?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Rebates & Incentives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">${pricingData.finalPrice?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Your Investment</div>
            </div>
          </div>
        </div>
      )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 mt-8">
          <button
            className="bg-muted-foreground hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto min-h-[48px] touch-manipulation"
            onClick={onPrev}
            data-testid="button-back"
          >
            <span className="mr-2">←</span>
            Back
          </button>
          <button
            className="bg-primary hover:bg-blue-700 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto min-h-[48px] touch-manipulation"
            onClick={onNext}
            disabled={isCalculating}
            data-testid="button-continue-to-details"
          >
            {isCalculating ? "Calculating..." : "Continue to Property Details"}
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
