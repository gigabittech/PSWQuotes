import { cn } from "@/lib/utils";

interface BatteryProductCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}

export default function BatteryProductCard({ product, isSelected, onSelect, badge }: BatteryProductCardProps) {
  const priceAfterRebate = parseFloat(product.price);
  
  // Get RRP from specifications if available
  const rrp = product.specifications?.rrp ? parseFloat(product.specifications.rrp) : null;
  const savings = rrp ? rrp - priceAfterRebate : 0;
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Extract capacity from product
  const capacity = product.capacity || product.specifications?.capacity || '';
  const warranty = product.warranty || product.specifications?.warranty || '';
  const annualGeneration = product.specifications?.generation || product.specifications?.annual || '';
  const panels = product.specifications?.panels || '';

  return (
    <div
      className={cn(
        "group relative cursor-pointer flex flex-col"
      )}
      style={{
        width: '293px',
        height: '466px',
        minHeight: '360px',
        borderRadius: '16px',
        border: isSelected ? 'none' : '1px solid #DDE1E775',
        paddingTop: '40px',
        paddingRight: '24px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        display: 'flex',
        flexDirection: 'column',
        background: isSelected 
          ? 'radial-gradient(102.46% 102.46% at 50% -2.46%, #4E4E4E 0%, #0A0D14 52.79%)'
          : '#FFFFFFBF',
        opacity: 1,
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: 'none',
        transition: 'background 0.2s ease, border 0.2s ease'
      }}
      onClick={onSelect}
      data-testid={`battery-product-card-${product.id}`}
    >
      {/* Badge at top center */}
      {badge && (
        <div style={{
            position: 'absolute',
            top: '-14.5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '73px',
            height: '29px',
            borderRadius: '9999px',
            border: isSelected ? '1px solid #C2C2C233' : 'none',
            backgroundColor: isSelected ? '#F7C9179E' : '#F5F5F5',
            padding: '10px 16px',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            zIndex: 1000,
            boxShadow: isSelected ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
            backdropFilter: isSelected ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: isSelected ? 'blur(10px)' : 'none'
          }}>
            <span style={{
              width: '41px',
              height: '9px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              verticalAlign: 'middle',
              color: '#0A0D14',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {badge}
            </span>
          </div>
      )}

      {/* Checkbox in top-right */}
      <div style={{
        position: 'absolute',
        top: '36px',
        right: '24px',
        width: isSelected ? '24px' : '18px',
        height: isSelected ? '24px' : '18px',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

      {/* Battery Icon in top-left */}
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '24px',
        width: '40px',
        height: '40px',
        borderRadius: '40px',
        border: '1px solid #C2C2C233',
        background: '#19A4201A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        opacity: 1
      }}>
        <img 
          src="/attached_assets/Battery.png" 
          alt="Battery" 
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        paddingTop: '0px',
        paddingRight: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '24px'
      }}>
        {/* System Name */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%'
        }}>
          <h3 style={{
            width: '247px',
            minHeight: '28px',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
            fontSize: '22px',
            lineHeight: '28px',
            letterSpacing: '-0.6px',
            color: isSelected ? '#E6E6E6' : '#020817',
            marginBottom: '8px',
            marginTop: 0,
            marginLeft: 0,
            paddingLeft: 0,
            opacity: 1,
            display: 'flex',
            alignItems: 'flex-start',
            verticalAlign: 'middle',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {product.name}
          </h3>
          
          {/* Capacity Label */}
          <p style={{
            width: '169px',
            height: '24px',
            fontSize: '14px',
            lineHeight: '24px',
            letterSpacing: '0%',
            color: '#FEB60F',
            marginBottom: '16px',
            marginTop: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            display: 'flex',
            alignItems: 'center',
            verticalAlign: 'middle',
            opacity: 1
          }}>
            {capacity} capacity system
          </p>

          {/* Panel Details */}
          {panels && (
            <p style={{
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0%',
              color: isSelected ? '#D1D5DB' : '#787E86',
              marginBottom: '8px',
              marginTop: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              display: 'flex',
              alignItems: 'center',
              verticalAlign: 'middle'
            }}>
              Panels: {panels}
            </p>
          )}

          {/* Specifications Table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '0px'
          }}>
            {/* Left Column */}
            <div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                color: isSelected ? '#9CA3AF' : '#787E86',
                marginBottom: '4px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                Capacity:
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                fontWeight: 400,
                fontStyle: 'normal',
                color: isSelected ? '#FFFFFF' : '#020817',
                marginBottom: '12px',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle',
                opacity: 1,
                minHeight: '24px'
              }}>
                {capacity}
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                color: isSelected ? '#9CA3AF' : '#787E86',
                marginBottom: '4px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                Annual:
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                fontStyle: 'normal',
                color: isSelected ? '#FFFFFF' : '#020817',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                {annualGeneration && annualGeneration.startsWith('~') ? (
                  <>
                    <span style={{ fontWeight: 400 }}>~</span>
                    <span style={{ fontWeight: 500 }}>{annualGeneration.substring(1).replace(/\s+annually/gi, '')}</span>
                  </>
                ) : (
                  <span style={{ fontWeight: 400 }}>{annualGeneration?.replace(/\s+annually/gi, '') || '~9900 kWh'}</span>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                color: isSelected ? '#9CA3AF' : '#787E86',
                marginBottom: '4px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                Warranty:
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                fontWeight: 400,
                fontStyle: 'normal',
                color: isSelected ? '#FFFFFF' : '#020817',
                marginBottom: '12px',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                {warranty}
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                color: isSelected ? '#9CA3AF' : '#787E86',
                marginBottom: '4px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                Generation:
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                fontWeight: 400,
                fontStyle: 'normal',
                color: isSelected ? '#FFFFFF' : '#020817',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 'middle'
              }}>
                Annually
              </div>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div style={{
          width: '243px',
          height: '78px',
          borderRadius: '8px',
          paddingTop: '14px',
          paddingRight: '16px',
          paddingBottom: '14px',
          paddingLeft: '16px',
          background: '#BDBDBD14',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          opacity: 1,
          alignSelf: 'center',
          marginBottom: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: isSelected ? '#F7C917' : '#1A202C',
              fontFamily: 'Manrope, sans-serif',
              lineHeight: '1',
              whiteSpace: 'nowrap'
            }}>
              {formatPrice(priceAfterRebate)}
            </div>
            {rrp && savings > 0 && (
              <>
                <div style={{
                  width: '1px',
                  height: '19px',
                  border: '1px solid #E6E6E6',
                  opacity: 1
                }}></div>
                <div style={{
                  fontSize: '14px',
                  color: isSelected ? '#F7C917' : '#787E86',
                  textDecoration: 'line-through',
                  fontFamily: 'Inter, sans-serif',
                  opacity: isSelected ? 1 : 0.8
                }}>
                  Was {formatPrice(rrp)}
                </div>
              </>
            )}
          </div>
          {rrp && savings > 0 && (
            <div style={{
              width: '208.66px',
              height: '24px',
              borderRadius: '28px',
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingLeft: 0,
              paddingRight: 0,
              background: isSelected ? '#96FF9933' : '#D1ECD2',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              verticalAlign: 'middle',
              boxSizing: 'border-box'
            }}>
              <span style={{
                width: '208.66px',
                height: '20px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0%',
                textAlign: 'center',
                verticalAlign: 'middle',
                color: isSelected ? '#24DF3C' : '#1D852A',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Save {formatPrice(savings)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

