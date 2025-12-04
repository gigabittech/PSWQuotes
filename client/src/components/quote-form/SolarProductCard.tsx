import { cn } from "@/lib/utils";

interface SolarProductCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}

export default function SolarProductCard({ product, isSelected, onSelect, badge }: SolarProductCardProps) {
  const priceAfterRebate = parseFloat(product.price);
  
  // Format price as "From $X,XXX"
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
  const annualGeneration = product.specifications?.generation || product.specifications?.annual || '';
  const warranty = product.warranty || product.specifications?.warranty || '';
  const panels = product.specifications?.panels || '';

  return (
    <div
      className={cn(
        "group relative rounded-2xl cursor-pointer transition-all duration-300",
        "min-h-[500px] flex flex-col"
      )}
      style={isSelected ? {
        background: 'radial-gradient(102.46% 102.46% at 50% -2.46%, #4E4E4E 0%, #0A0D14 52.79%)',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      } : {
        background: '#FFFFFFBF',
        border: '1px solid #DDE1E775'
      }}
      onClick={onSelect}
      data-testid={`solar-product-card-${product.id}`}
    >
      {/* Badge at top center */}
      {badge && (
        <>
          {/* Blurred layer behind badge when selected */}
          {isSelected && (
            <div style={{
              position: 'absolute',
              top: '-14.5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '132px',
              height: '29px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 999,
              pointerEvents: 'none'
            }} />
          )}
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
            zIndex: 1000,
            boxShadow: isSelected ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
            backdropFilter: isSelected ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: isSelected ? 'blur(10px)' : 'none'
          }}>
            {badge}
          </div>
        </>
      )}

      {/* Checkbox in top-right */}
      <div style={{
        position: 'absolute',
        top: isSelected ? '26px' : '32px',
        right: isSelected ? '22px' : '26px',
        width: isSelected ? '24px' : '18px',
        height: isSelected ? '24px' : '18px',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '4px',
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

      {/* Sun Icon in top-left */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '40px',
        height: '40px',
        borderRadius: '40px',
        border: '1px solid #C2C2C233',
        background: '#EBC9721A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        opacity: 1
      }}>
        <img 
          src="/attached_assets/Solar.png" 
          alt="Solar" 
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
        padding: '80px 24px 24px 24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* System Name */}
        <div>
          <h3 style={{
            width: '229px',
            height: '56px',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
            fontSize: '22px',
            lineHeight: '28px',
            letterSpacing: '-0.6px',
            color: isSelected ? '#E6E6E6' : '#020817',
            marginBottom: '8px',
            marginTop: 0,
            opacity: 1,
            display: 'flex',
            alignItems: 'center',
            verticalAlign: 'middle'
          }}>
            {product.name}
          </h3>
          
          {/* Capacity Label */}
          <p style={{
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0%',
            color: isSelected ? '#FCD34D' : '#E1AE20',
            marginBottom: '16px',
            marginTop: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
            display: 'flex',
            alignItems: 'center',
            verticalAlign: 'middle'
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
              marginBottom: '24px',
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
            marginBottom: '24px'
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
                  <span style={{ fontWeight: 400 }}>{annualGeneration?.replace(/\s+annually/gi, '') || annualGeneration}</span>
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
          opacity: 1
        }}>
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '0%',
            color: isSelected ? '#F7C917' : '#1A202C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap'
          }}>
            From {formatPrice(priceAfterRebate)}
          </div>
          <div style={{
            width: '208.66px',
            height: isSelected ? '20px' : '24px',
            borderRadius: '28px',
            paddingTop: '2px',
            paddingBottom: '2px',
            paddingLeft: '12px',
            paddingRight: '12px',
            background: isSelected ? '#96FF9933' : '#D1ECD2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: isSelected ? 'Inter, sans-serif' : 'Manrope, sans-serif',
            fontSize: isSelected ? '14px' : '12px',
            fontWeight: 500,
            lineHeight: isSelected ? '20px' : 'normal',
            letterSpacing: '0%',
            color: isSelected ? '#24DF3C' : '#228B22'
          }}>
            Installed price.
          </div>
        </div>
      </div>
    </div>
  );
}

