import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PropertyDetailsProps {
  data: {
    systems?: string[];
    powerSupply?: string;
    solarPackage?: string;
    batterySystem?: string;
    evCharger?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    additionalInfo?: string;
  };
  onUpdate: (updates: any) => void;
  onSubmit: (finalData: any) => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export default function PropertyDetails({
  data,
  onUpdate,
  onSubmit,
  onPrev,
  isSubmitting = false,
}: PropertyDetailsProps) {
  const [fileName, setFileName] = useState<string>("");
  const [switchboardPhoto, setSwitchboardPhoto] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      setSwitchboardPhoto(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...data,
      switchboardPhoto,
    };
    
    onSubmit(finalData);
  };

  const isValid = data.firstName && data.lastName && data.email && data.address && data.suburb && data.postcode;

  return (
    <div className="p-4 sm:p-6 md:p-8" data-testid="property-details">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center">
          Property Details
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 px-4">
          Help us provide an accurate quote by sharing your property information.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          {/* Contact Information */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Information
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name" className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </Label>
                  <Input
                    type="text"
                    id="first-name"
                    value={data.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    data-testid="input-first-name"
                    className="w-full h-12 text-base"
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name" className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </Label>
                  <Input
                    type="text"
                    id="last-name"
                    value={data.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    data-testid="input-last-name"
                    className="w-full h-12 text-base"
                    placeholder="Smith"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={data.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="your@email.com"
                    data-testid="input-email"
                    className="w-full h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={data.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(04) 1234 5678"
                    data-testid="input-phone"
                    className="w-full h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Installation Address
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                  Street Address *
                </Label>
                <Input
                  type="text"
                  id="address"
                  value={data.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  placeholder="123 Example Street"
                  data-testid="input-address"
                  className="w-full h-12 text-base"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="suburb" className="block text-sm font-medium text-foreground mb-2">
                    Suburb *
                  </Label>
                  <Input
                    type="text"
                    id="suburb"
                    value={data.suburb || ''}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    required
                    placeholder="Perth"
                    data-testid="input-suburb"
                    className="w-full h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                    State
                  </Label>
                  <Select value={data.state || 'WA'} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="h-12" data-testid="select-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WA">Western Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div>
                <Label htmlFor="postcode" className="block text-sm font-medium text-foreground mb-2">
                  Postcode *
                </Label>
                <Input
                  type="text"
                  id="postcode"
                  value={data.postcode || ''}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  required
                  placeholder="6000"
                  data-testid="input-postcode"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Switchboard Photo Upload */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Switchboard Photo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please upload a clear photo of your main switchboard including the electricity meter to help us provide an accurate quote.
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-muted-foreground text-xl">☁️</span>
            </div>
            {fileName ? (
              <p className="text-sm text-foreground mb-2">File selected: {fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">Drop your files here or click to browse</p>
            )}
            <input
              type="file"
              id="switchboard-photo"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-switchboard-photo"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('switchboard-photo')?.click()}
              data-testid="button-choose-files"
            >
              Choose Files
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
          <Textarea
            id="additional-info"
            value={data.additionalInfo || ''}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            rows={4}
            placeholder="Any special requirements, questions, or additional information you'd like us to consider..."
            data-testid="textarea-additional-info"
            className="w-full"
          />
        </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={onPrev}
              data-testid="button-back"
              className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto min-h-[56px] touch-manipulation shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back
              </span>
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              data-testid="button-generate-quote"
              className={cn(
                "group relative bg-primary hover:bg-primary/90 text-black px-10 py-4 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto min-h-[56px] touch-manipulation shadow-xl",
                "hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-xl"
              )}
            >
              <span className="flex items-center justify-center">
                <span className="mr-3">
                  {isSubmitting ? "Generating Quote..." : "Generate Quoterrrrrr"}
                </span>
                {!isSubmitting && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {isSubmitting && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </span>
              
              {/* Shine effect on hover */}
              {!isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 rounded-xl"></div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
