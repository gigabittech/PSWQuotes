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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-outfit font-semibold text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Management
          </h2>
          <p className="text-muted-foreground mt-2 font-inter">
            Add new products to your pricing database with an easy step-by-step process
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                s === step
                  ? "bg-primary text-white scale-110 shadow-lg"
                  : s < step
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  "w-16 h-1 mx-2 rounded",
                  s < step ? "bg-accent" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center gap-8 text-sm font-inter">
        <span className={step === 1 ? "text-primary font-semibold" : "text-muted-foreground"}>Phase</span>
        <span className={step === 2 ? "text-primary font-semibold" : "text-muted-foreground"}>Product Type</span>
        <span className={step === 3 ? "text-primary font-semibold" : "text-muted-foreground"}>Details</span>
        <span className={step === 4 ? "text-primary font-semibold" : "text-muted-foreground"}>Review</span>
      </div>

      {/* Form Card */}
      <Card className="glass-form-card p-8 max-w-3xl mx-auto">
        {/* Step 1: Phase Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-outfit text-2xl font-semibold text-foreground">
                Select Phase Type
              </h3>
              <p className="text-muted-foreground font-inter">
                Choose the electrical phase for this product
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {[
                { id: 'single_phase' as Phase, title: 'Single Phase', desc: 'Most residential properties' },
                { id: 'three_phase' as Phase, title: 'Three Phase', desc: 'Commercial & larger properties' },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => updateFormData('phase', option.id)}
                  className={cn(
                    "p-6 rounded-xl cursor-pointer transition-all duration-300 border-2",
                    "hover:scale-105 hover:shadow-lg",
                    formData.phase === option.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <h4 className="font-semibold text-lg mb-2">{option.title}</h4>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Product Type Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-outfit text-2xl font-semibold text-foreground">
                Select Product Type
              </h3>
              <p className="text-muted-foreground font-inter">
                What type of product are you adding?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {[
                { id: 'solar' as ProductType, title: 'Solar Panels', icon: '☀️' },
                { id: 'battery' as ProductType, title: 'Battery Storage', icon: '🔋' },
                { id: 'ev_charger' as ProductType, title: 'EV Charger', icon: '⚡' },
                { id: 'inverter' as ProductType, title: 'Inverter', icon: '🔌' },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => updateFormData('productType', option.id)}
                  className={cn(
                    "p-6 rounded-xl cursor-pointer transition-all duration-300 border-2",
                    "hover:scale-105 hover:shadow-lg",
                    formData.productType === option.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-semibold text-lg">{option.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Product Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-outfit text-2xl font-semibold text-foreground">
                Product Details
              </h3>
              <p className="text-muted-foreground font-inter">
                Enter the specifications for this {formData.productType?.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-4 mt-8">
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => updateFormData('brand', e.target.value)}
                    placeholder="e.g., Jinko, Tesla"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model/Series *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => updateFormData('model', e.target.value)}
                    placeholder="e.g., Tiger Neo, Powerwall"
                  />
                </div>
              </div>

              {/* Solar Specific Fields */}
              {formData.productType === 'solar' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sizeKw">System Size (kW)</Label>
                      <Input
                        id="sizeKw"
                        type="number"
                        step="0.1"
                        value={formData.sizeKw || ''}
                        onChange={(e) => updateFormData('sizeKw', parseFloat(e.target.value))}
                        placeholder="6.6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panels">Number of Panels</Label>
                      <Input
                        id="panels"
                        type="number"
                        value={formData.panels || ''}
                        onChange={(e) => updateFormData('panels', parseInt(e.target.value))}
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wattage">Panel Wattage (W)</Label>
                      <Input
                        id="wattage"
                        type="number"
                        value={formData.wattage || ''}
                        onChange={(e) => updateFormData('wattage', parseInt(e.target.value))}
                        placeholder="420"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priceAfterRebate">Price After Rebate ($)</Label>
                    <Input
                      id="priceAfterRebate"
                      type="number"
                      value={formData.priceAfterRebate || ''}
                      onChange={(e) => updateFormData('priceAfterRebate', parseFloat(e.target.value))}
                      placeholder="3290"
                    />
                  </div>
                </>
              )}

              {/* Battery Specific Fields */}
              {formData.productType === 'battery' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capacityKwh">Capacity (kWh)</Label>
                      <Input
                        id="capacityKwh"
                        type="number"
                        step="0.1"
                        value={formData.capacityKwh || ''}
                        onChange={(e) => updateFormData('capacityKwh', parseFloat(e.target.value))}
                        placeholder="13.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="powerKw">Power (kW)</Label>
                      <Input
                        id="powerKw"
                        type="number"
                        step="0.1"
                        value={formData.powerKw || ''}
                        onChange={(e) => updateFormData('powerKw', parseFloat(e.target.value))}
                        placeholder="5.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rrp">RRP ($)</Label>
                      <Input
                        id="rrp"
                        type="number"
                        value={formData.rrp || ''}
                        onChange={(e) => updateFormData('rrp', parseFloat(e.target.value))}
                        placeholder="15000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priceAfterRebate">Price After Rebate ($)</Label>
                    <Input
                      id="priceAfterRebate"
                      type="number"
                      value={formData.priceAfterRebate || ''}
                      onChange={(e) => updateFormData('priceAfterRebate', parseFloat(e.target.value))}
                      placeholder="12490"
                    />
                  </div>
                </>
              )}

              {/* EV Charger Specific Fields */}
              {formData.productType === 'ev_charger' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="powerKw">Power (kW)</Label>
                      <Input
                        id="powerKw"
                        type="number"
                        step="0.1"
                        value={formData.powerKw || ''}
                        onChange={(e) => updateFormData('powerKw', parseFloat(e.target.value))}
                        placeholder="7.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cableType">Cable Type</Label>
                      <Input
                        id="cableType"
                        value={formData.cableType || ''}
                        onChange={(e) => updateFormData('cableType', e.target.value)}
                        placeholder="Tethered"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cableLength">Cable Length (m)</Label>
                      <Input
                        id="cableLength"
                        type="number"
                        value={formData.cableLength || ''}
                        onChange={(e) => updateFormData('cableLength', parseFloat(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="installedPrice">Installed Price ($)</Label>
                    <Input
                      id="installedPrice"
                      type="number"
                      value={formData.installedPrice || ''}
                      onChange={(e) => updateFormData('installedPrice', parseFloat(e.target.value))}
                      placeholder="1790"
                    />
                  </div>
                </>
              )}

              {/* Common Field: Warranty */}
              <div>
                <Label htmlFor="warrantyYears">Warranty (Years)</Label>
                <Input
                  id="warrantyYears"
                  type="number"
                  value={formData.warrantyYears || ''}
                  onChange={(e) => updateFormData('warrantyYears', parseInt(e.target.value))}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-outfit text-2xl font-semibold text-foreground">
                Review & Confirm
              </h3>
              <p className="text-muted-foreground font-inter">
                Please review the product details before adding
              </p>
            </div>

            <div className="mt-8 bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phase:</span>
                <span className="font-semibold">{formData.phase?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Type:</span>
                <span className="font-semibold">{formData.productType?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-semibold">{formData.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-semibold">{formData.model}</span>
              </div>

              {formData.productType === 'solar' && (
                <>
                  {formData.sizeKw && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">System Size:</span>
                      <span className="font-semibold">{formData.sizeKw} kW</span>
                    </div>
                  )}
                  {formData.priceAfterRebate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {formData.productType === 'battery' && (
                <>
                  {formData.capacityKwh && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-semibold">{formData.capacityKwh} kWh</span>
                    </div>
                  )}
                  {formData.priceAfterRebate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {formData.productType === 'ev_charger' && (
                <>
                  {formData.powerKw && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power:</span>
                      <span className="font-semibold">{formData.powerKw} kW</span>
                    </div>
                  )}
                  {formData.installedPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installed Price:</span>
                      <span className="font-semibold text-primary">${formData.installedPrice.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : resetForm()}
            disabled={addProductMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={addProductMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {addProductMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
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
