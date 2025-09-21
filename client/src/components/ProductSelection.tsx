import { cn } from "@/lib/utils";
import { solarProducts, batteryProducts, evChargerProducts } from "../data/products";

interface ProductSelectionProps {
  selectedSystems: string[];
  solarPackage: string;
  batterySystem: string;
  evCharger: string;
  onSolarSelect: (packageId: string) => void;
  onBatterySelect: (batteryId: string) => void;
  onEvSelect: (evId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProductSelection({
  selectedSystems,
  solarPackage,
  batterySystem,
  evCharger,
  onSolarSelect,
  onBatterySelect,
  onEvSelect,
  onNext,
  onBack,
}: ProductSelectionProps) {
  return (
    <div className="p-8" data-testid="product-selection">
      <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
        Choose Your Solar System
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Based on your selections, here are our recommended packages with real-time pricing.
      </p>

      {/* Solar Package Selection */}
      {selectedSystems.includes('solar') && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Solar Power Systems</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {solarProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "pricing-card border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative",
                  solarPackage === product.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                )}
                onClick={() => onSolarSelect(product.id)}
                data-testid={`solar-package-${product.id}`}
              >
                {product.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{product.name}</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {product.specifications.panels}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Panels</span>
                      <span className="font-medium">{product.specifications.panels.split(' ')[0]} panels</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual generation</span>
                      <span className="font-medium">{product.specifications.generation}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${(parseFloat(product.price) - parseFloat(product.rebateAmount || '0')).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground line-through">
                    ${parseFloat(product.price).toLocaleString()}
                  </div>
                  <div className="text-sm text-accent font-medium">
                    After ${parseFloat(product.rebateAmount || '0').toLocaleString()} STC rebate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battery Selection */}
      {selectedSystems.includes('battery') && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Battery Storage Systems</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {batteryProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "pricing-card border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative",
                  batterySystem === product.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                )}
                onClick={() => onBatterySelect(product.id)}
                data-testid={`battery-system-${product.id}`}
              >
                {product.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      VALUE
                    </span>
                  </div>
                )}
                {product.category === 'premium' && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      PREMIUM
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{product.name}</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {product.capacity} capacity with {product.specifications.backup}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usable capacity</span>
                      <span className="font-medium">{product.specifications.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Warranty</span>
                      <span className="font-medium">{product.warranty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Backup protection</span>
                      <span className="font-medium text-accent">✓ Included</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  {product.rebateEligible && product.rebateAmount ? (
                    <>
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${(parseFloat(product.price) - parseFloat(product.rebateAmount)).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        ${parseFloat(product.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-accent font-medium">
                        After ${parseFloat(product.rebateAmount).toLocaleString()} WA rebate
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${parseFloat(product.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Installed price</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EV Charger Selection */}
      {selectedSystems.includes('ev') && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">EV Charging Solutions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {evChargerProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "pricing-card border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                  evCharger === product.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                )}
                onClick={() => onEvSelect(product.id)}
                data-testid={`ev-charger-${product.id}`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-foreground mb-2">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.capacity}, {product.specifications.cable}
                  </p>
                  <div className="text-lg font-bold text-primary">${parseFloat(product.price).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Installed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="bg-muted-foreground hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          onClick={onBack}
          data-testid="button-back"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        <button
          className="bg-primary hover:bg-blue-700 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
          onClick={onNext}
          data-testid="button-continue-to-details"
        >
          Continue to Property Details
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
