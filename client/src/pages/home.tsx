import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "@/components/quote-form/StepIndicator";
import SystemRequirements from "@/components/quote-form/SystemRequirements";
import ProductSelection from "@/components/quote-form/ProductSelection";
import PropertyDetails from "@/components/quote-form/PropertyDetails";
import QuoteSummary from "@/components/quote-form/QuoteSummary";
import type { QuoteFormData, PricingData, Product } from "@/types/quote";
import pswLogo from "@/assets/psw-logo.png";
import heroBackground from "@/assets/hero-background.png";

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
    const submitData = new FormData();
    
    // Add all text fields
    Object.entries(finalData).forEach(([key, value]) => {
      if (key !== 'switchboardPhoto' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={pswLogo} 
                  alt="Perth Solar Warehouse" 
                  className="h-12 w-auto" 
                  data-testid="header-logo"
                />
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-gray-300">Get your instant solar quote</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <span className="text-secondary">⭐</span>
                <span>4.9/5 from 1500+ reviews</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="header-phone">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                <span className="text-sm font-medium text-white">(08) 6171 4111</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white drop-shadow-2xl" data-testid="hero-title">
              Get a quote with our <br />
              <span className="text-primary">hassle-free guarantee</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-white drop-shadow-lg" data-testid="hero-subtitle">
              Experience instant pricing, personalized solar recommendations, and professional installation 
              across Western Australia with our proven track record of excellence.
            </p>
            
            {/* Main CTA */}
            <div className="mb-16">
              <a 
                href="#quote-form" 
                className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold text-lg rounded-lg transition-colors duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Get Your Free Quote Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white drop-shadow-lg">
              <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No pressure sales</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant real-time pricing</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Professional installation</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>20+ years experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Container */}
      <section id="quote-form" className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get Your Instant Solar Quote
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow our simple 3-step process to receive a personalized solar quote tailored to your property and energy needs.
            </p>
          </div>
          
          <StepIndicator currentStep={currentStep} />
          
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
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


      {/* Footer */}
      <footer className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <h3 className="text-3xl font-bold text-primary mb-6">Perth Solar Warehouse</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Western Australia's trusted solar, battery, and EV charging specialist. 
                Providing professional installation services across Perth and Bunbury regions with 20+ years of experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                    </svg>
                  </div>
                  <span className="text-lg">(08) 6171 4111</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                    </svg>
                  </div>
                  <span className="text-lg">info@perthsolarwarehouse.com.au</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Services</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-primary transition-colors cursor-pointer">Solar Panel Installation</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Battery Storage Systems</li>
                <li className="hover:text-primary transition-colors cursor-pointer">EV Charging Stations</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Commercial Solar Solutions</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Solar Maintenance & Repairs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Installation Areas</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-primary transition-colors cursor-pointer">Perth Metro Area</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Bunbury Region</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Yanchep to Northam</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Fremantle to Perth Hills</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Mandurah & Surrounds</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-center md:text-left">
                <p>&copy; 2025 Perth Solar Warehouse. All rights reserved.</p>
                <p className="text-sm mt-1">Licensed Electrical Contractor EC010771 | ABN: 12 345 678 901</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-secondary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-sm text-gray-300">4.9/5 from 1500+ reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
