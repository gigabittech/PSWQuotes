import { Button } from "@/components/ui/button";
import annualSavingsIcon from "@/assets/AnnualSavings.png";
import paybackPeriodIcon from "@/assets/PaybackPeriod.png";
import co2ReductionIcon from "@/assets/Co2Red.png";

interface QuoteSummaryProps {
  data: {
    systems?: string[];
    solarPackage?: string;
    hybridInverter?: string;
    batterySystem?: string;
    evCharger?: string;
    firstName?: string;
    lastName?: string;
  };
  pricingData: {
    totalPrice: number;
    rebateAmount: number;
    finalPrice: number;
    breakdown: any;
  };
  products: any[];
  onStartOver: () => void;
}

export default function QuoteSummary({ data, pricingData, products, onStartOver }: QuoteSummaryProps) {

  const handleDownloadPDF = () => {
    // This would download the generated PDF
    console.log('Download PDF');
  };

  const handleContactTeam = () => {
    window.open('tel:(08)61714111');
  };

  const getSolarProduct = () => products.find(p => p.id === data.solarPackage);
  const getInverterProduct = () => products.find(p => p.id === data.hybridInverter);
  const getBatteryProduct = () => products.find(p => p.id === data.batterySystem);
  const getEvProduct = () => products.find(p => p.id === data.evCharger);

  return (
    <div className="p-4 sm:p-6 lg:p-8 quote-animation border border-[#DDE1E775] rounded-[65px] bg-[ linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(234, 234, 234, 0.161) 50.87%, rgba(153, 153, 153, 0.0315) 106.32%)]" data-testid="quote-summary">
      <h2 className="text-4xl font-manrope sm:text-4xl font-bold text-foreground mb-4 sm:mb-6 text-center">
        Your Custom Quote
      </h2>
      <p className="text-sm sm:text-xl text-muted-foreground text-center mb-6 sm:mb-8 px-4 sm:px-0">
        Here's your personalized solar solution. Your detailed quote has been sent to your email.
      </p>

      <div className="max-w-4xl mx-auto">
        {/* Selected Products Summary */}
        <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-manrope font-semibold text-foreground mb-3 -ml-6 sm:mb-4">Selected System Components</h3>
          <div className="space-y-3 sm:space-y-4 -ml-6">
            {/* Solar System Summary */}
            {data.systems?.includes('solar') && data.solarPackage && (
              <div 
                className="w-[891px] h-[82px] flex items-center sm:p-4 rounded-lg border border-border"
                style={{
                  background: 'radial-gradient(300% 300% at 47.92% -17.07%, #4E4E4E 0%, #0A0D14 52.79%)'
                }}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <div 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      border: '1px solid #C2C2C233',
                      background: '#EBC9721A'
                    }}
                  >
                    <img 
                      src="/attached_assets/Solar.png" 
                      alt="Solar" 
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 ">
                    <h4 className="font-semibold text-white text-sm sm:text-base">Solar Power System</h4>
                    <p className="text-xs sm:text-sm text-[#FEB60F] truncate">{getSolarProduct()?.name || data.solarPackage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hybrid Inverter Summary */}
            {data.systems?.includes('inverter') && data.hybridInverter && (
              <div className="flex items-center p-3 sm:p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600">🔌</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Hybrid Inverter</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{getInverterProduct()?.name || data.hybridInverter}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Battery System Summary */}
            {data.systems?.includes('battery') && data.batterySystem && (
   <div 
   className="w-[891px] h-[82px] flex items-center sm:p-4 rounded-lg border border-border"
   style={{
     background: 'radial-gradient(300% 300% at 47.92% -17.07%, #4E4E4E 0%, #0A0D14 52.79%)'
   }}
 >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <div 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      border: '1px solid #C2C2C233',
                      background: '#EBC9721A'
                    }}
                  >
                    <img 
                      src="/attached_assets/Battery.png" 
                      alt="Battery" 
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                 


    <div className="flex-1 min-w-0 ">
                    <h4 className="font-semibold text-white text-sm sm:text-base">Battery Storage</h4>
                    <p className="text-xs sm:text-sm text-[#FEB60F] truncate">{getBatteryProduct()?.name || data.batterySystem}</p>
                  </div>







                </div>
              </div>
            )}

            {/* EV Charger Summary */}
            {data.systems?.includes('ev') && data.evCharger && (
              <div 
                className="w-[891px] h-[82px] flex items-center sm:p-4 rounded-lg border border-border"
                style={{
                  background: 'radial-gradient(300% 300% at 47.92% -17.07%, #4E4E4E 0%, #0A0D14 52.79%)'
                }}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <div 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      border: '1px solid #C2C2C233',
                      background: '#EBC9721A'
                    }}
                  >
                    <img 
                      src="/attached_assets/ev.png" 
                      alt="EV Charging" 
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm sm:text-base">EV Charging</h4>
                    <p className="text-xs sm:text-sm text-[#FEB60F] truncate">{getEvProduct()?.name || data.evCharger}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-manrope font-semibold text-foreground mb-3 sm:mb-4">Investment Summary</h3>

        {/* Pricing Summary */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-[#020817]">Total System Price</span>
              <span className="font-medium">${pricingData.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#9DA2A8] text-sm sm:text-base">
              <span>Rebates & Incentives</span>
              <span className="font-medium">-${pricingData.rebateAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-2 sm:pt-3">
              <div className="flex justify-between text-lg sm:text-xl font-bold text-[#020817]">
                <span>Total Investment</span>
                <span
  data-testid="text-final-price"
  className="text-[#EEBD00]"
>
  $
  {(pricingData.finalPrice - pricingData.rebateAmount).toLocaleString()}
</span>
              </div>
              <div className="text-xs sm:text-sm text-[#020817] text-right mt-1">
                Installed price including GST
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="text-center p-4 sm:p-6 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <img src={annualSavingsIcon} alt="Annual Savings" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h4 className="font-semibold font-manrope text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Annual Savings</h4>
            <div className="text-xl sm:text-2xl font-manrope font-bold text-primary">
              {(() => {
                const solarProduct = getSolarProduct();
                const solarMatch = solarProduct?.name?.match(/(\d+\.?\d*)kW/) || data.solarPackage?.match(/(\d+\.?\d*)kW/);
                const solarSize = solarMatch ? parseFloat(solarMatch[1]) : 0;
                const annualSavings = Math.round(solarSize * 420);
                return annualSavings > 0 ? `$${annualSavings.toLocaleString()}+` : 'N/A';
              })()}
            </div>
            <p className="text-xs sm:text-sm font-manrope text-[#9DA2A8]">Estimated electricity savings</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              {/* <span className="text-secondary text-lg sm:text-xl">📅</span> */}
              <img src={paybackPeriodIcon} alt="Payback Period" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h4 className="font-semibold font-manrope text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Payback Period</h4>
            <div className="text-xl sm:text-2xl font-manrope font-bold text-primary">
              {(() => {
                const solarProduct = getSolarProduct();
                const solarMatch = solarProduct?.name?.match(/(\d+\.?\d*)kW/) || data.solarPackage?.match(/(\d+\.?\d*)kW/);
                const solarSize = solarMatch ? parseFloat(solarMatch[1]) : 0;
                const annualSavings = solarSize * 420;
                const finalPrice = pricingData.finalPrice;

                if (finalPrice > 0 && annualSavings > 0) {
                  const years = finalPrice / annualSavings;
                  if (years < 1) return '< 1 year';
                  if (years <= 3) return '2-3 years';
                  if (years <= 5) return '4-5 years';
                  if (years <= 7) return '5-7 years';
                  return `${Math.round(years)} years`;
                }
                return 'N/A';
              })()}
            </div>
            <p className="text-xs sm:text-sm font-manrope ">Return on investment</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <img src={co2ReductionIcon} alt="CO2 Reduction" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h4 className="font-semibold font-manrope text-foreground mb-1 sm:mb-2 text-sm sm:text-base">CO2 Reduction</h4>
            <div className="text-xl sm:text-2xl font-manrope font-bold text-primary">
              {(() => {
                const solarProduct = getSolarProduct();
                const solarMatch = solarProduct?.name?.match(/(\d+\.?\d*)kW/) || data.solarPackage?.match(/(\d+\.?\d*)kW/);
                const solarSize = solarMatch ? parseFloat(solarMatch[1]) : 0;
                const co2Reduction = (solarSize * 1.3).toFixed(1);
                return solarSize > 0 ? `${co2Reduction} tonnes` : 'N/A';
              })()}
            </div>
            <p className="text-xs sm:text-sm font-manrope ">Annually</p>
          </div>
        </div>

        {/* Next Steps */}

        <h3 className="text-lg sm:text-xl font-manrope font-semibold text-foreground mb-3 sm:mb-4">What happens next?</h3>

        <div 
          className="rounded-lg p-6 mb-8"
          style={{
            background: 'linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(245, 245, 245, 0.182) 50.87%, rgba(153, 153, 153, 0) 106.32%)',
            border: '1px solid #D5D5D566'
          }}
        >
          {/* <h3 className="text-lg font-semibold text-foreground mb-4">
            <span className="text-accent mr-2">✅</span>
            What happens next?
          </h3> */}
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#DFC3584D] text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <div className="font-medium  mt-1">Quote Review & Follow-up</div>
                <p className="text-muted-foreground">Our team will contact you within 24 hours to discuss your quote and answer any questions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#DFC3584D] text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <div className="font-medium">Site Assessment</div>
                <p className="text-muted-foreground">We'll schedule a convenient time for a remote or on-site assessment to finalize system specifications.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#DFC3584D] text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <div className="font-medium">Professional Installation</div>
                <p className="text-muted-foreground">Our certified installers will complete your solar system installation with minimal disruption.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">

       



          <Button
            onClick={handleDownloadPDF}
            className="bg-[#F7C917] rounded-[100px]  w-full sm:w-auto min-h-[48px] text-sm sm:text-base"
            data-testid="button-download-pdf"
          >
            {/* <span className="mr-2">📥</span> */}
            Download PDF Quote
          </Button>
          <Button
            onClick={handleContactTeam}
            className="bg-[#F7C917] rounded-[100px]  text-secondary-foreground w-full sm:w-auto min-h-[48px] text-sm sm:text-base"
            data-testid="button-contact-team"
          >
            {/* <span className="mr-2">📞</span> */}
            Speak to Our Team
          </Button>
          <Button
            // variant="outline"
            onClick={onStartOver}
            className="bg-[#F7C917] rounded-[100px]  w-full sm:w-auto min-h-[48px] text-sm sm:text-base"
            data-testid="button-start-over"
          >
            {/* <span className="mr-2">🔄</span> */}
            Get Another Quote
          </Button>
        </div>







      </div>
    </div>
  );
}
