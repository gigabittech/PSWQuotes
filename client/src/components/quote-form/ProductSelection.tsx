import { useQuery } from "@tanstack/react-query";
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
    <div className="p-8" data-testid="product-selection">
      <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
        Choose Your Solar System
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Based on your selections, here are our recommended packages with real-time pricing.
      </p>

      {/* Solar Package Selection */}
      {data.systems?.includes('solar') && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Solar Power Systems</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Battery Storage Systems</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">EV Charging Solutions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {evProducts.map((product) => (
              <div
                key={product.id}
                className={`pricing-card border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  data.evCharger === product.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                }`}
                onClick={() => handleProductSelect('evCharger', product.id)}
                data-testid={`ev-charger-${product.id}`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-foreground mb-2">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.capacity}, {product.specifications?.cable || 'Standard cable'}
                  </p>
                  <div className="text-lg font-bold text-primary">${parseFloat(product.price).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Installed</div>
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

      <div className="flex justify-between">
        <button
          className="bg-muted-foreground hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          onClick={onPrev}
          data-testid="button-back"
        >
          <span className="mr-2">←</span>
          Back
        </button>
        <button
          className="bg-primary hover:bg-blue-700 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          onClick={onNext}
          disabled={isCalculating}
          data-testid="button-continue-to-details"
        >
          {isCalculating ? "Calculating..." : "Continue to Property Details"}
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}
