import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SystemSelectionProps {
  selectedSystems: string[];
  powerSupply: string;
  onSystemToggle: (system: string) => void;
  onPowerSupplyChange: (supply: string) => void;
  onNext: () => void;
}

interface MinimumPrices {
  solar: number;
  battery: number;
  ev: number;
}

export default function SystemSelection({
  selectedSystems,
  powerSupply,
  onSystemToggle,
  onPowerSupplyChange,
  onNext,
}: SystemSelectionProps) {
  const { data: minPrices, isLoading } = useQuery<MinimumPrices>({
    queryKey: ['/api/minimum-prices'],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const systemOptions = [
    {
      id: "solar",
      title: "Solar Power",
      description: "Harness the sun's energy with premium solar panel systems",
      icon: "fas fa-sun",
      iconColor: "text-secondary",
      bgColor: "bg-secondary/10",
      price: isLoading || !minPrices ? "Loading..." : `From ${formatPrice(minPrices.solar)} after rebates`,
    },
    {
      id: "battery",
      title: "Battery Storage",
      description: "Store energy for use when you need it most",
      icon: "fas fa-battery-full",
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      price: isLoading || !minPrices ? "Loading..." : `From ${formatPrice(minPrices.battery)} after rebates`,
    },
    {
      id: "ev",
      title: "EV Charging",
      description: "Fast, convenient home charging for your electric vehicle",
      icon: "fas fa-charging-station",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      price: isLoading || !minPrices ? "Loading..." : `From ${formatPrice(minPrices.ev)} installed`,
    },
  ];

  const powerOptions = [
    {
      id: "single",
      title: "Single Phase",
      description: "Most common in residential properties",
    },
    {
      id: "three",
      title: "Three Phase",
      description: "Larger homes and commercial properties",
    },
    {
      id: "unknown",
      title: "I don't know",
      description: "We'll help identify during assessment",
    },
  ];

  return (
    <div className="space-y-10" data-testid="system-selection">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="font-outfit text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
          What are you looking for?
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Select all the systems you're interested in. We'll create a custom
          quote based on your needs.
        </p>
      </div>

      {/* System Options Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {systemOptions.map((option) => {
          const isSelected = selectedSystems.includes(option.id);
          return (
            <div
              key={option.id}
              className={cn(
                "relative group cursor-pointer transition-all duration-350 ease-out rounded-2xl p-8",
                "backdrop-blur-lg border shadow-lg",
                "hover:scale-105 hover:shadow-2xl",
                isSelected
                  ? "bg-white/90 border-primary/50 shadow-primary/20"
                  : "bg-white/60 border-white/40 hover:border-primary/30",
              )}
              onClick={() => onSystemToggle(option.id)}
              data-testid={`system-option-${option.id}`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
              )}

              <div className="text-center space-y-4">
                {/* Icon */}
                <div
                  className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto",
                    "transition-transform duration-350 group-hover:scale-110",
                    option.bgColor,
                  )}
                >
                  <i
                    className={cn(option.icon, option.iconColor, "text-3xl")}
                  ></i>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-outfit text-2xl font-semibold text-foreground">
                    {option.title}
                  </h3>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                  <div className="font-inter text-sm text-primary font-semibold pt-2">
                    {option.price}
                  </div>
                </div>
              </div>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Power Supply Section */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h3 className="font-outfit text-2xl md:text-3xl font-semibold text-foreground">
            Power Supply Type
          </h3>
          <p className="font-inter text-muted-foreground max-w-2xl mx-auto">
            Select your property's electrical supply configuration. Not sure? We
            can help identify this during our assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {powerOptions.map((option) => {
            const isSelected = powerSupply === option.id;
            return (
              <div
                key={option.id}
                className={cn(
                  "relative rounded-xl p-5 cursor-pointer transition-all duration-300",
                  "backdrop-blur-md border",
                  "hover:scale-102 hover:shadow-lg",
                  isSelected
                    ? "bg-white/80 border-primary/50 shadow-md"
                    : "bg-white/50 border-white/40 hover:border-primary/30",
                )}
                onClick={() => onPowerSupplyChange(option.id)}
                data-testid={`power-supply-${option.id}`}
              >
                <div className="flex items-start space-x-3">
                  {/* Custom Radio */}
                  <div
                    className={cn(
                      "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <label className="font-inter font-semibold text-foreground cursor-pointer block mb-1">
                      {option.title}
                    </label>
                    <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <button
          className={cn(
            "relative group px-10 py-4 rounded-xl font-inter font-semibold text-lg",
            "transition-all duration-350 shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            selectedSystems.length > 0 && powerSupply
              ? "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-2xl hover:scale-105"
              : "bg-muted/50 text-muted-foreground",
          )}
          onClick={onNext}
          disabled={selectedSystems.length === 0 || !powerSupply}
          data-testid="button-continue-to-products"
        >
          <span className="relative z-10 flex items-center gap-2">
            Continue to Product Selection
            <i className="fas fa-arrow-right transition-transform duration-300 group-hover:translate-x-1"></i>
          </span>

          {/* Button Glow Effect */}
          {selectedSystems.length > 0 && powerSupply && (
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
          )}
        </button>
      </div>
    </div>
  );
}
