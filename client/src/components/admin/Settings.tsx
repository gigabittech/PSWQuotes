import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, AlertCircle, CheckCircle2, Building, Mail, Calculator, FileText, Shield, Database, BarChart3, Link, Bell, FileCheck, Wrench, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Setting } from '@shared/schema';

interface SettingValue {
  type: 'text' | 'number' | 'boolean' | 'email' | 'url' | 'password' | 'textarea' | 'select';
  value: any;
  options?: string[];
  description?: string;
  sensitive?: boolean;
}

const settingsConfig: Record<string, {
  title: string;
  description: string;
  icon: any;
  sections: Record<string, {
    title: string;
    settings: Record<string, SettingValue>;
  }>;
}> = {
  business: {
    title: "Business Profile",
    description: "Basic company information and contact details",
    icon: Building,
    sections: {
      company: {
        title: "Company Information",
        settings: {
          'business.company_name': { type: 'text', value: '', description: 'Your company name' },
          'business.company_email': { type: 'email', value: '', description: 'Main business email address' },
          'business.company_phone': { type: 'text', value: '', description: 'Main phone number' },
          'business.company_address': { type: 'textarea', value: '', description: 'Full business address' },
          'business.abn': { type: 'text', value: '', description: 'Australian Business Number' },
          'business.timezone': { 
            type: 'select', 
            value: 'Australia/Perth', 
            options: ['Australia/Perth', 'Australia/Sydney', 'Australia/Melbourne'],
            description: 'Business timezone' 
          },
        }
      }
    }
  },
  email: {
    title: "Email Settings",
    description: "Configure email service and notification preferences",
    icon: Mail,
    sections: {
      provider: {
        title: "Email Provider",
        settings: {
          'email.provider': { 
            type: 'select', 
            value: 'brevo', 
            options: ['brevo', 'sendgrid', 'smtp'],
            description: 'Email service provider' 
          },
          'email.brevo_api_key': { type: 'password', value: '', description: 'Brevo API key', sensitive: true },
          'email.from_email': { type: 'email', value: '', description: 'Default sender email' },
          'email.from_name': { type: 'text', value: '', description: 'Default sender name' },
        }
      },
      notifications: {
        title: "Email Notifications",
        settings: {
          'email.quote_notifications': { type: 'boolean', value: true, description: 'Send email when new quotes are submitted' },
          'email.admin_notifications': { type: 'boolean', value: true, description: 'Send admin notification emails' },
          'email.customer_auto_response': { type: 'boolean', value: true, description: 'Send automatic responses to customers' },
        }
      }
    }
  },
  pricing: {
    title: "Quotes & Pricing",
    description: "Configure pricing rules and quote settings",
    icon: Calculator,
    sections: {
      rebates: {
        title: "Government Rebates",
        settings: {
          'pricing.federal_rebate_enabled': { type: 'boolean', value: true, description: 'Enable federal solar rebate calculations' },
          'pricing.federal_rebate_amount': { type: 'number', value: 400, description: 'Federal rebate amount per kW' },
          'pricing.state_rebate_enabled': { type: 'boolean', value: true, description: 'Enable state solar rebate' },
          'pricing.state_rebate_amount': { type: 'number', value: 2500, description: 'Fixed state rebate amount' },
        }
      },
      margins: {
        title: "Pricing & Margins",
        settings: {
          'pricing.default_margin': { type: 'number', value: 0.2, description: 'Default profit margin (0.2 = 20%)' },
          'pricing.battery_margin': { type: 'number', value: 0.15, description: 'Battery system margin' },
          'pricing.ev_margin': { type: 'number', value: 0.18, description: 'EV charger margin' },
          'pricing.installation_rate': { type: 'number', value: 150, description: 'Installation rate per hour' },
        }
      }
    }
  },
  pdf: {
    title: "PDF & Branding",
    description: "Customize PDF quotes and company branding",
    icon: FileText,
    sections: {
      branding: {
        title: "Company Branding",
        settings: {
          'pdf.company_logo_url': { type: 'url', value: '', description: 'Company logo URL for PDFs' },
          'pdf.company_colors': { type: 'text', value: '#1f2937,#3b82f6', description: 'Primary,Secondary colors (hex)' },
          'pdf.watermark_text': { type: 'text', value: '', description: 'Optional watermark text' },
        }
      },
      content: {
        title: "PDF Content",
        settings: {
          'pdf.footer_text': { type: 'textarea', value: '', description: 'Footer text on PDF quotes' },
          'pdf.terms_conditions': { type: 'textarea', value: '', description: 'Terms and conditions text' },
          'pdf.warranty_info': { type: 'textarea', value: '', description: 'Warranty information' },
        }
      }
    }
  }
};

export function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('business');
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/settings');
      return response.json();
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (changes: Record<string, any>) => {
      const promises = Object.entries(changes).map(([key, value]) => {
        return apiRequest('PUT', `/api/settings/${key}`, { value }).then(res => res.json());
      });
      await Promise.all(promises);
      return changes;
    },
    onSuccess: (changes) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setUnsavedChanges({});
      toast({
        title: "Settings Saved",
        description: `Successfully saved ${Object.keys(changes).length} setting(s)`,
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to save settings";
      try {
        if (error?.message) {
          const match = error.message.match(/\d+:\s*({.*})/);
          if (match) {
            const errorData = JSON.parse(match[1]);
            errorMessage = errorData.error || errorMessage;
          } else {
            errorMessage = error.message;
          }
        }
      } catch {
        errorMessage = error?.message || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const getSettingValue = (key: string, defaultValue: any = ''): any => {
    // Check if there's an unsaved change first
    if (key in unsavedChanges) {
      return unsavedChanges[key];
    }
    const setting = settings.find(s => s.key === key);
    return setting?.value ?? defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    // Prevent saving [REDACTED] as a value
    if (value === '[REDACTED]') {
      toast({
        title: "Invalid Value",
        description: "Cannot save redacted value. Please enter a new value.",
        variant: "destructive",
      });
      return;
    }

    // For sensitive fields, if the current value is redacted and new value is empty, don't update
    const config = Object.values(settingsConfig)
      .flatMap(c => Object.values(c.sections))
      .flatMap(s => Object.entries(s.settings))
      .find(([k]) => k === key)?.[1];
    
    if (config?.sensitive) {
      const currentValue = getSettingValue(key);
      if (currentValue === '[REDACTED]' && (!value || value === '')) {
        toast({
          title: "Cannot Clear",
          description: "Cannot clear sensitive field. Enter a new value to update.",
          variant: "destructive",
        });
        return;
      }
    }

    // Get the original value from database
    const originalValue = settings.find(s => s.key === key)?.value ?? 
      Object.values(settingsConfig)
        .flatMap(c => Object.values(c.sections))
        .flatMap(s => Object.entries(s.settings))
        .find(([k]) => k === key)?.[1]?.value ?? '';

    // Only add to unsaved changes if it's different from original
    if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
      setUnsavedChanges(prev => ({ ...prev, [key]: value }));
    } else {
      // Remove from unsaved changes if it matches original
      setUnsavedChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[key];
        return newChanges;
      });
    }
  };

  const handleSave = () => {
    if (Object.keys(unsavedChanges).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes to save",
      });
      return;
    }
    saveSettingsMutation.mutate(unsavedChanges);
  };

  const handleReset = () => {
    setUnsavedChanges({});
    toast({
      title: "Changes Reset",
      description: "All unsaved changes have been discarded",
    });
  };

  const toggleSecretVisibility = (key: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleSecrets(newVisible);
  };

  const renderActionButtons = () => (
    <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-2 sm:gap-3 pt-4">
      {Object.keys(unsavedChanges).length > 0 && (
        <Button 
          variant="outline" 
          onClick={handleReset} 
          disabled={saveSettingsMutation.isPending}
          size="sm"
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
      )}
      <Button 
        onClick={handleSave} 
        disabled={saveSettingsMutation.isPending || Object.keys(unsavedChanges).length === 0} 
        className="gap-2 w-full sm:w-auto"
        size="sm"
      >
        {saveSettingsMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );

  const renderSettingField = (key: string, config: SettingValue) => {
    const currentValue = getSettingValue(key, config.value);
    const isRedacted = config.sensitive && currentValue === '[REDACTED]';
    const showValue = !config.sensitive || visibleSecrets.has(key) || !isRedacted;

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {config.sensitive && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Sensitive
              </Badge>
            )}
          </label>
          {config.sensitive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleSecretVisibility(key)}
              data-testid={`button-toggle-visibility-${key}`}
            >
              {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        {config.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        )}

        {config.type === 'boolean' ? (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(currentValue)}
              onCheckedChange={(checked) => handleSettingChange(key, checked)}
              data-testid={`switch-${key}`}
            />
            <span className="text-sm">{currentValue ? 'Enabled' : 'Disabled'}</span>
          </div>
        ) : config.type === 'select' ? (
          <Select 
            value={currentValue || config.value} 
            onValueChange={(value) => handleSettingChange(key, value)}
          >
            <SelectTrigger data-testid={`select-${key}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : config.type === 'textarea' ? (
          <Textarea
            value={showValue ? currentValue : ''}
            placeholder={isRedacted ? '[REDACTED]' : ''}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="min-h-[80px]"
            data-testid={`textarea-${key}`}
          />
        ) : (
          <Input
            type={config.type === 'password' && showValue ? 'text' : config.type}
            value={showValue ? currentValue : ''}
            placeholder={isRedacted ? '[REDACTED]' : ''}
            onChange={(e) => {
              const value = config.type === 'number' ? Number(e.target.value) : e.target.value;
              handleSettingChange(key, value);
            }}
            data-testid={`input-${key}`}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-6 md:mb-8 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your application settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(unsavedChanges).length > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              {Object.keys(unsavedChanges).length} unsaved change(s)
            </Badge>
          )}
          {saveSettingsMutation.isPending && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex w-full h-10 items-center justify-center bg-transparent p-0 gap-2 rounded-none border-0 flex-wrap sm:flex-nowrap flex-shrink-0">
          {Object.entries(settingsConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger 
                key={key} 
                value={key} 
                className={cn(
                  "h-10 flex-1 text-xs sm:text-sm font-medium transition-all border-0",
                  "rounded-md flex items-center justify-center space-x-2",
                  "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-none",
                  "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700"
                )}
                data-testid={`tab-${key}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(settingsConfig).map(([tabKey, tabConfig]) => (
          <TabsContent key={tabKey} value={tabKey} className="flex-1 overflow-y-auto min-h-0 space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <tabConfig.icon className="h-5 w-5" />
                  <span>{tabConfig.title}</span>
                </CardTitle>
                <CardDescription>{tabConfig.description}</CardDescription>
              </CardHeader>
            </Card>

            {Object.entries(tabConfig.sections).map(([sectionKey, section]) => (
              <Card key={sectionKey} className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(section.settings).map(([settingKey, settingConfig]) =>
                renderSettingField(settingKey, settingConfig)
              )}
            </CardContent>
              </Card>
            ))}
        {renderActionButtons()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}