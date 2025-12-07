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
    // Toggle: if already selected, deselect it
    if (data.powerSupply === powerSupply) {
      onUpdate({ powerSupply: undefined });
    } else {
      onUpdate({ powerSupply });
    }
  };

  const canContinue = (data.systems?.length || 0) > 0 && data.powerSupply;

  return (
    <div
      className="w-full max-w-5xl mx-auto rounded-[32px] sm:rounded-[65px] border border-[#DDE1E775] flex flex-col items-center box-border overflow-visible relative isolate bg-gradient-to-br from-white/35 via-[#EAEAEA29] to-[#99999908]"
      data-testid="system-requirements"
    >
      <div className="relative z-[1] w-full h-full flex flex-col items-center p-6 sm:p-12 gap-6 box-border overflow-visible bg-transparent">
        {/* Header Section */}
        <div className="text-center w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#020817] mb-4 mt-0">
            What are you looking for?
          </h2>
          <p className="text-sm sm:text-base text-[#787E86] m-0 max-w-xl mx-auto">
            Select all the systems you're interested in. We'll create a custom quote based on your needs.
          </p>
        </div>

        {/* System Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl relative z-10">
          {systemOptions.map((option) => {
            const isSelected = data.systems?.includes(option.id);
            return (
              <div
                key={option.id}
                onClick={() => handleSystemToggle(option.id)}
                className={cn(
                  "relative w-full min-h-[360px] rounded-2xl p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between box-border overflow-visible",
                  isSelected ? "bg-[radial-gradient(102.46%_102.46%_at_50%_-2.46%,#4E4E4E_0%,#0A0D14_52.79%)] border-[#E5E5E5]" : "bg-white border-[#E5E5E5] hover:border-primary"
                )}
                style={{ paddingTop: option.id === 'solar' ? '40px' : '50px' }}
                data-testid={`system-option-${option.id}`}
              >
                {/* Badge - Fixed positioning */}
                {option.badge && (
                  <>
                    {/* Blurred layer behind badge when selected */}
                    {isSelected && (
                      <div className="absolute -top-[14.5px] left-1/2 -translate-x-1/2 w-[132px] h-[29px] rounded-full bg-white/10 backdrop-blur-md z-[999] pointer-events-none" />
                    )}
                    <div
                      className={cn(
                        "absolute -top-[14.5px] left-1/2 -translate-x-1/2 w-[132px] h-[29px] rounded-full flex items-center justify-center px-4 py-2.5 font-inter text-xs font-bold uppercase tracking-wider whitespace-nowrap z-[1000]",
                        isSelected ? "border border-[#C2C2C233] bg-[#F7C9179E] text-[#020817] shadow-sm backdrop-blur-md" : "bg-[#F5F5F5] text-[#020817]"
                      )}
                    >
                      {option.badge}
                    </div>
                  </>
                )}

                {/* Checkbox */}
                <div className={cn(
                  "absolute flex items-center justify-center z-10",
                  isSelected ? "top-[26px] left-[22px] w-6 h-6" : "top-8 left-[26px] w-[18px] h-[18px]"
                )}>
                  {!isSelected ? (
                    <img
                      src="/attached_assets/_Checkbox base.png"
                      alt="Checkbox"
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <img
                      src="/attached_assets/_Checkbox base_selected.png"
                      alt="Checkbox Selected"
                      className="w-full h-full object-cover block"
                    />
                  )}
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-24 h-24 rounded-3xl border border-[#C2C2C233] flex items-center justify-center mx-auto mb-6",
                  isSelected ? "bg-[#19A4201A]" : "bg-[#EBC9721A]",
                  option.popular ? "mt-2" : "mt-0"
                )}>
                  {option.id === 'solar' ? (
                    <img
                      src="/attached_assets/Solar.png"
                      alt="Solar Power"
                      className="w-9 h-10 object-contain block"
                    />
                  ) : option.id === 'battery' ? (
                    <img
                      src="/attached_assets/Battery.png"
                      alt="Battery Storage"
                      className="w-9 h-10 object-contain block"
                    />
                  ) : option.id === 'ev' ? (
                    <img
                      src="/attached_assets/ev.png"
                      alt="EV Charging"
                      className="w-9 h-10 object-contain block"
                    />
                  ) : (
                    <span className="text-5xl leading-none">
                      {option.icon}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="text-center flex-1">
                  <h3 className={cn(
                    "text-xl font-bold mb-3 mt-0 font-manrope",
                    isSelected ? "text-white" : "text-[#020817]"
                  )}>
                    {option.title}
                  </h3>
                  <p className={cn(
                    "text-sm mb-2 leading-relaxed font-manrope",
                    isSelected ? "text-gray-300" : "text-[#787E86]"
                  )}>
                    {option.description}
                  </p>
                </div>

                {/* Price */}
                <div className="rounded-xl px-4 pt-2 pb-4 text-center">
                  <div className={cn(
                    "text-lg font-bold mb-1 font-manrope",
                    isSelected ? "text-[#FCD34D]" : "text-[#020817]"
                  )}>
                    {option.price}
                  </div>
                  <div className={cn(
                    "text-xs font-manrope",
                    isSelected ? "text-gray-400" : "text-[#787E86]"
                  )}>
                    {option.afterText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Power Supply Section */}
        <div className="w-full max-w-4xl mt-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-auto min-w-[200px] h-[58px] bg-[#8E8E8E1A] rounded-full border border-[#0208171A] px-6 py-3 mb-4 gap-3 box-border">
              <img
                src="/attached_assets/ev.png"
                alt="EV Charging"
                className="w-6 h-6 object-contain"
              />
              <h3 className="font-manrope font-semibold text-xl sm:text-2xl leading-tight text-[#020817] m-0">
                Power Supply Type
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#787E86] m-0 max-w-xl mx-auto leading-relaxed">
              Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {powerOptions.map((option) => {
              const isSelected = data.powerSupply === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => handlePowerSupplyChange(option.id)}
                  className={cn(
                    "relative w-full min-h-[120px] rounded-2xl p-6 cursor-pointer border transition-all duration-300 flex items-start gap-3 box-border",
                    isSelected ? "opacity-80 bg-[radial-gradient(100%_100%_at_93.96%_0%,#4E4E4E_0%,#0A0D14_52.79%)] border-[#0208171A] shadow-[0px_0px_0px_0px_#010EC7]" : "bg-white/75 border-[#D5D5D573]"
                  )}
                  data-testid={`power-supply-${option.id}`}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    "absolute flex items-center justify-center z-10",
                    isSelected ? "top-7 left-4 w-6 h-6" : "top-7 left-4 w-[18px] h-[18px]"
                  )}>
                    {!isSelected ? (
                      <img
                        src="/attached_assets/_Checkbox base.png"
                        alt="Checkbox"
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      <img
                        src="/attached_assets/_Checkbox base_selected.png"
                        alt="Checkbox Selected"
                        className="w-full h-full object-cover block"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-7">
                    <label className={cn(
                      "text-base font-bold block mb-1 cursor-pointer font-manrope",
                      isSelected ? "text-white" : "text-[#020817]"
                    )}>
                      {option.title}
                    </label>
                    <p className={cn(
                      "text-sm m-0 leading-relaxed font-manrope",
                      isSelected ? "text-gray-300" : "text-[#787E86]"
                    )}>
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={onNext}
            disabled={!canContinue}
            className={cn(
              "w-full max-w-[346px] h-[54px] rounded-full flex items-center justify-between px-1.5 pl-6 text-lg font-bold transition-all duration-300 box-border",
              canContinue ? "bg-[#E1AE20D4] text-white cursor-pointer shadow-lg opacity-100" : "bg-[#E5E5E5] text-gray-400 cursor-not-allowed opacity-50"
            )}
            data-testid="button-continue-to-products"
          >
            <span className="font-manrope font-semibold text-lg leading-none tracking-normal whitespace-nowrap block">
              Continue to Product Selection
            </span>
            <div className="w-[54px] h-[54px] rounded-full p-2.5 bg-transparent flex items-center justify-center flex-shrink-0 ml-2.5">
              <img
                src="/attached_assets/arrow_forward.png"
                alt="Arrow"
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}