import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = 'single_phase' | 'three_phase';
type ProductType = 'solar' | 'battery' | 'ev_charger' | 'inverter';

interface ProductFormData {
  phase: Phase | '';
  productType: ProductType | '';
  brand: string;
  model: string;
  // Solar specific
  sizeKw?: number;
  panels?: number;
  wattage?: number;
  priceAfterRebate?: number;
  // Battery specific
  capacityKwh?: number;
  rrp?: number;
  powerKw?: number;
  // EV Charger specific
  cableType?: string;
  cableLength?: number;
  installedPrice?: number;
  // Common
  warrantyYears?: number;
}

export default function ProductManager() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    phase: '',
    productType: '',
    brand: '',
    model: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await apiRequest('POST', '/api/admin/products', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product added successfully to pricing data.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      phase: '',
      productType: '',
      brand: '',
      model: '',
    });
    setStep(1);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return formData.phase !== '';
    if (step === 2) return formData.productType !== '';
    if (step === 3) return formData.brand !== '' && formData.model !== '';
    return true;
  };

  const handleSubmit = () => {
    addProductMutation.mutate(formData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground flex items-center gap-2 sm:gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Management
          </h2>
          <p className="text-muted-foreground mt-2 font-inter">
            Add new products to your pricing database with an easy step-by-step process
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {[
            { num: 1, label: 'Phase' },
            { num: 2, label: 'Product Type' },
            { num: 3, label: 'Details' },
            { num: 4, label: 'Review' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all border-2",
                    s.num === step
                      ? "bg-primary text-white border-primary shadow-lg scale-110"
                      : s.num < step
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white dark:bg-gray-800 text-muted-foreground border-gray-300 dark:border-gray-600"
                  )}
                >
                  {s.num < step ? <Check className="w-6 h-6" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium text-center",
                  s.num === step ? "text-primary" : s.num < step ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 -mt-6 transition-all",
                    s.num < step ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="glass-form-card p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto shadow-xl">
        {/* Step 1: Phase Selection */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Select Phase Type
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                Choose the electrical phase for this product
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-10">
              {[
                { id: 'single_phase' as Phase, title: 'Single Phase', desc: 'Most residential properties', icon: '🏠' },
                { id: 'three_phase' as Phase, title: 'Three Phase', desc: 'Commercial & larger properties', icon: '🏢' },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => updateFormData('phase', option.id)}
                  className={cn(
                    "relative p-8 rounded-2xl cursor-pointer transition-all duration-300 border-2 group",
                    "hover:shadow-xl hover:-translate-y-1",
                    formData.phase === option.id
                      ? "border-primary bg-primary/10 shadow-lg ring-4 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {formData.phase === option.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in fade-in zoom-in">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="text-5xl mb-4 text-center">{option.icon}</div>
                  <h4 className="font-bold text-xl mb-2 text-center group-hover:text-primary transition-colors">{option.title}</h4>
                  <p className="text-sm text-muted-foreground text-center">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Product Type Selection */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Select Product Type
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                What type of product are you adding?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-10">
              {[
                { id: 'solar' as ProductType, title: 'Solar Panels', icon: '☀️', color: 'from-yellow-400 to-orange-500' },
                { id: 'battery' as ProductType, title: 'Battery Storage', icon: '🔋', color: 'from-blue-400 to-blue-600' },
                { id: 'ev_charger' as ProductType, title: 'EV Charger', icon: '⚡', color: 'from-green-400 to-green-600' },
                { id: 'inverter' as ProductType, title: 'Inverter', icon: '🔌', color: 'from-purple-400 to-purple-600' },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => updateFormData('productType', option.id)}
                  className={cn(
                    "relative p-8 rounded-2xl cursor-pointer transition-all duration-300 border-2 group",
                    "hover:shadow-xl hover:-translate-y-1",
                    formData.productType === option.id
                      ? "border-primary bg-primary/10 shadow-lg ring-4 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {formData.productType === option.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in fade-in zoom-in">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="text-5xl mb-4 text-center">{option.icon}</div>
                  <h4 className="font-bold text-xl text-center group-hover:text-primary transition-colors">{option.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Product Details */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Product Details
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                Enter the specifications for this {formData.productType?.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-6 mt-8">
              {/* Common Fields */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-lg text-foreground mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => updateFormData('brand', e.target.value)}
                      placeholder="e.g., Jinko, Tesla"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium">Model/Series *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => updateFormData('model', e.target.value)}
                      placeholder="e.g., Tiger Neo, Powerwall"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Solar Specific Fields */}
              {formData.productType === 'solar' && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg text-foreground mb-4">Solar Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sizeKw" className="text-sm font-medium">System Size (kW)</Label>
                      <Input
                        id="sizeKw"
                        type="number"
                        step="0.1"
                        value={formData.sizeKw || ''}
                        onChange={(e) => updateFormData('sizeKw', parseFloat(e.target.value))}
                        placeholder="6.6"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panels" className="text-sm font-medium">Number of Panels</Label>
                      <Input
                        id="panels"
                        type="number"
                        value={formData.panels || ''}
                        onChange={(e) => updateFormData('panels', parseInt(e.target.value))}
                        placeholder="16"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wattage" className="text-sm font-medium">Panel Wattage (W)</Label>
                      <Input
                        id="wattage"
                        type="number"
                        value={formData.wattage || ''}
                        onChange={(e) => updateFormData('wattage', parseInt(e.target.value))}
                        placeholder="420"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceAfterRebate" className="text-sm font-medium">Price After Rebate ($)</Label>
                    <Input
                      id="priceAfterRebate"
                      type="number"
                      value={formData.priceAfterRebate || ''}
                      onChange={(e) => updateFormData('priceAfterRebate', parseFloat(e.target.value))}
                      placeholder="3290"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Battery Specific Fields */}
              {formData.productType === 'battery' && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg text-foreground mb-4">Battery Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacityKwh" className="text-sm font-medium">Capacity (kWh)</Label>
                      <Input
                        id="capacityKwh"
                        type="number"
                        step="0.1"
                        value={formData.capacityKwh || ''}
                        onChange={(e) => updateFormData('capacityKwh', parseFloat(e.target.value))}
                        placeholder="13.5"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="powerKw" className="text-sm font-medium">Power (kW)</Label>
                      <Input
                        id="powerKw"
                        type="number"
                        step="0.1"
                        value={formData.powerKw || ''}
                        onChange={(e) => updateFormData('powerKw', parseFloat(e.target.value))}
                        placeholder="5.0"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rrp" className="text-sm font-medium">RRP ($)</Label>
                      <Input
                        id="rrp"
                        type="number"
                        value={formData.rrp || ''}
                        onChange={(e) => updateFormData('rrp', parseFloat(e.target.value))}
                        placeholder="15000"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceAfterRebate" className="text-sm font-medium">Price After Rebate ($)</Label>
                    <Input
                      id="priceAfterRebate"
                      type="number"
                      value={formData.priceAfterRebate || ''}
                      onChange={(e) => updateFormData('priceAfterRebate', parseFloat(e.target.value))}
                      placeholder="12490"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* EV Charger Specific Fields */}
              {formData.productType === 'ev_charger' && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg text-foreground mb-4">EV Charger Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="powerKw" className="text-sm font-medium">Power (kW)</Label>
                      <Input
                        id="powerKw"
                        type="number"
                        step="0.1"
                        value={formData.powerKw || ''}
                        onChange={(e) => updateFormData('powerKw', parseFloat(e.target.value))}
                        placeholder="7.0"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cableType" className="text-sm font-medium">Cable Type</Label>
                      <Input
                        id="cableType"
                        value={formData.cableType || ''}
                        onChange={(e) => updateFormData('cableType', e.target.value)}
                        placeholder="Tethered"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cableLength" className="text-sm font-medium">Cable Length (m)</Label>
                      <Input
                        id="cableLength"
                        type="number"
                        value={formData.cableLength || ''}
                        onChange={(e) => updateFormData('cableLength', parseFloat(e.target.value))}
                        placeholder="5"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installedPrice" className="text-sm font-medium">Installed Price ($)</Label>
                    <Input
                      id="installedPrice"
                      type="number"
                      value={formData.installedPrice || ''}
                      onChange={(e) => updateFormData('installedPrice', parseFloat(e.target.value))}
                      placeholder="1790"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Common Field: Warranty */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-2">
                <Label htmlFor="warrantyYears" className="text-sm font-medium">Warranty (Years)</Label>
                <Input
                  id="warrantyYears"
                  type="number"
                  value={formData.warrantyYears || ''}
                  onChange={(e) => updateFormData('warrantyYears', parseInt(e.target.value))}
                  placeholder="10"
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Review & Confirm
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                Please review the product details before adding
              </p>
            </div>

            <div className="mt-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-6 sm:p-8 space-y-4 border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Phase:</span>
                  <span className="font-bold text-foreground">{formData.phase?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Product Type:</span>
                  <span className="font-bold text-foreground">{formData.productType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Brand:</span>
                  <span className="font-bold text-foreground">{formData.brand}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Model:</span>
                  <span className="font-bold text-foreground">{formData.model}</span>
                </div>
              </div>

              {formData.productType === 'solar' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.sizeKw && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">System Size:</span>
                      <span className="font-bold text-foreground">{formData.sizeKw} kW</span>
                    </div>
                  )}
                  {formData.priceAfterRebate && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Price:</span>
                      <span className="font-bold text-primary text-lg">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {formData.productType === 'battery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.capacityKwh && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Capacity:</span>
                      <span className="font-bold text-foreground">{formData.capacityKwh} kWh</span>
                    </div>
                  )}
                  {formData.priceAfterRebate && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Price:</span>
                      <span className="font-bold text-primary text-lg">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {formData.productType === 'ev_charger' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.powerKw && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Power:</span>
                      <span className="font-bold text-foreground">{formData.powerKw} kW</span>
                    </div>
                  )}
                  {formData.installedPrice && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground text-sm font-medium mb-1 sm:mb-0">Installed Price:</span>
                      <span className="font-bold text-primary text-lg">${formData.installedPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-border/50">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={addProductMutation.isPending}
              className="gap-2 h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={resetForm}
              disabled={addProductMutation.isPending}
              className="gap-2 text-muted-foreground hover:text-foreground h-11 px-6"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              size="lg"
              className="gap-2 h-11 px-8 bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={addProductMutation.isPending}
              size="lg"
              className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-8 shadow-lg"
            >
              {addProductMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add Product
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
