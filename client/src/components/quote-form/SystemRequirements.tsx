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
    <div className="p-8" data-testid="system-requirements">
      <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
        What are you looking for?
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Select all the systems you're interested in. We'll create a custom quote based on your needs.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {systemOptions.map((option) => (
          <div
            key={option.id}
            className={cn(
              "pricing-card border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
              data.systems?.includes(option.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary"
            )}
            onClick={() => handleSystemToggle(option.id)}
            data-testid={`system-option-${option.id}`}
          >
            <div className="text-center">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", option.bgColor)}>
                <span className="text-2xl">{option.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{option.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
              <div className="text-sm text-primary font-medium">{option.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Power Supply Type</h3>
        <p className="text-muted-foreground mb-4">
          Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {powerOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors duration-200",
                data.powerSupply === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary"
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
          className="bg-primary hover:bg-blue-700 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!canContinue}
          data-testid="button-continue-to-products"
        >
          Continue to Product Selection
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}
