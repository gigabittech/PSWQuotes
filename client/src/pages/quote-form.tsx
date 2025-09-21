import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StepIndicator from "@/components/quote-form/StepIndicator";
import SystemRequirements from "@/components/quote-form/SystemRequirements";
import ProductSelection from "@/components/quote-form/ProductSelection";
import PropertyDetails from "@/components/quote-form/PropertyDetails";
import QuoteSummary from "@/components/quote-form/QuoteSummary";
import type { QuoteFormData, PricingData, ProductData } from "@/types/quote";

export default function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({
    systems: [],
    powerSupply: '',
    state: 'WA',
  });
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const { toast } = useToast();

  // Fetch products
  const { data: products = [] } = useQuery<ProductData[]>({
    queryKey: ['/api/products'],
  });

  // Calculate pricing mutation
  const calculatePricing = useMutation({
    mutationFn: async (data: Partial<QuoteFormData>) => {
      const response = await apiRequest('POST', '/api/pricing/calculate', {
        systemTypes: data.systems,
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
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiRequest('POST', '/api/quotes', {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        streetAddress: data.streetAddress,
        suburb: data.suburb,
        state: data.state,
        postcode: data.postcode,
        powerSupply: data.powerSupply,
        systemTypes: data.systems,
        solarPackage: data.solarPackage,
        batterySystem: data.batterySystem,
        evCharger: data.evCharger,
        additionalInfo: data.additionalInfo,
      });
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

  const handleSubmit = (finalData: QuoteFormData) => {
    submitQuote.mutate(finalData);
  };

  const startOver = () => {
    setFormData({
      systems: [],
      powerSupply: '',
      state: 'WA',
    });
    setPricingData(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary" data-testid="header-logo">
                  Perth Solar Warehouse
                </h1>
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">Get your instant solar quote</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="text-secondary">★</span>
                <span>4.9/5 from 1500+ reviews</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="header-phone">
                <span className="text-primary">📞</span>
                <span className="text-sm font-medium">(08) 6171 4111</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              Get Your Solar Quote in <span className="text-secondary">Real-Time</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90" data-testid="hero-subtitle">
              Experience our hassle-free guarantee with instant pricing, personalized recommendations, 
              and professional installation across Western Australia.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-accent">✓</span>
                <span>No pressure sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-accent">✓</span>
                <span>Instant real-time pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-accent">✓</span>
                <span>Professional installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-accent">✓</span>
                <span>20+ years experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Container */}
      <section className="py-12 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepIndicator currentStep={currentStep} />
          
          <Card className="bg-card rounded-lg shadow-lg overflow-hidden">
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
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Perth Solar Warehouse?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by over 1,500 customers across Western Australia with a proven track record of excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6" data-testid="trust-indicator-legendary">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">SolarQuotes Legendary</h3>
              <p className="text-sm text-muted-foreground">Top-rated installer nationwide</p>
            </div>
            <div className="text-center p-6" data-testid="trust-indicator-approved">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">NETCC Approved</h3>
              <p className="text-sm text-muted-foreground">Government-approved seller</p>
            </div>
            <div className="text-center p-6" data-testid="trust-indicator-reviews">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-2xl">👥</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">1,500+ Reviews</h3>
              <p className="text-sm text-muted-foreground">4.9/5 star average rating</p>
            </div>
            <div className="text-center p-6" data-testid="trust-indicator-experience">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">20+ Years</h3>
              <p className="text-sm text-muted-foreground">Established business history</p>
            </div>
          </div>

          {/* Customer Testimonial */}
          <div className="bg-muted/50 rounded-lg p-8 max-w-4xl mx-auto" data-testid="customer-testimonial">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">👤</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="flex text-secondary text-sm mr-2">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                  <span className="text-sm text-muted-foreground">5/5</span>
                </div>
                <blockquote className="text-foreground italic mb-3">
                  "I collected over 30 quotes from 12 installers around Perth, and Perth Solar Warehouse was not only one of the most competitive in price but also the most highly recommended on social media. There were no hard sales tactics, gimmicks, 'today only' offers, or bagging out their competitors. It was just pure professionalism and service."
                </blockquote>
                <cite className="text-sm font-medium text-muted-foreground">— David, Local Guide, Google Reviews</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">Perth Solar Warehouse</h3>
              <p className="text-gray-300 mb-4">
                Western Australia's trusted solar, battery, and EV charging specialist. 
                Providing professional installation services across Perth and Bunbury regions.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-primary">📞</span>
                  <span>(08) 6171 4111</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary">📧</span>
                  <span>info@perthsolarwarehouse.com.au</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Solar Installation</li>
                <li>Battery Storage</li>
                <li>EV Chargers</li>
                <li>Commercial Solar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Installation Areas</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Perth Metro</li>
                <li>Bunbury Region</li>
                <li>Yanchep to Northam</li>
                <li>Fremantle to Hills</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Perth Solar Warehouse. All rights reserved. Licensed Electrical Contractor EC010771</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
