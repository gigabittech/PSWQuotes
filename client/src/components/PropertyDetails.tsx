import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyDetailsProps {
  formData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    additionalInfo: string;
  };
  onFormDataChange: (data: any) => void;
  onFileChange: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PropertyDetails({
  formData,
  onFormDataChange,
  onFileChange,
  onNext,
  onBack,
}: PropertyDetailsProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="p-8" data-testid="property-details">
      <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
        Property Details
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Help us provide an accurate quote by sharing your property information.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-name" className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </Label>
              <Input
                type="text"
                id="customer-name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
                data-testid="input-customer-name"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="your@email.com"
                data-testid="input-email"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number
          </Label>
          <Input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(04) 1234 5678"
            data-testid="input-phone"
            className="w-full"
          />
        </div>

        {/* Property Address */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Installation Address</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                Street Address *
              </Label>
              <Input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                placeholder="123 Example Street"
                data-testid="input-address"
                className="w-full"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="suburb" className="block text-sm font-medium text-foreground mb-2">
                  Suburb *
                </Label>
                <Input
                  type="text"
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => handleInputChange('suburb', e.target.value)}
                  required
                  placeholder="Perth"
                  data-testid="input-suburb"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                  State
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger data-testid="select-state">
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
                  value={formData.postcode}
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
              <i className="fas fa-cloud-upload-alt text-muted-foreground text-xl"></i>
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
            value={formData.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            rows={4}
            placeholder="Any special requirements, questions, or additional information you'd like us to consider..."
            data-testid="textarea-additional-info"
            className="w-full"
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            data-testid="button-back"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-700"
            data-testid="button-generate-quote"
          >
            Generate Quote
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </form>
    </div>
  );
}
