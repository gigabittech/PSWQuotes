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
    <div className="space-y-1.5 sm:space-y-2">
      <Label className="text-sm sm:text-base font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 sm:w-12 sm:h-8 p-1 rounded border cursor-pointer flex-shrink-0"
          data-testid={`color-picker-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs sm:text-sm"
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
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-foreground mb-1 sm:mb-2">Theme Editor</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <p className="text-muted-foreground text-sm sm:text-base">
            Customize your website's appearance and branding
          </p>
          <Badge variant={theme?.status === "published" ? "default" : "secondary"} className="w-fit">
            {(theme?.status || "draft").charAt(0).toUpperCase() + (theme?.status || "draft").slice(1)}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
          <TabsTrigger value="colors" data-testid="tab-colors" className="text-xs sm:text-sm px-2 sm:px-4">Colors</TabsTrigger>
          <TabsTrigger value="branding" data-testid="tab-branding" className="text-xs sm:text-sm px-2 sm:px-4">Branding</TabsTrigger>
          <TabsTrigger value="typography" data-testid="tab-typography" className="text-xs sm:text-sm px-2 sm:px-4">Typography</TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content" className="text-xs sm:text-sm px-2 sm:px-4">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 border rounded-lg bg-muted">
                <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Color Preview</h4>
                <div 
                  className="p-3 sm:p-4 rounded-lg"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                    border: `1px solid ${formData.secondaryColor}`
                  }}
                >
                  <h3 style={{ color: formData.primaryColor }} className="text-base sm:text-lg font-semibold mb-2">
                    Sample Heading
                  </h3>
                  <p className="mb-3 text-sm sm:text-base">
                    This is how your text will appear with the current color scheme.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      style={{ 
                        backgroundColor: formData.primaryColor,
                        color: formData.backgroundColor 
                      }}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Primary Button
                    </Button>
                    <Button 
                      style={{ 
                        backgroundColor: formData.accentColor,
                        color: formData.backgroundColor 
                      }}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Accent Button
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Site Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div>
                <Label htmlFor="siteName" className="text-sm sm:text-base">Site Name</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                  placeholder="Your Company Name"
                  className="text-sm sm:text-base"
                  data-testid="input-site-name"
                />
              </div>
              
              <div>
                <Label htmlFor="logoUrl" className="text-sm sm:text-base">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="text-sm sm:text-base"
                  data-testid="input-logo-url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your logo to object storage and paste the URL here
                </p>
              </div>
              
              <div>
                <Label htmlFor="faviconUrl" className="text-sm sm:text-base">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  value={formData.faviconUrl}
                  onChange={(e) => handleInputChange("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="text-sm sm:text-base"
                  data-testid="input-favicon-url"
                />
              </div>

              {/* Logo Preview */}
              {formData.logoUrl && (
                <div className="mt-4 p-3 sm:p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Logo Preview</h4>
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="max-h-12 sm:max-h-16 max-w-full sm:max-w-48 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Typography Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div>
                <Label htmlFor="headingFont" className="text-sm sm:text-base">Heading Font</Label>
                <Input
                  id="headingFont"
                  value={formData.headingFont}
                  onChange={(e) => handleInputChange("headingFont", e.target.value)}
                  placeholder="Inter, Arial, sans-serif"
                  className="text-sm sm:text-base"
                  data-testid="input-heading-font"
                />
              </div>
              
              <div>
                <Label htmlFor="bodyFont" className="text-sm sm:text-base">Body Font</Label>
                <Input
                  id="bodyFont"
                  value={formData.bodyFont}
                  onChange={(e) => handleInputChange("bodyFont", e.target.value)}
                  placeholder="Inter, Arial, sans-serif"
                  className="text-sm sm:text-base"
                  data-testid="input-body-font"
                />
              </div>
              
              <div>
                <Label htmlFor="customCss" className="text-sm sm:text-base">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={formData.customCss}
                  onChange={(e) => handleInputChange("customCss", e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={8}
                  className="font-mono text-xs sm:text-sm"
                  data-testid="textarea-custom-css"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Advanced: Add custom CSS to override default styles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Header & Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div>
                <Label htmlFor="headerContent" className="text-sm sm:text-base">Header Content</Label>
                <Textarea
                  id="headerContent"
                  value={formData.headerContent}
                  onChange={(e) => handleInputChange("headerContent", e.target.value)}
                  placeholder="Additional header content (HTML allowed)"
                  rows={4}
                  className="text-sm sm:text-base"
                  data-testid="textarea-header-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML content to display in the header area
                </p>
              </div>
              
              <div>
                <Label htmlFor="footerContent" className="text-sm sm:text-base">Footer Content</Label>
                <Textarea
                  id="footerContent"
                  value={formData.footerContent}
                  onChange={(e) => handleInputChange("footerContent", e.target.value)}
                  placeholder="Footer content (HTML allowed)"
                  rows={6}
                  className="text-sm sm:text-base"
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

      <Separator className="my-4 sm:my-6" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {theme?.status === "published" ? "Theme is currently live" : "Theme changes are saved as draft"}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveThemeMutation.isPending}
            data-testid="button-save-theme"
            className="w-full sm:w-auto"
            size="sm"
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
            className="w-full sm:w-auto"
            size="sm"
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