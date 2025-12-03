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
        overflow: 'hidden',
        position: 'relative',
        isolation: 'isolate'
      }}
      data-testid="system-requirements"
    >
      {/* No inner container with background - just content directly */}
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
        // Remove any background color from this inner container
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
        maxWidth: '900px'
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
                boxSizing: 'border-box'
              }}
              data-testid={`system-option-${option.id}`}
            >
              {/* Badge */}
              {option.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-14.5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '132px',
                  height: '29px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#F5F5F5',
                  color: '#020817',
                  paddingTop: '10px',
                  paddingRight: '16px',
                  paddingBottom: '10px',
                  paddingLeft: '16px',
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
                  zIndex: 100
                }}>
                  {option.badge}
                </div>
              )}

              {/* Checkbox */}
              <div style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                width: '12px',
                height: '12px',
                border: isSelected ? '2px solid #FCD34D' : '2px solid #D1D5DB',
                backgroundColor: isSelected ? '#020817' : 'transparent',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isSelected && (
                  <svg width="8" height="8" viewBox="0 0 20 20" fill="none">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="#FCD34D"/>
                  </svg>
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
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#020817',
              margin: 0
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
                  backgroundColor: isSelected ? '#020817' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #FCD34D' : '1px solid #E5E5E5',
                  transition: 'all 0.3s ease',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
                data-testid={`power-supply-${option.id}`}
              >
                {/* Radio Button */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #FCD34D' : '2px solid #D1D5DB',
                  backgroundColor: isSelected ? '#020817' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {isSelected && (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#FCD34D'
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: isSelected ? '#FFFFFF' : '#020817',
                    display: 'block',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}>
                    {option.title}
                  </label>
                  <p style={{
                    fontSize: '14px',
                    color: isSelected ? '#D1D5DB' : '#787E86',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {option.description}
                  </p>
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#FCD34D',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="#020817"/>
                    </svg>
                  </div>
                )}
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