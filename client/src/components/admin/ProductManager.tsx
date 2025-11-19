import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  rrp?: number;
  // Battery specific
  capacityKwh?: number;
  powerKw?: number;
  // EV Charger specific
  cableType?: string;
  cableLength?: number;
  installedPrice?: number;
  // Common
  warrantyYears?: number;
  // For editing
  id?: string;
  brandKey?: string;
  packageIndex?: number;
  optionIndex?: number;
}

interface Product {
  id: string;
  phase: string;
  productType: string;
  brand: string;
  model: string;
  sizeKw?: number;
  panels?: number;
  wattage?: number;
  priceAfterRebate?: number;
  capacityKwh?: number;
  rrp?: number;
  powerKw?: number;
  cableType?: string;
  cableLength?: number;
  installedPrice?: number;
  warrantyYears?: number;
  brandKey: string;
  packageIndex?: number;
  optionIndex?: number;
}

export default function ProductManager() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatDisplayText = (value?: string | number | null) => {
    if (value === undefined || value === null) return '';
    const str = value.toString().trim();
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteProductParams, setDeleteProductParams] = useState<{ phase: string; productType: string; brandKey: string; index: number } | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    phase: '',
    productType: '',
    brand: '',
    model: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    enabled: view === 'list',
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
      setView('list');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const response = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
      setView('list');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async ({ id, phase, productType, brandKey, index }: { id: string; phase: string; productType: string; brandKey: string; index: number }) => {
      const response = await apiRequest('DELETE', `/api/admin/products/${id}?phase=${phase}&productType=${productType}&brandKey=${brandKey}&index=${index}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDeleteProductId(null);
      setDeleteProductParams(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
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
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setView('form');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      phase: product.phase as Phase,
      productType: product.productType as ProductType,
      brand: product.brand,
      model: product.model,
      sizeKw: product.sizeKw,
      panels: product.panels,
      wattage: product.wattage,
      priceAfterRebate: product.priceAfterRebate,
      rrp: product.rrp,
      capacityKwh: product.capacityKwh,
      powerKw: product.powerKw,
      cableType: product.cableType,
      cableLength: product.cableLength,
      installedPrice: product.installedPrice,
      warrantyYears: product.warrantyYears,
      id: product.id,
      brandKey: product.brandKey,
      packageIndex: product.packageIndex,
      optionIndex: product.optionIndex,
    });
    setView('form');
    setStep(1);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProductId(product.id);
    const index = product.productType === 'solar' ? product.packageIndex! : product.optionIndex!;
    setDeleteProductParams({
      phase: product.phase,
      productType: product.productType,
      brandKey: product.brandKey,
      index: index,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteProductId && deleteProductParams) {
      deleteProductMutation.mutate({
        id: deleteProductId,
        ...deleteProductParams,
      });
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If product type is changing, clear type-specific fields
      if (field === 'productType' && prev.productType !== value) {
        // Clear solar-specific fields
        updated.sizeKw = undefined;
        updated.panels = undefined;
        updated.wattage = undefined;
        // Clear battery-specific fields
        updated.capacityKwh = undefined;
        // Clear EV charger-specific fields
        updated.cableType = undefined;
        updated.cableLength = undefined;
        updated.installedPrice = undefined;
        // Keep common fields like brand, model, rrp, warrantyYears
      }
      
      return updated;
    });
  };

  const canProceed = () => {
    if (step === 1) return formData.phase !== '';
    if (step === 2) return formData.productType !== '';
    if (step === 3) return formData.brand !== '' && formData.model !== '';
    return true;
  };

  const handleSubmit = () => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      addProductMutation.mutate(formData);
    }
  };

  const getProductDisplayName = (product: Product) => {
    if (product.productType === 'solar') {
      return `${product.sizeKw}kW ${product.brand} Solar System`;
    } else if (product.productType === 'battery') {
      return `${product.capacityKwh}kWh ${product.brand} Battery`;
    } else if (product.productType === 'ev_charger') {
      return `${product.powerKw}kW ${product.brand} EV Charger`;
    }
    return `${product.brand} ${product.model}`;
  };

  const getProductPrice = (product: Product) => {
    if (product.productType === 'solar' || product.productType === 'battery') {
      return product.priceAfterRebate;
    } else if (product.productType === 'ev_charger') {
      return product.installedPrice;
    }
    return 0;
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const paginatedProducts = products.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 sm:gap-3">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-muted-foreground mt-2 font-inter">
                {editingProduct ? 'Update product details' : 'Add new products to your pricing database with an easy step-by-step process'}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setView('list');
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="w-full flex-shrink-0 mb-4">
          <div className="relative flex items-center justify-between max-w-4xl mx-auto">
            {/* Connecting Lines */}
            <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-6 pointer-events-none">
              {[1, 2, 3].map((lineIdx) => (
                <div
                  key={lineIdx}
                  className={cn(
                    "h-0.5 flex-1 transition-all",
                    lineIdx < step ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
            
            {/* Step Circles and Labels */}
            {[
              { num: 1, label: 'Phase' },
              { num: 2, label: 'Product Type' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Review' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all border-2",
                    s.num === step
                      ? "bg-primary text-black border-primary shadow-lg scale-110"
                      : s.num < step
                      ? "bg-primary text-black border-primary"
                      : "bg-white dark:bg-gray-800 text-muted-foreground border-gray-300 dark:border-gray-600"
                  )}
                >
                  {s.num < step ? <Check className="w-6 h-6 text-black" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium text-center whitespace-nowrap",
                  s.num === step ? "text-primary" : s.num < step ? "text-primary" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass-form-card p-4 sm:p-6 w-full flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto">
            {/* Step 1: Phase Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-outfit text-2xl font-semibold text-foreground">
                    Select Phase Type
                  </h3>
                  <p className="text-muted-foreground font-inter">
                    Choose the electrical phase for this product
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                  {[
                    { id: 'single_phase' as Phase, title: 'Single Phase', desc: 'Most residential properties' },
                    { id: 'three_phase' as Phase, title: 'Three Phase', desc: 'Commercial & larger properties' },
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => updateFormData('phase', option.id)}
                      className={cn(
                        "relative p-6 rounded-xl cursor-pointer transition-all duration-200 border-2",
                        "hover:border-primary hover:bg-primary/10",
                        formData.phase === option.id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 dark:border-gray-700 bg-card"
                      )}
                    >
                      {formData.phase === option.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <h4 className="font-semibold text-lg mb-2">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Product Type Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-outfit text-2xl font-semibold text-foreground">
                    Select Product Type
                  </h3>
                  <p className="text-muted-foreground font-inter">
                    What type of product are you adding?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                  {[
                    { id: 'solar' as ProductType, title: 'Solar Panels', icon: '☀️' },
                    { id: 'battery' as ProductType, title: 'Battery Storage', icon: '🔋' },
                    { id: 'ev_charger' as ProductType, title: 'EV Charger', icon: '⚡' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateFormData('productType', option.id);
                      }}
                      className={cn(
                        "relative p-6 rounded-xl cursor-pointer transition-all duration-200 border-2 select-none w-full text-left",
                        "hover:border-primary hover:bg-primary/10 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        formData.productType === option.id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 dark:border-gray-700 bg-card"
                      )}
                    >
                      {formData.productType === option.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <div className="text-4xl mb-3">{option.icon}</div>
                      <h4 className="font-semibold text-lg">{option.title}</h4>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Product Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-outfit text-2xl font-semibold text-foreground">
                    Product Details
                  </h3>
                  <p className="text-muted-foreground font-inter">
                    Enter the specifications for this {formData.productType?.replace('_', ' ')}
                  </p>
                </div>

                <div className="space-y-4 mt-4">
                  {/* Common Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="rrp">RRP ($)</Label>
                      <Input
                        id="rrp"
                        type="number"
                        value={formData.rrp || ''}
                        onChange={(e) => updateFormData('rrp', parseFloat(e.target.value))}
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </>
              )}

                  {/* Battery Specific Fields */}
                  {formData.productType === 'battery' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                </>
              )}

                  {/* EV Charger Specific Fields */}
                  {formData.productType === 'ev_charger' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="rrp">RRP ($)</Label>
                      <Input
                        id="rrp"
                        type="number"
                        value={formData.rrp || ''}
                        onChange={(e) => updateFormData('rrp', parseFloat(e.target.value))}
                        placeholder="2500"
                      />
                    </div>
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
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-outfit text-2xl font-semibold text-foreground">
                    Review & Confirm
                  </h3>
                  <p className="text-muted-foreground font-inter">
                    Please review the product details before {editingProduct ? 'updating' : 'adding'}
                  </p>
                </div>

                <div className="mt-4 bg-muted/50 rounded-lg p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase:</span>
                    <span className="font-semibold">
                      {formatDisplayText(formData.phase?.replace(/_/g, ' '))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Type:</span>
                    <span className="font-semibold">
                      {formatDisplayText(formData.productType?.replace(/_/g, ' '))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-semibold">
                      {formatDisplayText(formData.brand)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-semibold">
                      {formatDisplayText(formData.model)}
                    </span>
                  </div>

                  {formData.productType === 'solar' && (
                    <>
                      {formData.sizeKw && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">System Size:</span>
                          <span className="font-semibold">
                            {formatDisplayText(formData.sizeKw)} kW
                          </span>
                        </div>
                      )}
                  {formData.priceAfterRebate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price After Rebate:</span>
                      <span className="font-semibold text-primary">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.rrp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RRP:</span>
                      <span className="font-semibold">${formData.rrp.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {formData.productType === 'battery' && (
                <>
                  {formData.capacityKwh && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                          <span className="font-semibold">
                            {formatDisplayText(formData.capacityKwh)} kWh
                          </span>
                    </div>
                  )}
                  {formData.priceAfterRebate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price After Rebate:</span>
                      <span className="font-semibold text-primary">${formData.priceAfterRebate.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.rrp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RRP:</span>
                      <span className="font-semibold">${formData.rrp.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {formData.productType === 'ev_charger' && (
                <>
                  {formData.powerKw && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power:</span>
                          <span className="font-semibold">
                            {formatDisplayText(formData.powerKw)} kW
                          </span>
                    </div>
                  )}
                  {formData.installedPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installed Price:</span>
                      <span className="font-semibold text-primary">${formData.installedPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.rrp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RRP:</span>
                      <span className="font-semibold">${formData.rrp.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t flex-shrink-0">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setView('list');
                }}
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
                className="gap-2 text-muted-foreground hover:text-foreground"
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
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
                size="lg"
                className="gap-2 bg-[#f7c917] text-black hover:bg-[#e6b800]"
              >
                {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {editingProduct ? 'Updating Product...' : 'Adding Product...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 sm:gap-3">
              Product Management
            </h2>
            <p className="text-muted-foreground mt-2 font-inter">
              Manage all products in your pricing database
            </p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
              <Button onClick={handleAddProduct} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-semibold">Product</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Phase</th>
                    <th className="text-left p-4 font-semibold">Brand</th>
                    <th className="text-left p-4 font-semibold">Model</th>
                    <th className="text-left p-4 font-semibold">Price</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className="font-medium">{getProductDisplayName(product)}</div>
                        {product.productType === 'solar' && (
                          <div className="text-sm text-muted-foreground">
                            {product.panels} × {product.wattage}W panels
                          </div>
                        )}
                        {product.productType === 'battery' && (
                          <div className="text-sm text-muted-foreground">
                            {product.capacityKwh}kWh / {product.powerKw}kW
                          </div>
                        )}
                        {product.productType === 'ev_charger' && (
                          <div className="text-sm text-muted-foreground">
                            {product.cableType} {product.cableLength}m
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{product.productType.replace('_', ' ')}</span>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{product.phase.replace('_', ' ')}</span>
                      </td>
                      <td className="p-4">{product.brand}</td>
                      <td className="p-4">{product.model}</td>
                      <td className="p-4">
                        <span className="font-semibold text-primary">
                          ${getProductPrice(product)?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {totalProducts > 0 && (
          <div className="border-t px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {endIndex} of {totalProducts} products
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Per Page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-24 h-8 rounded-md">
                    <SelectValue placeholder="Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-md hidden sm:flex"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-md"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1 sm:hidden">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 rounded-md ${
                        currentPage === pageNum ? "bg-[#f7c917] text-black" : ""
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 rounded-md ${
                        currentPage === pageNum ? "bg-[#f7c917] text-black" : ""
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-md"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-md hidden sm:flex"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your pricing database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
