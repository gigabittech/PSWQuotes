import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DynamicLayout from "@/components/DynamicLayout";
import DynamicHeader from "@/components/DynamicHeader";
import DynamicHero from "@/components/DynamicHero";
import DynamicFooter from "@/components/DynamicFooter";
import StepIndicator from "@/components/quote-form/StepIndicator";
import SystemRequirements from "@/components/quote-form/SystemRequirements";
import ProductSelection from "@/components/quote-form/ProductSelection";
import PropertyDetails from "@/components/quote-form/PropertyDetails";
import QuoteSummary from "@/components/quote-form/QuoteSummary";
import EmbedCodeGenerator from "@/components/EmbedCodeGenerator";
import type { QuoteFormData, PricingData, Product } from "@/types/quote";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({
    systems: [],
    powerSupply: undefined,
    state: 'WA',
  });
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const { toast } = useToast();

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
    console.log('handleSubmit received finalData:', finalData);
    console.log('Current formData state:', formData);
    console.log('Pricing data:', pricingData);
    
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

    // Debug: Log what's in FormData
    console.log('FormData entries:');
    Array.from(submitData.entries()).forEach(([key, value]) => {
      console.log(key, '=', value);
    });
    
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
    <DynamicLayout>
      <DynamicHeader />
      <DynamicHero />

      {/* Quote Form Container */}
      <section id="quote" className="py-12 sm:py-16 lg:py-20 glass-backdrop min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div 
              style={{
                width: '1280px',
                height: '128px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                margin: '0 auto',
                opacity: 1
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <h2 
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    fontSize: '48px',
                    lineHeight: '48px',
                    letterSpacing: '-1.2px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: '#020817',
                    margin: 0
                  }}
                >
                  Get Your Instant Solar Quote
                </h2>
              </div>
              <p 
                style={{
                  width: '744px',
                  minHeight: '56px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '20px',
                  lineHeight: '28px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  color: '#787E86',
                  margin: 0,
                  paddingTop: '14px',
                  paddingBottom: '14px'
                }}
              >
                Follow our simple 3-step process to receive a personalized solar quote<br />
                tailored to your property and energy needs.
              </p>
            </div>
          </div>
          
          <StepIndicator currentStep={currentStep} />
          
          <div className="glass-card overflow-hidden max-w-5xl mx-auto">
            {currentStep === 1 && (
              <SystemRequirements
                data={formData}
                onUpdate={handleFormUpdate}
                onNext={nextStep}
              />
            )}
            
            {currentStep === 2 && (
              <ProductSelection
                data={formData}
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
          </div>
        </div>
      </section>

      {/* Embed Code Section */}
      <section className="py-12 sm:py-16 lg:py-20 glass-backdrop">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 style={{
              width: '832px',
              height: '40px',
              fontFamily: 'Manrope',
              fontWeight: 600,
              fontStyle: 'normal',
              fontSize: '36px',
              lineHeight: '40px',
              letterSpacing: '-0.9px',
              textAlign: 'center',
              verticalAlign: 'middle',
              color: '#020817',
              leadingTrim: 'none'
            } as React.CSSProperties & { leadingTrim?: string }}>
              Embed This Form On Your Website
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Copy the code below to add this solar quote form to your website
            </p>
          </div>
          <EmbedCodeGenerator />
        </div>
      </section>

      <DynamicFooter />
    </DynamicLayout>
  );
}
