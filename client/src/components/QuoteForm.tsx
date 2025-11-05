import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePricingCalculator } from "@/hooks/usePricingCalculator";
import StepIndicator from "./StepIndicator";
import SystemSelection from "./SystemSelection";
import ProductSelection from "./ProductSelection";
import PropertyDetails from "./PropertyDetails";
import QuoteSummary from "./QuoteSummary";
import type { QuoteFormData } from "../types/quote";

export default function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>({
    systems: [],
    powerSupply: 'unknown',
    firstName: '',
    lastName: '',
    email: '',
    phone: undefined,
    address: '',
    suburb: '',
    state: 'WA',
    postcode: '',
    additionalInfo: '',
  });
  const [switchboardPhoto, setSwitchboardPhoto] = useState<File | null>(null);
  const [quoteId, setQuoteId] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pricing, calculatePricing, isCalculating, error: pricingError } = usePricingCalculator();

  // Calculate pricing whenever selections change (including when cleared)
  useEffect(() => {
    calculatePricing({
      selectedSystems: formData.systems,
      solarPackage: formData.solarPackage,
      batterySystem: formData.batterySystem,
      evCharger: formData.evCharger,
      powerSupply: formData.powerSupply,
    });
  }, [formData.systems, formData.solarPackage, formData.batterySystem, formData.evCharger, formData.powerSupply]);

  const createQuoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/quotes', data);
      return response.json();
    },
    onSuccess: (result) => {
      setQuoteId(result.quote.id);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      
      if (result.emailSent) {
        toast({
          title: "Quote Generated Successfully!",
          description: "Your quote has been sent to your email address.",
        });
      } else {
        toast({
          title: "Quote Generated",
          description: "Your quote is ready, but there was an issue sending the email.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSystemToggle = (system: string) => {
    const newSystems = formData.systems.includes(system as any)
      ? formData.systems.filter((s: string) => s !== system)
      : [...formData.systems, system as any];
    
    setFormData(prev => ({
      ...prev,
      systems: newSystems,
    }));
  };

  const handlePowerSupplyChange = (supply: string) => {
    setFormData(prev => ({
      ...prev,
      powerSupply: supply as any,
    }));
  };

  const handleProductSelection = (type: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleFormDataChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleFileChange = (file: File | null) => {
    setSwitchboardPhoto(file);
  };

  const handleSubmitQuote = () => {
    // Show error if pricing calculation failed
    if (pricingError) {
      toast({
        title: "Pricing Error",
        description: "Unable to calculate quote pricing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Ensure pricing has been calculated
    if (pricing.totalPrice === 0 && formData.systems.length > 0) {
      toast({
        title: "Calculating Pricing",
        description: "Please wait while we calculate your quote...",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    
    // Ensure selectedSystems is always included, even if empty
    const selectedSystems = formData.systems || [];
    submitData.append('selectedSystems', JSON.stringify(selectedSystems));
    
    // Add all other form fields
    Object.entries(formData).forEach(([key, value]) => {
      // Skip 'systems' since we already handled it as 'selectedSystems'
      if (key === 'systems') return;
      
      if (Array.isArray(value)) {
        submitData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        submitData.append(key, value.toString());
      }
    });

    // Add file if present
    if (switchboardPhoto) {
      submitData.append('switchboardPhoto', switchboardPhoto);
    }

    // Add real pricing from calculator
    submitData.append('totalPrice', pricing.totalPrice.toString());
    submitData.append('rebateAmount', pricing.rebateAmount.toString());
    submitData.append('finalPrice', pricing.finalPrice.toString());
    submitData.append('status', 'pending');

    createQuoteMutation.mutate(submitData);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startOver = () => {
    setCurrentStep(1);
    setFormData({
      systems: [],
      powerSupply: 'unknown',
      firstName: '',
      lastName: '',
      email: '',
      phone: undefined,
      address: '',
      suburb: '',
      state: 'WA',
      postcode: '',
      additionalInfo: '',
    });
    setSwitchboardPhoto(null);
    setQuoteId("");
  };

  return (
    <section className="py-12 glass-backdrop min-h-screen" data-testid="quote-form">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        {/* Enhanced Glassmorphic Form Card */}
        <div className="glass-form-card p-8 md:p-12 overflow-hidden">
          {currentStep === 1 && (
            <SystemSelection
              selectedSystems={formData.systems}
              powerSupply={formData.powerSupply}
              onSystemToggle={handleSystemToggle}
              onPowerSupplyChange={handlePowerSupplyChange}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <ProductSelection
              selectedSystems={formData.systems}
              solarPackage={formData.solarPackage || ''}
              batterySystem={formData.batterySystem || ''}
              evCharger={formData.evCharger || ''}
              onSolarSelect={(id) => handleProductSelection('solarPackage', id)}
              onBatterySelect={(id) => handleProductSelection('batterySystem', id)}
              onEvSelect={(id) => handleProductSelection('evCharger', id)}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <PropertyDetails
              formData={{...formData, phone: formData.phone || '', additionalInfo: formData.additionalInfo || ''}}
              onFormDataChange={handleFormDataChange}
              onFileChange={handleFileChange}
              onNext={handleSubmitQuote}
              onBack={prevStep}
              isSubmitting={isCalculating || createQuoteMutation.isPending}
              pricingError={pricingError}
            />
          )}

          {currentStep === 4 && quoteId && (
            <QuoteSummary
              quoteId={quoteId}
              onStartOver={startOver}
            />
          )}
        </div>
      </div>
    </section>
  );
}
