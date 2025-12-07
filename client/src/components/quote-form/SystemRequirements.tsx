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
      className="mx-auto rounded-2xl sm:rounded-3xl md:rounded-[65px] my-4 sm:my-6 md:my-8 w-full max-w-[1024px]"
      style={{
        background: 'linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(234, 234, 234, 0.161) 50.87%, rgba(153, 153, 153, 0.0315) 106.32%)',
        border: '1px solid #DDE1E775',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'visible',
        position: 'relative',
        isolation: 'isolate'
      }}
      data-testid="system-requirements"
    >
      <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-6 md:p-8 lg:p-12 gap-4 sm:gap-6" style={{ 
        boxSizing: 'border-box',
        overflow: 'visible',
        background: 'transparent'
      }}>
        {/* Header Section */}
        <div className="text-center w-full">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{
            color: '#020817',
            marginTop: 0
          }}>
            What are you looking for?
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4" style={{
            color: '#787E86',
            margin: 0
          }}>
            Select all the systems you're interested in. We'll create a custom quote based on your needs.
          </p>
        </div>

        {/* System Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl relative z-10 px-2 sm:px-4">
          {systemOptions.map((option) => {
            const isSelected = data.systems?.includes(option.id);
            return (
              <div
                key={option.id}
                onClick={() => handleSystemToggle(option.id)}
                className="relative w-full min-h-[320px] sm:min-h-[360px] rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: isSelected ? 'radial-gradient(102.46% 102.46% at 50% -2.46%, #4E4E4E 0%, #0A0D14 52.79%)' : '#FFFFFF',
                  paddingTop: option.id === 'solar' ? '2.5rem' : '3rem',
                  paddingRight: '1.5rem',
                  paddingBottom: '1.5rem',
                  paddingLeft: '1.5rem',
                  border: '1px solid #E5E5E5',
                  boxSizing: 'border-box',
                  overflow: 'visible'
                }}
                data-testid={`system-option-${option.id}`}
              >
                {/* Badge - Fixed positioning */}
                {option.badge && (
                  <>
                    {/* Blurred layer behind badge when selected */}
                    {isSelected && (
                      <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 md:w-32 h-6 sm:h-7 rounded-full pointer-events-none z-[999]" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }} />
                    )}
                    <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 md:w-32 h-6 sm:h-7 rounded-full flex items-center justify-center z-[1000] px-2 sm:px-3 md:px-4" style={{
                      border: '1px solid #C2C2C233',
                      backgroundColor: isSelected ? '#F7C9179E' : '#F5F5F5',
                      color: '#020817',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                      boxShadow: isSelected ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                      backdropFilter: isSelected ? 'blur(10px)' : 'none',
                      WebkitBackdropFilter: isSelected ? 'blur(10px)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: 0,
                      paddingBottom: 0
                    }}>
                      <span className="text-[10px] sm:text-xs" style={{ lineHeight: '1', margin: 0, padding: 0, display: 'block', transform: 'translateY(+0.0px)' }}>{option.badge}</span>
                    </div>
                  </>
                )}

                {/* Checkbox */}
                <div className="absolute top-4 sm:top-5 md:top-6 left-4 sm:left-5 md:left-6 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center z-10" style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderRadius: '4px',
                  boxShadow: 'none'
                }}>
                  {!isSelected ? (
                    <img 
                      src="/attached_assets/_Checkbox base.png" 
                      alt="Checkbox" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <img 
                      src="/attached_assets/_Checkbox base_selected.png" 
                      alt="Checkbox Selected" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  )}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6" style={{
                  border: '1px solid #C2C2C233',
                  backgroundColor: isSelected ? '#19A4201A' : '#EBC9721A',
                  marginTop: option.popular ? '0.5rem' : '0'
                }}>
                  {option.id === 'solar' ? (
                    <img 
                      src="/attached_assets/Solar.png" 
                      alt="Solar Power" 
                      style={{
                        width: '36px',
                        height: '40px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  ) : option.id === 'battery' ? (
                    <img 
                      src="/attached_assets/Battery.png" 
                      alt="Battery Storage" 
                      style={{
                        width: '36px',
                        height: '40px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  ) : option.id === 'ev' ? (
                    <img 
                      src="/attached_assets/ev.png" 
                      alt="EV Charging" 
                      style={{
                        width: '36px',
                        height: '40px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <span style={{ 
                      fontSize: '48px', 
                      lineHeight: '1'
                    }}>
                      {option.icon}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="text-center flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3" style={{
                    color: isSelected ? '#FFFFFF' : '#020817',
                    marginTop: 0,
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base mb-2 leading-relaxed" style={{
                    color: isSelected ? '#D1D5DB' : '#787E86',
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.description}
                </p>
                </div>

                {/* Price */}
                <div className="rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center">
                  <div className="text-base sm:text-lg md:text-xl font-bold mb-1" style={{
                    color: isSelected ? '#FCD34D' : '#020817',
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.price}
                  </div>
                  <div className="text-xs sm:text-sm" style={{
                    color: isSelected ? '#9CA3AF' : '#787E86',
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.afterText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Power Supply Section */}
        <div className="w-full max-w-5xl px-2 sm:px-4">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center w-full sm:w-auto min-w-[200px] sm:min-w-[291px] max-w-[291px] h-12 sm:h-14 md:h-16 px-4 sm:px-6 mb-3 sm:mb-4 justify-center gap-3" style={{
              backgroundColor: '#8E8E8E1A',
              borderRadius: '40px',
              border: '1px solid #0208171A',
              boxSizing: 'border-box'
            }}>
              <img 
                src="/attached_assets/ev.png" 
                alt="EV Charging" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap" style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                letterSpacing: '-0.5px',
                color: '#020817',
                margin: 0
              }}>
                Power Supply Type
              </h3>
            </div>
            <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed" style={{
              color: '#787E86',
              margin: 0
            }}>
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
        <div className="w-full flex justify-center mt-6 px-2 sm:px-4">
          <button
            onClick={onNext}
            disabled={!canContinue}
            className={cn(
              "w-full sm:w-auto sm:min-w-[346px] max-w-[346px] h-[54px] rounded-full flex items-center justify-between px-4 sm:px-1.5 sm:pl-6 text-base sm:text-lg font-bold transition-all duration-300 box-border",
              canContinue ? "bg-[#E1AE20D4] text-white cursor-pointer shadow-lg opacity-100" : "bg-[#E5E5E5] text-gray-400 cursor-not-allowed opacity-50"
            )}
            data-testid="button-continue-to-products"
          >
            <span className="font-manrope font-semibold text-sm sm:text-lg leading-none tracking-normal whitespace-nowrap block">
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