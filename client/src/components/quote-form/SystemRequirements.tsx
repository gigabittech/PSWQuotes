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
      style={{
        width: '1024px',
        height: '1083px',
        maxWidth: '1024px',
        borderRadius: '65px',
        background: 'linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(234, 234, 234, 0.161) 50.87%, rgba(153, 153, 153, 0.0315) 106.32%)',
        border: '1px solid #DDE1E775',
        margin: '0 auto',
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
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '48px 49px', 
        gap: '24px', 
        boxSizing: 'border-box',
        overflow: 'visible',
        background: 'transparent'
      }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#020817',
          marginBottom: '16px',
          marginTop: 0
        }}>
          What are you looking for?
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#787E86',
          margin: 0,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Select all the systems you're interested in. We'll create a custom quote based on your needs.
        </p>
      </div>

      {/* System Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '900px',
        position: 'relative',
        zIndex: 10
      }}>
        {systemOptions.map((option) => {
          const isSelected = data.systems?.includes(option.id);
          return (
            <div
              key={option.id}
              onClick={() => handleSystemToggle(option.id)}
              style={{
                position: 'relative',
                width: '293px',
                height: '366px',
                minHeight: '360px',
                backgroundColor: isSelected ? '#020817' : '#FFFFFF',
                borderRadius: '16px',
                paddingTop: option.id === 'solar' ? '40px' : '50px',
                paddingRight: '24px',
                paddingBottom: '24px',
                paddingLeft: '24px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #FCD34D' : '1px solid #E5E5E5',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                overflow: 'visible'
              }}
              data-testid={`system-option-${option.id}`}
            >
              {/* Badge - Fixed positioning */}
              {option.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-14.5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '132px',
                  height: '29px',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid #C2C2C233' : 'none',
                  backgroundColor: isSelected ? '#F7C9179E' : '#F5F5F5',
                  color: '#020817',
                  padding: '10px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  verticalAlign: 'middle',
                  zIndex: 1000,
                  boxShadow: isSelected ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  {option.badge}
                </div>
              )}

              {/* Checkbox */}
              <div style={{
                position: 'absolute',
                top: isSelected ? '26px' : '32px',
                left: isSelected ? '22px' : '26px',
                width: isSelected ? '24px' : '18px',
                height: isSelected ? '24px' : '18px',
                border: 'none',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
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
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '24px',
                border: '1px solid #C2C2C233',
                backgroundColor: isSelected ? '#19A4201A' : '#EBC9721A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                marginTop: option.popular ? '8px' : '0px'
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
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: isSelected ? '#FFFFFF' : '#020817',
                  marginBottom: '12px',
                  marginTop: 0,
                  fontFamily: 'Manrope, sans-serif'
                }}>
                  {option.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: isSelected ? '#D1D5DB' : '#787E86',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                  fontFamily: 'Manrope, sans-serif'
                }}>
                  {option.description}
                </p>
              </div>

              {/* Price */}
              <div style={{
                borderRadius: '12px',
                padding: '8px 16px 16px 16px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isSelected ? '#FCD34D' : '#020817',
                  marginBottom: '4px',
                  fontFamily: 'Manrope, sans-serif'
                }}>
                  {option.price}
                </div>
                <div style={{
                  fontSize: '12px',
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
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '9999px',
            padding: '12px 24px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>⚡</span>
            <h3 style={{
              width: '205px',
              height: '17px',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: '32px',
              letterSpacing: '-0.6px',
              textAlign: 'center',
              verticalAlign: 'middle',
              color: '#020817',
              margin: 0,
              display: 'block'
            }}>
              Power Supply Type
            </h3>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#787E86',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Select your property's electrical supply configuration. Not sure? We can help identify this during our assessment.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {powerOptions.map((option) => {
            const isSelected = data.powerSupply === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handlePowerSupplyChange(option.id)}
                style={{
                  position: 'relative',
                  width: '298px',
                  height: '120px',
                  minHeight: '120px',
                  opacity: isSelected ? 0.8 : 1,
                  background: isSelected ? 'radial-gradient(100% 100% at 93.96% 0%, #4E4E4E 0%, #0A0D14 52.79%)' : '#FFFFFFBF',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #0208171A' : '1px solid #D5D5D573',
                  boxShadow: isSelected ? '0px 0px 0px 0px #010EC7' : 'none',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxSizing: 'border-box'
                }}
                data-testid={`power-supply-${option.id}`}
              >
                {/* Checkbox */}
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  left: '16px',
                  width: isSelected ? '24px' : '18px',
                  height: isSelected ? '24px' : '18px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
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

                {/* Content */}
                <div style={{ 
                  flex: 1,
                  marginLeft: '28px'
                }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: isSelected ? '#FFFFFF' : '#020817',
                    display: 'block',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.title}
                  </label>
                  <p style={{
                    fontSize: '14px',
                    color: isSelected ? '#D1D5DB' : '#787E86',
                    margin: 0,
                    lineHeight: '1.5',
                    fontFamily: 'Manrope, sans-serif'
                  }}>
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            background: canContinue 
              ? 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)'
              : '#E5E5E5',
            color: canContinue ? '#020817' : '#9CA3AF',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            opacity: canContinue ? 1 : 0.5,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '280px',
            justifyContent: 'center'
          }}
          data-testid="button-continue-to-products"
        >
          <span>Continue to Product Selection</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      </div>
    </div>
  );
}