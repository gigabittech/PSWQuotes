import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import SolarProductCard from "./SolarProductCard";
import BatteryProductCard from "./BatteryProductCard";
import EVProductCard from "./EVProductCard";
import type { Product } from "@/types/quote";

interface ProductSelectionProps {
  data: {
    systems?: string[];
    powerSupply?: string;
    solarPackage?: string;
    hybridInverter?: string;
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
  const inverterProducts = products.filter(p => p.type === 'hybrid_inverter');
  const batteryProducts = products.filter(p => p.type === 'battery');
  const evProducts = products.filter(p => p.type === 'ev_charger');

  const handleProductSelect = (type: string, productId: string) => {
    onUpdate({ [type]: productId });
  };

  return (
    <div 
      className="rounded-2xl sm:rounded-3xl md:rounded-[65px] overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12 mx-auto"
      data-testid="product-selection"
      style={{ 
        boxSizing: 'border-box',
        margin: '0 auto',
        width: '1024px',
        maxWidth: '100%',
        background: 'linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(234, 234, 234, 0.161) 50.87%, rgba(153, 153, 153, 0.0315) 106.32%)',
        border: '1px solid #DDE1E775'
      }}
    >
      <div className="w-full mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4" style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.5px',
          color: '#020817'
        }}>
          Choose Your Solar System
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-center max-w-3xl mx-auto mb-6 sm:mb-8 px-4" style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          color: '#787E86'
        }}>
          Based on your selections, here are our recommended packages with real-time pricing.
        </p>

        {/* Solar Package Selection */}
        {data.systems?.includes('solar') && (
          <div className="mb-6 sm:mb-8">
            {/* Navigation/Filter Element */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center w-full sm:w-auto min-w-[200px] sm:min-w-[250px] md:min-w-[291px] max-w-[291px] h-12 sm:h-14 md:h-16 px-4 sm:px-6 justify-center gap-3" style={{
                backgroundColor: '#8E8E8E1A',
                borderRadius: '40px',
                border: '1px solid #0208171A',
                boxSizing: 'border-box'
              }}>
                <img 
                  src="/attached_assets/solar-panel-sun (1) 1.png" 
                  alt="Solar Power Systems" 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
                <span className="text-sm sm:text-base md:text-lg font-semibold" style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  color: '#020817',
                  margin: 0
                }}>
                  Solar Power Systems
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 sm:mb-6 justify-items-center">
              {solarProducts.map((product) => (
                <SolarProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.solarPackage === product.id}
                  onSelect={() => handleProductSelect('solarPackage', product.id)}
                  badge={product.popular ? "MOST POPULAR" : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hybrid Inverter Selection */}
        {data.systems?.includes('inverter') && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">Hybrid Inverters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 justify-items-center">
              {inverterProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.hybridInverter === product.id}
                  onSelect={() => handleProductSelect('hybridInverter', product.id)}
                  badge={product.popular ? "SMART CONTROL" : undefined}
                  badgeColor="bg-primary text-primary-foreground"
                  productType="hybrid_inverter"
                />
              ))}
            </div>
          </div>
        )}

        {/* Battery Selection */}
        {data.systems?.includes('battery') && (
          <div className="mb-6 sm:mb-8">
            {/* Navigation/Filter Element */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center w-full sm:w-auto min-w-[200px] sm:min-w-[250px] md:min-w-[291px] max-w-[291px] h-12 sm:h-14 md:h-16 px-4 sm:px-6 justify-center gap-3" style={{
                backgroundColor: '#8E8E8E1A',
                borderRadius: '40px',
                border: '1px solid #0208171A',
                boxSizing: 'border-box'
              }}>
                <img 
                  src="/attached_assets/car-battery (1) 1.png" 
                  alt="Battery Storage Systems" 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
                <span className="text-sm sm:text-base md:text-lg font-semibold" style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  color: '#020817',
                  margin: 0
                }}>
                  Battery Storage Systems
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 sm:mb-6 justify-items-center">
              {batteryProducts.map((product) => (
                <BatteryProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.batterySystem === product.id}
                  onSelect={() => handleProductSelect('batterySystem', product.id)}
                  badge={product.popular ? "VALUE" : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* EV Charger Selection */}
        {data.systems?.includes('ev') && (
          <div className="mb-6 sm:mb-8">
            {/* Navigation/Filter Element */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center w-full sm:w-auto min-w-[200px] sm:min-w-[250px] md:min-w-[291px] max-w-[291px] h-12 sm:h-14 md:h-16 px-4 sm:px-6 justify-center gap-3" style={{
                backgroundColor: '#8E8E8E1A',
                borderRadius: '40px',
                border: '1px solid #0208171A',
                boxSizing: 'border-box'
              }}>
                <img 
                  src="/attached_assets/charging-station 1.png" 
                  alt="EV Charging Solutions" 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
                <span className="text-sm sm:text-base md:text-lg font-semibold" style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  color: '#020817',
                  margin: 0
                }}>
                  EV Charging Solutions
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 sm:mb-6 justify-items-center">
              {evProducts.map((product) => (
                <EVProductCard
                  key={product.id}
                  product={product}
                  isSelected={data.evCharger === product.id}
                  onSelect={() => handleProductSelect('evCharger', product.id)}
                  badge={product.popular ? "FAST CHARGING" : undefined}
                />
              ))}
            </div>
          </div>
        )}

      {/* Real-time Pricing Display */}
      {pricingData && (
        <div className="glass-card rounded-xl p-6 mb-8 border-2 border-border shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg">💰</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Current Quote Summary</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 justify-items-center">
            <div className="text-center bg-white/50 dark:bg-gray-900/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground mb-1">${pricingData.totalPrice?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total System Price</div>
            </div>
            <div className="text-center bg-white/50 dark:bg-gray-900/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">-${pricingData.rebateAmount?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Rebates & Incentives</div>
            </div>
            <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">${pricingData.finalPrice?.toLocaleString()}</div>
              <div className="text-sm font-medium text-primary/80">Your Investment</div>
            </div>
          </div>
        </div>
      )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 mt-8">
          <button
            style={{
              width: '107px',
              height: '45px',
              borderRadius: '100px',
              paddingLeft: '6px',
              paddingRight: '6px',
              background: '#0B0E15',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={onPrev}
            data-testid="button-back"
          >
            <img 
              src="/attached_assets/BackArrow.png" 
              alt="Back" 
              style={{
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
            <span style={{
              width: '41px',
              height: '25px',
              color: '#E9BE18',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '18px',
              lineHeight: '100%',
              letterSpacing: '0%',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Back
            </span>
          </button>
          <button
            style={{
              width: '327px',
              height: '45px',
              borderRadius: '100px',
              paddingLeft: '18px',
              paddingRight: '18px',
              background: '#F7C917',
              opacity: isCalculating ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              border: 'none',
              cursor: isCalculating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={onNext}
            disabled={isCalculating}
            data-testid="button-continue-to-details"
          >
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              color: '#000000',
              whiteSpace: 'nowrap'
            }}>
              {isCalculating ? "Calculating..." : "Continue to Property Details"}
            </span>
            {!isCalculating && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '100px',
                backgroundColor: '#F7C917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/attached_assets/front arrow.png" 
                  alt="Arrow" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
            {isCalculating && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #000000',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
