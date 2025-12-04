import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "@/components/quote-form/StepIndicator";
import SystemRequirements from "@/components/quote-form/SystemRequirements";
import ProductSelection from "@/components/quote-form/ProductSelection";
import PropertyDetails from "@/components/quote-form/PropertyDetails";
import QuoteSummary from "@/components/quote-form/QuoteSummary";
import type { QuoteFormData, PricingData, Product } from "@/types/quote";

export default function EmbedPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({
    systems: [],
    powerSupply: undefined,
    state: 'WA',
  });
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Get Your Solar Quote - Perth Solar Warehouse";
  }, []);

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Calculate pricing mutation
  const calculatePricing = useMutation({
    mutationFn: async (data: Partial<QuoteFormData>) => {
      const response = await apiRequest('POST', '/api/calculate-pricing', {
        selectedSystems: data.systems,
        solarPackage: data.solarPackage,
        batterySystem: data.batterySystem,
        evCharger: data.evCharger,
        powerSupply: data.powerSupply,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPricingData(data);
    },
  });

  // Submit quote mutation
  const submitQuote = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/quotes', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote submitted successfully!",
        description: "Your quote has been emailed to you and our team will contact you within 24 hours.",
      });
      setCurrentStep(4);
    },
    onError: () => {
      toast({
        title: "Error submitting quote",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep === 2 && (formData.systems?.length || 0) > 0) {
      calculatePricing.mutate(formData);
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormUpdate = (updates: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (finalData: any) => {
    const submitData = new FormData();
    
    // Add all text fields with proper field mapping
    Object.entries(finalData).forEach(([key, value]) => {
      if (key !== 'switchboardPhoto' && value !== undefined && value !== null) {
        // Map 'systems' to 'selectedSystems' for server compatibility
        const fieldName = key === 'systems' ? 'selectedSystems' : key;
        
        if (Array.isArray(value)) {
          submitData.append(fieldName, JSON.stringify(value));
        } else {
          submitData.append(fieldName, value.toString());
        }
      }
    });

    // Add file if present
    if (finalData.switchboardPhoto) {
      submitData.append('switchboardPhoto', finalData.switchboardPhoto);
    }

    // Add pricing data
    if (pricingData) {
      submitData.append('totalPrice', pricingData.totalPrice.toString());
      submitData.append('rebateAmount', pricingData.rebateAmount.toString());
      submitData.append('finalPrice', pricingData.finalPrice.toString());
    }
    
    submitQuote.mutate(submitData);
  };

  const startOver = () => {
    setFormData({
      systems: [],
      powerSupply: undefined,
      state: 'WA',
    });
    setPricingData(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen py-12" style={{ background: '#10B981' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Get Your Instant Solar Quote
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            Follow our simple 3-step process to receive a personalized solar quote tailored to your property and energy needs.
          </p>
        </div>
        
        <StepIndicator currentStep={currentStep}>
          {currentStep === 1 && (
            <SystemRequirements
              data={formData}
              onUpdate={handleFormUpdate}
              onNext={nextStep}
            />
          )}
          
          {currentStep === 2 && (
            <ProductSelection
              data={{ ...formData, powerSupply: formData.powerSupply }}
              products={products}
              pricingData={pricingData}
              onUpdate={handleFormUpdate}
              onNext={nextStep}
              onPrev={prevStep}
              isCalculating={calculatePricing.isPending}
            />
          )}
          
          {currentStep === 3 && (
            <PropertyDetails
              data={formData}
              onUpdate={handleFormUpdate}
              onSubmit={handleSubmit}
              onPrev={prevStep}
              isSubmitting={submitQuote.isPending}
            />
          )}
          
          {currentStep === 4 && pricingData && (
            <QuoteSummary
              data={formData}
              pricingData={pricingData}
              products={products}
              onStartOver={startOver}
            />
          )}
        </StepIndicator>
      </div>
    </div>
  );
}
