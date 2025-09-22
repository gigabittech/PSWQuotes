import { cn } from "@/lib/utils";

interface SystemRequirementsProps {
  data: {
    systems?: string[];
    powerSupply?: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export default function SystemRequirements({ data, onUpdate, onNext }: SystemRequirementsProps) {
  const systemOptions = [
    {
      id: 'solar',
      title: 'Solar Power',
      description: 'Harness the sun\'s energy with premium solar panel systems',
      icon: '☀️',
      bgColor: 'bg-secondary/10',
      price: 'From $3,090 after rebates',
    },
    {
      id: 'battery',
      title: 'Battery Storage',
      description: 'Store energy for use when you need it most',
      icon: '🔋',
      bgColor: 'bg-accent/10',
      price: 'From $6,490 after rebates',
    },
    {
      id: 'ev',
      title: 'EV Charging',
      description: 'Fast, convenient home charging for your electric vehicle',
      icon: '⚡',
      bgColor: 'bg-primary/10',
      price: 'From $1,790 installed',
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
                "card-elevated border-2 p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl min-h-[280px] sm:min-h-[320px] touch-manipulation",
                data.systems?.includes(option.id)
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
                  : "border-gray-200 hover:border-primary hover:-translate-y-1 active:scale-[0.98]"
              )}
              onClick={() => handleSystemToggle(option.id)}
              data-testid={`system-option-${option.id}`}
            >
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg", option.bgColor)}>
                    <span className="text-2xl sm:text-3xl">{option.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{option.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">{option.description}</p>
                </div>
                <div className="text-sm sm:text-base text-primary font-semibold bg-primary/10 px-3 sm:px-4 py-2 rounded-full">{option.price}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Power Supply Section */}
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 md:mb-6 text-center">Power Supply Type</h3>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 text-center max-w-2xl mx-auto px-4">
            Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
            {powerOptions.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg touch-manipulation min-h-[100px]",
                  data.powerSupply === option.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-primary hover:-translate-y-1 active:scale-[0.98]"
                )}
                onClick={() => handlePowerSupplyChange(option.id)}
                data-testid={`power-supply-${option.id}`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="power-supply"
                    checked={data.powerSupply === option.id}
                    onChange={() => handlePowerSupplyChange(option.id)}
                    className="text-primary mt-1 w-4 h-4 sm:w-5 sm:h-5"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-foreground cursor-pointer text-sm sm:text-base block">{option.title}</label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center px-4">
          <button
            className="btn-primary w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg transition-all duration-200 min-h-[48px] touch-manipulation"
            onClick={onNext}
            disabled={!canContinue}
            data-testid="button-continue-to-products"
          >
            <span className="flex items-center justify-center">
              Continue to Product Selection
              <svg className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
