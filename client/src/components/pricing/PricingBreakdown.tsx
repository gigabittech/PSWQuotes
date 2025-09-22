import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RebateBreakdown {
  stcRebate: number;
  stateRebate: number;
  localRebate: number;
  totalRebates: number;
}

interface FinancingOption {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  interestRate: number;
  termYears: number;
}

interface SavingsProjection {
  yearOne: number;
  year5: number;
  year10: number;
  year25: number;
  lifetimeSavings: number;
  paybackPeriod: number;
  returnOnInvestment: number;
}

interface EnvironmentalImpact {
  co2ReductionAnnual: number;
  co2ReductionLifetime: number;
  treesEquivalent: number;
  carsOffRoadEquivalent: number;
}

interface EnhancedPricingData {
  totalPrice: string;
  subtotal: string;
  rebatesTotal: string;
  finalPrice: string;
  rebateBreakdown: RebateBreakdown;
  financingOptions: FinancingOption[];
  savingsProjection: SavingsProjection;
  environmentalImpact: EnvironmentalImpact;
}

interface PricingBreakdownProps {
  pricingData: EnhancedPricingData;
  className?: string;
}

export function PricingBreakdown({ pricingData, className }: PricingBreakdownProps) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="pricing-breakdown">
      {/* Main Pricing Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-center font-bold text-primary">
            💰 Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">System Price</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(pricingData.subtotal)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Rebates</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                -{formatCurrency(pricingData.rebatesTotal)}
              </p>
            </div>
            <div className="space-y-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Your Investment</p>
              <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(pricingData.finalPrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="rebates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rebates" data-testid="tab-rebates">🎯 Rebates</TabsTrigger>
          <TabsTrigger value="savings" data-testid="tab-savings">💡 Savings</TabsTrigger>
          <TabsTrigger value="financing" data-testid="tab-financing">💳 Finance</TabsTrigger>
          <TabsTrigger value="environment" data-testid="tab-environment">🌱 Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="rebates" className="space-y-4" data-testid="content-rebates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Government Rebates Breakdown
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {formatCurrency(pricingData.rebateBreakdown.totalRebates)} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <p className="font-medium">Small-scale Technology Certificates (STC)</p>
                    <p className="text-sm text-muted-foreground">Federal government rebate</p>
                  </div>
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {formatCurrency(pricingData.rebateBreakdown.stcRebate)}
                  </p>
                </div>
                
                {pricingData.rebateBreakdown.stateRebate > 0 && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div>
                      <p className="font-medium">WA State Government Rebate</p>
                      <p className="text-sm text-muted-foreground">State solar & battery incentives</p>
                    </div>
                    <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {formatCurrency(pricingData.rebateBreakdown.stateRebate)}
                    </p>
                  </div>
                )}
                
                {pricingData.rebateBreakdown.localRebate > 0 && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div>
                      <p className="font-medium">Local Council Rebate</p>
                      <p className="text-sm text-muted-foreground">Additional local incentives</p>
                    </div>
                    <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                      {formatCurrency(pricingData.rebateBreakdown.localRebate)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4" data-testid="content-savings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 Savings Projection
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {pricingData.savingsProjection.paybackPeriod} year payback
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Year 1</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(pricingData.savingsProjection.yearOne)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Year 5</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(pricingData.savingsProjection.year5)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Year 10</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(pricingData.savingsProjection.year10)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">25-Year Total</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(pricingData.savingsProjection.lifetimeSavings)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Return on Investment</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {pricingData.savingsProjection.returnOnInvestment}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(pricingData.savingsProjection.returnOnInvestment, 1000) / 10} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Every dollar invested returns ${(pricingData.savingsProjection.returnOnInvestment / 100).toFixed(2)} over 25 years
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financing" className="space-y-4" data-testid="content-financing">
          <Card>
            <CardHeader>
              <CardTitle>💳 Green Loan Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {pricingData.financingOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                    data-testid={`financing-option-${option.termYears}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">{option.termYears} Year Loan</h4>
                      <Badge variant="outline">{formatPercent(option.interestRate)} p.a.</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(option.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(option.totalInterest)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Payments</p>
                        <p className="font-bold text-gray-600 dark:text-gray-400">
                          {formatCurrency(option.totalPayments)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Loan Amount</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(option.loanAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Tip:</strong> Green loans often have lower interest rates than personal loans. 
                  Contact us for current rates and eligibility requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4" data-testid="content-environment">
          <Card>
            <CardHeader>
              <CardTitle>🌱 Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🌿</div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {pricingData.environmentalImpact.co2ReductionAnnual.toLocaleString()} kg
                  </p>
                  <p className="text-sm text-muted-foreground">CO₂ reduction per year</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl">📊</div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(pricingData.environmentalImpact.co2ReductionLifetime / 1000).toFixed(1)} tonnes
                  </p>
                  <p className="text-sm text-muted-foreground">25-year CO₂ reduction</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                  <div className="text-2xl mb-2">🌳</div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {pricingData.environmentalImpact.treesEquivalent}
                  </p>
                  <p className="text-sm text-muted-foreground">Trees planted equivalent</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                  <div className="text-2xl mb-2">🚗</div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {pricingData.environmentalImpact.carsOffRoadEquivalent}
                  </p>
                  <p className="text-sm text-muted-foreground">Cars off road equivalent</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🌍 <strong>Your contribution to a cleaner future:</strong> By choosing solar, you're helping reduce 
                  Australia's carbon footprint and supporting renewable energy adoption in Western Australia.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}