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
    <div 
      className="w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl md:rounded-[65px] overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12"
      data-testid="property-details"
      style={{
        background: 'linear-gradient(147.33deg, rgba(255, 255, 255, 0.35) 1.11%, rgba(234, 234, 234, 0.161) 50.87%, rgba(153, 153, 153, 0.0315) 106.32%)',
        border: '1px solid #DDE1E775',
        boxSizing: 'border-box'
      }}
    >
      <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4" style={{
          color: '#020817',
          marginTop: 0
        }}>
          Property Details
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-center max-w-2xl mx-auto mb-4 sm:mb-6" style={{
          color: '#787E86',
          margin: 0
        }}>
          Help us provide an accurate quote by sharing your property information.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
          {/* Contact Information */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
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
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
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
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
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
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                    State
                  </Label>
                  <Select value={data.state || 'WA'} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base" data-testid="select-state">
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
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Switchboard Photo Upload */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Switchboard Photo</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Please upload a clear photo of your main switchboard including the electricity meter to help us provide an accurate quote.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center">
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
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Additional Information</h3>
            <Textarea
              id="additional-info"
              value={data.additionalInfo || ''}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              rows={4}
              placeholder="Any special requirements, questions, or additional information you'd like us to consider..."
              data-testid="textarea-additional-info"
              className="w-full text-sm sm:text-base"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 w-full">
            <button
              type="button"
              onClick={onPrev}
              data-testid="button-back"
              className="w-full sm:w-auto min-w-[107px] h-11 sm:h-12 rounded-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 transition-all duration-300"
              style={{
                background: '#0B0E15',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <img 
                src="/attached_assets/BackArrow.png" 
                alt="Back" 
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
              />
              <span className="text-base sm:text-lg font-medium whitespace-nowrap" style={{
                color: '#E9BE18',
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500
              }}>
                Back
              </span>
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              data-testid="button-generate-quote"
              className="w-full sm:w-auto min-w-[200px] h-11 sm:h-12 rounded-full flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 transition-all duration-300"
              style={{
                background: '#F7C917',
                opacity: (!isValid || isSubmitting) ? 0.5 : 1,
                border: 'none',
                cursor: (!isValid || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              <span className="text-base sm:text-lg font-semibold whitespace-nowrap" style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                color: '#000000'
              }}>
                {isSubmitting ? "Generating Quote..." : "Generate Quote"}
              </span>
              {!isSubmitting && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: '#F7C917'
                }}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {isSubmitting && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
