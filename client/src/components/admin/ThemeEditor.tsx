import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Palette, Save, Eye, Upload, RefreshCw } from "lucide-react";
import type { CmsTheme } from "@shared/schema";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-1 rounded border cursor-pointer"
          data-testid={`color-picker-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
          data-testid={`color-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    </div>
  );
}

export default function ThemeEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("colors");

  const { data: theme, isLoading } = useQuery<CmsTheme>({
    queryKey: ['/api/cms/theme/admin'],
  });

  const [formData, setFormData] = useState({
    siteName: (theme?.header as any)?.siteName || "Perth Solar Warehouse",
    logoUrl: (theme?.header as any)?.logoUrl || "",
    faviconUrl: (theme?.header as any)?.faviconUrl || "",
    primaryColor: (theme?.colors as any)?.primaryColor || "#007bff",
    secondaryColor: (theme?.colors as any)?.secondaryColor || "#6c757d",
    accentColor: (theme?.colors as any)?.accentColor || "#28a745",
    backgroundColor: (theme?.colors as any)?.backgroundColor || "#ffffff",
    textColor: (theme?.colors as any)?.textColor || "#212529",
    headingFont: (theme?.typography as any)?.headingFont || "Inter",
    bodyFont: (theme?.typography as any)?.bodyFont || "Inter",
    customCss: (theme?.typography as any)?.customCss || "",
    headerContent: (theme?.header as any)?.content || "",
    footerContent: (theme?.footer as any)?.content || "",
    status: theme?.status || "draft"
  });

  // Update form data when theme data loads
  useEffect(() => {
    if (theme) {
      const headerData = theme.header as { siteName?: string; logoUrl?: string; faviconUrl?: string; content?: string } | null;
      const colorsData = theme.colors as { primaryColor?: string; secondaryColor?: string; accentColor?: string; backgroundColor?: string; textColor?: string } | null;
      const typographyData = theme.typography as { headingFont?: string; bodyFont?: string; customCss?: string } | null;
      const footerData = theme.footer as { content?: string } | null;
      
      setFormData({
        siteName: headerData?.siteName || "Perth Solar Warehouse",
        logoUrl: headerData?.logoUrl || "",
        faviconUrl: headerData?.faviconUrl || "",
        primaryColor: colorsData?.primaryColor || "#007bff",
        secondaryColor: colorsData?.secondaryColor || "#6c757d",
        accentColor: colorsData?.accentColor || "#28a745",
        backgroundColor: colorsData?.backgroundColor || "#ffffff",
        textColor: colorsData?.textColor || "#212529",
        headingFont: typographyData?.headingFont || "Inter",
        bodyFont: typographyData?.bodyFont || "Inter",
        customCss: typographyData?.customCss || "",
        headerContent: headerData?.content || "",
        footerContent: footerData?.content || "",
        status: theme.status || "draft"
      });
    }
  }, [theme]);

  const saveThemeMutation = useMutation({
    mutationFn: async (themeData: typeof formData) => {
      // Transform flat form data to JSON structure expected by API
      const payload = {
        colors: {
          primaryColor: themeData.primaryColor,
          secondaryColor: themeData.secondaryColor,
          accentColor: themeData.accentColor,
          backgroundColor: themeData.backgroundColor,
          textColor: themeData.textColor,
        },
        typography: {
          headingFont: themeData.headingFont,
          bodyFont: themeData.bodyFont,
          customCss: themeData.customCss,
        },
        header: {
          siteName: themeData.siteName,
          logoUrl: themeData.logoUrl,
          faviconUrl: themeData.faviconUrl,
          content: themeData.headerContent,
        },
        footer: {
          content: themeData.footerContent,
        },
        status: themeData.status,
      };
      const response = await apiRequest('PUT', '/api/cms/theme', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Theme saved",
        description: "Your theme changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/theme/admin'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save theme changes.",
        variant: "destructive",
      });
    },
  });

  const publishThemeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cms/theme/publish', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Theme published",
        description: "Your theme is now live on the website.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/theme/admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/theme'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish theme.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    saveThemeMutation.mutate(formData);
  };

  const handlePublish = () => {
    // Save first, then publish
    saveThemeMutation.mutate(formData, {
      onSuccess: () => {
        publishThemeMutation.mutate();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="theme-editor-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="theme-editor">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Theme Editor</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Customize your website's appearance and branding
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={theme?.status === "published" ? "default" : "secondary"}>
            {theme?.status || "draft"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="colors" data-testid="tab-colors" className="text-xs sm:text-sm">Colors</TabsTrigger>
          <TabsTrigger value="branding" data-testid="tab-branding" className="text-xs sm:text-sm">Branding</TabsTrigger>
          <TabsTrigger value="typography" data-testid="tab-typography" className="text-xs sm:text-sm">Typography</TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content" className="text-xs sm:text-sm">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={formData.primaryColor}
                  onChange={(value) => handleInputChange("primaryColor", value)}
                  description="Main brand color for buttons and highlights"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={formData.secondaryColor}
                  onChange={(value) => handleInputChange("secondaryColor", value)}
                  description="Supporting color for UI elements"
                />
                <ColorPicker
                  label="Accent Color"
                  value={formData.accentColor}
                  onChange={(value) => handleInputChange("accentColor", value)}
                  description="Color for success states and CTAs"
                />
                <ColorPicker
                  label="Background Color"
                  value={formData.backgroundColor}
                  onChange={(value) => handleInputChange("backgroundColor", value)}
                  description="Main background color"
                />
                <div className="sm:col-span-2">
                  <ColorPicker
                    label="Text Color"
                    value={formData.textColor}
                    onChange={(value) => handleInputChange("textColor", value)}
                    description="Primary text color"
                  />
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="mt-6 p-4 border rounded-lg bg-muted">
                <h4 className="font-medium mb-3">Color Preview</h4>
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                    border: `1px solid ${formData.secondaryColor}`
                  }}
                >
                  <h3 style={{ color: formData.primaryColor }} className="text-lg font-semibold mb-2">
                    Sample Heading
                  </h3>
                  <p className="mb-3">
                    This is how your text will appear with the current color scheme.
                  </p>
                  <Button 
                    style={{ 
                      backgroundColor: formData.primaryColor,
                      color: formData.backgroundColor 
                    }}
                    className="mr-2"
                  >
                    Primary Button
                  </Button>
                  <Button 
                    style={{ 
                      backgroundColor: formData.accentColor,
                      color: formData.backgroundColor 
                    }}
                  >
                    Accent Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                  placeholder="Your Company Name"
                  data-testid="input-site-name"
                />
              </div>
              
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  data-testid="input-logo-url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your logo to object storage and paste the URL here
                </p>
              </div>
              
              <div>
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  value={formData.faviconUrl}
                  onChange={(e) => handleInputChange("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  data-testid="input-favicon-url"
                />
              </div>

              {/* Logo Preview */}
              {formData.logoUrl && (
                <div className="mt-4 p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-3">Logo Preview</h4>
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="max-h-16 max-w-48 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="headingFont">Heading Font</Label>
                <Input
                  id="headingFont"
                  value={formData.headingFont}
                  onChange={(e) => handleInputChange("headingFont", e.target.value)}
                  placeholder="Inter, Arial, sans-serif"
                  data-testid="input-heading-font"
                />
              </div>
              
              <div>
                <Label htmlFor="bodyFont">Body Font</Label>
                <Input
                  id="bodyFont"
                  value={formData.bodyFont}
                  onChange={(e) => handleInputChange("bodyFont", e.target.value)}
                  placeholder="Inter, Arial, sans-serif"
                  data-testid="input-body-font"
                />
              </div>
              
              <div>
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={formData.customCss}
                  onChange={(e) => handleInputChange("customCss", e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="textarea-custom-css"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Advanced: Add custom CSS to override default styles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Header & Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="headerContent">Header Content</Label>
                <Textarea
                  id="headerContent"
                  value={formData.headerContent}
                  onChange={(e) => handleInputChange("headerContent", e.target.value)}
                  placeholder="Additional header content (HTML allowed)"
                  rows={4}
                  data-testid="textarea-header-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML content to display in the header area
                </p>
              </div>
              
              <div>
                <Label htmlFor="footerContent">Footer Content</Label>
                <Textarea
                  id="footerContent"
                  value={formData.footerContent}
                  onChange={(e) => handleInputChange("footerContent", e.target.value)}
                  placeholder="Footer content (HTML allowed)"
                  rows={6}
                  data-testid="textarea-footer-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML content to display in the footer area
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {theme?.status === "published" ? "Theme is currently live" : "Theme changes are saved as draft"}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveThemeMutation.isPending}
            data-testid="button-save-theme"
          >
            {saveThemeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saveThemeMutation.isPending || publishThemeMutation.isPending}
            data-testid="button-publish-theme"
          >
            {publishThemeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Publish Live
          </Button>
        </div>
      </div>
    </div>
  );
}