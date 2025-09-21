import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./StepIndicator";
import SystemSelection from "./SystemSelection";
import ProductSelection from "./ProductSelection";
import PropertyDetails from "./PropertyDetails";
import QuoteSummary from "./QuoteSummary";
import type { QuoteFormData } from "../types/quote";

export default function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedSystems: [],
    powerSupply: '',
    customerName: '',
    email: '',
    phone: '',
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
    const newSystems = formData.selectedSystems.includes(system as any)
      ? formData.selectedSystems.filter(s => s !== system)
      : [...formData.selectedSystems, system as any];
    
    setFormData(prev => ({
      ...prev,
      selectedSystems: newSystems,
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
    const submitData = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        submitData.append(key, JSON.stringify(value));
      } else {
        submitData.append(key, value.toString());
      }
    });

    // Add file if present
    if (switchboardPhoto) {
      submitData.append('switchboardPhoto', switchboardPhoto);
    }

    // Calculate and add pricing
    const totalPrice = calculateTotalPrice();
    const rebateAmount = calculateRebateAmount();
    const finalPrice = totalPrice - rebateAmount;

    submitData.append('totalPrice', totalPrice.toString());
    submitData.append('rebateAmount', rebateAmount.toString());
    submitData.append('finalPrice', finalPrice.toString());
    submitData.append('status', 'pending');

    createQuoteMutation.mutate(submitData);
  };

  const calculateTotalPrice = (): number => {
    // This would use the real pricing calculator
    // For now, return a sample calculation
    return 15000;
  };

  const calculateRebateAmount = (): number => {
    // This would calculate actual rebates
    // For now, return a sample calculation
    return 5000;
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
      selectedSystems: [],
      powerSupply: '',
      customerName: '',
      email: '',
      phone: '',
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
    <section className="py-12 bg-muted" data-testid="quote-form">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {currentStep === 1 && (
            <SystemSelection
              selectedSystems={formData.selectedSystems}
              powerSupply={formData.powerSupply}
              onSystemToggle={handleSystemToggle}
              onPowerSupplyChange={handlePowerSupplyChange}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <ProductSelection
              selectedSystems={formData.selectedSystems}
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
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onFileChange={handleFileChange}
              onNext={handleSubmitQuote}
              onBack={prevStep}
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
