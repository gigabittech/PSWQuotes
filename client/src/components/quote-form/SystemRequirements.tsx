import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SystemRequirementsProps {
  data: {
    systems?: string[];
    powerSupply?: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

interface MinimumPrices {
  solar: number;
  battery: number;
  ev: number;
}

export default function SystemRequirements({ data, onUpdate, onNext }: SystemRequirementsProps) {
  const { data: minPrices, isLoading, isError } = useQuery<MinimumPrices>({
    queryKey: ["/api/minimum-prices"],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceDisplay = (systemType: "solar" | "battery" | "ev") => {
    if (isLoading) return "Loading...";
    if (isError || !minPrices) return "Contact us";
    return `From ${formatPrice(minPrices[systemType])}`;
  };

  const systemOptions = [
    {
      id: 'solar',
      title: 'Solar Power',
      description: 'Harness the sun\'s energy with premium solar panel systems',
      icon: '☀️',
      iconBg: 'bg-muted/50 dark:bg-muted/30',
      border: 'hover:border-primary',
      price: getPriceDisplay('solar'),
      afterText: 'after rebates',
      badge: 'MOST POPULAR',
      popular: true,
    },
    {
      id: 'battery',
      title: 'Battery Storage',
      description: 'Store energy for use when you need it most',
      icon: '🔋',
      iconBg: 'bg-muted/50 dark:bg-muted/30',
      border: 'hover:border-primary',
      price: getPriceDisplay('battery'),
      afterText: 'after rebates',
      badge: 'PREMIUM',
    },
    {
      id: 'ev',
      title: 'EV Charging',
      description: 'Fast, convenient home charging for your electric vehicle',
      icon: '⚡',
      iconBg: 'bg-muted/50 dark:bg-muted/30',
      border: 'hover:border-primary',
      price: getPriceDisplay('ev'),
      afterText: 'installed',
      badge: 'FAST CHARGING',
    },
  ];

  const powerOptions = [
    {
      id: 'single',
      title: 'Single Phase',
      description: 'Most common in residential properties',
    },
    {
      id: 'three',
      title: 'Three Phase',
      description: 'Larger homes and commercial properties',
    },
    {
      id: 'unknown',
      title: "I don't know",
      description: "We'll help identify during assessment",
    },
  ];

  const handleSystemToggle = (systemId: string) => {
    const currentSystems = data.systems || [];
    const newSystems = currentSystems.includes(systemId)
      ? currentSystems.filter(s => s !== systemId)
      : [...currentSystems, systemId];
    
    onUpdate({ systems: newSystems });
  };

  const handlePowerSupplyChange = (powerSupply: string) => {
    onUpdate({ powerSupply });
  };

  const canContinue = (data.systems?.length || 0) > 0 && data.powerSupply;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12" data-testid="system-requirements">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 text-center">
          What are you looking for?
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground text-center mb-8 md:mb-12 max-w-2xl mx-auto px-4">
          Select all the systems you're interested in. We'll create a custom quote based on your needs.
        </p>

        {/* System Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {systemOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "relative rounded-2xl transition-all duration-500",
                data.systems?.includes(option.id)
                  ? "p-[2px] bg-primary scale-[1.02] -translate-y-3 hover:shadow-2xl"
                  : ""
              )}
            >
              <div
                className={cn(
                  "group relative glass-card rounded-2xl p-6 cursor-pointer transition-all duration-500 min-h-[320px] sm:min-h-[360px] touch-manipulation w-full h-full",
                  "border-2 active:scale-[0.98]",
                  data.systems?.includes(option.id)
                    ? "border-transparent bg-primary/10 hover:bg-primary/15"
                    : `border-border ${option.border} hover:-translate-y-3 hover:shadow-xl hover:shadow-2xl`
                )}
                onClick={() => handleSystemToggle(option.id)}
                data-testid={`system-option-${option.id}`}
              >
              {/* Popular Badge */}
              {option.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                    {option.badge}
                  </span>
                </div>
              )}

              {/* Other Badges */}
              {!option.popular && option.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                    {option.badge}
                  </span>
                </div>
              )}

              <div className="text-center h-full flex flex-col justify-between">
                <div className="flex-1">
                  <div className={cn(
                    "w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300",
                    option.iconBg
                  )}>
                    <span className="text-3xl sm:text-4xl drop-shadow-lg">{option.icon}</span>
                  </div>
                  <h3 className={cn(
                    "text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300",
                    data.systems?.includes(option.id) 
                      ? "text-primary" 
                      : "text-foreground group-hover:text-primary"
                  )}>
                    {option.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed px-2">
                    {option.description}
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="text-lg sm:text-xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform duration-300">
                    {option.price}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {option.afterText}
                  </div>
                </div>
              </div>

              {/* Selection indicator */}
              {data.systems?.includes(option.id) && (
                <div className="absolute inset-0 border-2 border-primary rounded-2xl bg-primary/5 pointer-events-none">
                  <div className={cn(
                    "absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg z-10",
                    option.popular ? "top-4 right-4" : "top-4 left-4"
                  )}>
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              </div>
            </div>
          ))}
        </div>

        {/* Power Supply Section */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center glass-card rounded-full px-6 py-3 mb-4">
              <span className="text-2xl mr-3">⚡</span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Power Supply Type</h3>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
              Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {powerOptions.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "group relative glass-card border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 touch-manipulation min-h-[120px]",
                  "active:scale-[0.98]",
                  data.powerSupply === option.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 scale-[1.02] shadow-lg -translate-y-1 hover:shadow-xl hover:bg-primary/15 hover:ring-primary/40"
                    : "border-border hover:border-primary hover:-translate-y-1 hover:shadow-xl"
                )}
                onClick={() => handlePowerSupplyChange(option.id)}
                data-testid={`power-supply-${option.id}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      data.powerSupply === option.id
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-gray-600 group-hover:border-primary"
                    )}>
                      {data.powerSupply === option.id && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className={cn(
                      "font-bold cursor-pointer text-base sm:text-lg block mb-2 transition-colors duration-300",
                      data.powerSupply === option.id
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                    )}>
                      {option.title}
                    </label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {data.powerSupply === option.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center px-4">
          <button
            className={cn(
              "group relative bg-primary hover:bg-primary/90 text-black px-10 py-4 text-lg rounded-xl font-bold transition-all duration-300 min-h-[56px] touch-manipulation shadow-xl",
              "hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-xl",
              canContinue ? "w-full sm:w-auto" : "w-full sm:w-auto"
            )}
            onClick={onNext}
            disabled={!canContinue}
            data-testid="button-continue-to-products"
          >
            <span className="flex items-center justify-center">
              <span className="mr-3">Continue to Product Selection</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 rounded-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
