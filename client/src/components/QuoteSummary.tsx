import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatPrice } from "../utils/pricingCalculator";
import type { Quote } from "@shared/schema";

interface QuoteSummaryProps {
  quoteId: string;
  onStartOver: () => void;
}

export default function QuoteSummary({ quoteId, onStartOver }: QuoteSummaryProps) {
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ['/api/quotes', quoteId],
  });

  const handleDownloadPDF = () => {
    window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
  };

  const handleContactTeam = () => {
    window.open('tel:(08)61714111');
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center" data-testid="quote-summary-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Generating your quote...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8 text-center" data-testid="quote-summary-error">
        <p className="text-destructive">Error loading quote. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="quote-summary">
      <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
        Your Custom Quote
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Here's your personalized solar solution. Your detailed quote has been sent to your email.
      </p>

      <div className="max-w-4xl mx-auto">
        {/* Selected Products Summary */}
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Selected System Components</h3>
          <div className="space-y-4">
            {/* Solar System Summary */}
            {quote.selectedSystems.includes('solar') && quote.solarPackage && (
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-sun text-secondary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Solar Power System</h4>
                    <p className="text-sm text-muted-foreground">{quote.solarPackage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Battery System Summary */}
            {quote.selectedSystems.includes('battery') && quote.batterySystem && (
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-battery-full text-accent"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Battery Storage</h4>
                    <p className="text-sm text-muted-foreground">{quote.batterySystem}</p>
                  </div>
                </div>
              </div>
            )}

            {/* EV Charger Summary */}
            {quote.selectedSystems.includes('ev') && quote.evCharger && (
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-charging-station text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">EV Charging</h4>
                    <p className="text-sm text-muted-foreground">{quote.evCharger}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Investment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground">Total System Price</span>
              <span className="font-medium">{formatPrice(parseFloat(quote.totalPrice))}</span>
            </div>
            <div className="flex justify-between text-accent">
              <span>Rebates & Incentives</span>
              <span className="font-medium">-{formatPrice(parseFloat(quote.rebateAmount))}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-xl font-bold text-primary">
                <span>Total Investment</span>
                <span data-testid="text-final-price">{formatPrice(parseFloat(quote.finalPrice))}</span>
              </div>
              <div className="text-sm text-muted-foreground text-right mt-1">
                Installed price including GST
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-dollar-sign text-accent text-xl"></i>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Annual Savings</h4>
            <div className="text-2xl font-bold text-primary">$2,800+</div>
            <p className="text-sm text-muted-foreground">Estimated electricity savings</p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-calendar-alt text-secondary text-xl"></i>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Payback Period</h4>
            <div className="text-2xl font-bold text-primary">4-5 years</div>
            <p className="text-sm text-muted-foreground">Return on investment</p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-leaf text-primary text-xl"></i>
            </div>
            <h4 className="font-semibold text-foreground mb-2">CO2 Reduction</h4>
            <div className="text-2xl font-bold text-primary">8.5 tonnes</div>
            <p className="text-sm text-muted-foreground">Annually</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            <i className="fas fa-check-circle text-accent mr-2"></i>
            What happens next?
          </h3>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <div className="font-medium">Quote Review & Follow-up</div>
                <p className="text-muted-foreground">Our team will contact you within 24 hours to discuss your quote and answer any questions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <div className="font-medium">Site Assessment</div>
                <p className="text-muted-foreground">We'll schedule a convenient time for a remote or on-site assessment to finalize system specifications.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-blue-700"
            data-testid="button-download-pdf"
          >
            <i className="fas fa-download mr-2"></i>
            Download PDF Quote
          </Button>
          <Button
            onClick={handleContactTeam}
            className="bg-secondary hover:bg-yellow-500 text-secondary-foreground"
            data-testid="button-contact-team"
          >
            <i className="fas fa-phone mr-2"></i>
            Speak to Our Team
          </Button>
          <Button
            variant="outline"
            onClick={onStartOver}
            data-testid="button-start-over"
          >
            <i className="fas fa-redo mr-2"></i>
            Get Another Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
