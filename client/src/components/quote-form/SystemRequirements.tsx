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
    <div className="p-8 md:p-12" data-testid="system-requirements">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
        What are you looking for?
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Select all the systems you're interested in. We'll create a custom quote based on your needs.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {systemOptions.map((option) => (
          <div
            key={option.id}
            className={cn(
              "card-elevated border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl",
              data.systems?.includes(option.id)
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-gray-200 hover:border-primary hover:-translate-y-1"
            )}
            onClick={() => handleSystemToggle(option.id)}
            data-testid={`system-option-${option.id}`}
          >
            <div className="text-center">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg", option.bgColor)}>
                <span className="text-3xl">{option.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{option.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">{option.description}</p>
              <div className="text-base text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">{option.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Power Supply Type</h3>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
          Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {powerOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
                data.powerSupply === option.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-primary hover:-translate-y-1"
              )}
              onClick={() => handlePowerSupplyChange(option.id)}
              data-testid={`power-supply-${option.id}`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="power-supply"
                  checked={data.powerSupply === option.id}
                  onChange={() => handlePowerSupplyChange(option.id)}
                  className="text-primary"
                />
                <div>
                  <label className="font-medium text-foreground cursor-pointer">{option.title}</label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="btn-primary px-10 py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
          onClick={onNext}
          disabled={!canContinue}
          data-testid="button-continue-to-products"
        >
          Continue to Product Selection
          <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
