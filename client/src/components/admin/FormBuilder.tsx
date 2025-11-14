import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
// Drag and drop functionality will be added later
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  Settings, 
  GripVertical,
  Type,
  Mail,
  Hash,
  CheckSquare,
  List,
  Calendar,
  FileText,
  Eye
} from "lucide-react";
import type { Form, FormField } from "@shared/schema";

interface FormFormData {
  key: string;
  title: string;
  settings: {
    submitAction: string;
    redirectUrl?: string;
    emailNotifications: boolean;
    notificationEmail?: string;
  };
  status: string;
}

interface FieldFormData {
  key: string;
  type: string;
  label: string;
  required: boolean;
  order: number;
  props: {
    placeholder?: string;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  };
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'select', label: 'Select Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'date', label: 'Date', icon: Calendar },
];

export default function FormBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  const [formData, setFormData] = useState<FormFormData>({
    key: "",
    title: "",
    settings: {
      submitAction: "email",
      emailNotifications: true,
    },
    status: "draft"
  });

  const [fieldData, setFieldData] = useState<FieldFormData>({
    key: "",
    type: "text",
    label: "",
    required: false,
    order: 0,
    props: {}
  });

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ['/api/cms/forms'],
  });

  const { data: formFields = [] } = useQuery<FormField[]>({
    queryKey: ['/api/cms/forms', selectedForm?.id, 'fields'],
    enabled: !!selectedForm,
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: FormFormData) => {
      const response = await apiRequest('POST', '/api/cms/forms', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form created",
        description: "New form has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms'] });
      resetFormData();
      setActiveTab("list");
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async ({ id, ...formData }: FormFormData & { id: string }) => {
      const response = await apiRequest('PUT', `/api/cms/forms/${id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form updated",
        description: "Form has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms'] });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cms/forms/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form deleted",
        description: "Form has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms'] });
      setSelectedForm(null);
      setActiveTab("list");
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: async (fieldData: FieldFormData & { formId: string }) => {
      const response = await apiRequest('POST', '/api/cms/form-fields', fieldData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field added",
        description: "Form field has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms', selectedForm?.id, 'fields'] });
      resetFieldData();
      setIsFieldDialogOpen(false);
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, ...fieldData }: FieldFormData & { id: string }) => {
      const response = await apiRequest('PUT', `/api/cms/form-fields/${id}`, fieldData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field updated",
        description: "Form field has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms', selectedForm?.id, 'fields'] });
      resetFieldData();
      setSelectedField(null);
      setIsFieldDialogOpen(false);
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cms/form-fields/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field deleted",
        description: "Form field has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/forms', selectedForm?.id, 'fields'] });
    },
  });

  const handleFormInputChange = (field: keyof FormFormData, value: any) => {
    if (field === 'settings') {
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, ...value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFieldInputChange = (field: keyof FieldFormData, value: any) => {
    if (field === 'props') {
      setFieldData(prev => ({
        ...prev,
        props: { ...prev.props, ...value }
      }));
    } else {
      setFieldData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const resetFormData = () => {
    setFormData({
      key: "",
      title: "",
      settings: {
        submitAction: "email",
        emailNotifications: true,
      },
      status: "draft"
    });
    setSelectedForm(null);
  };

  const resetFieldData = () => {
    setFieldData({
      key: "",
      type: "text",
      label: "",
      required: false,
      order: formFields.length,
      props: {}
    });
    setSelectedField(null);
  };

  const handleNewForm = () => {
    resetFormData();
    setActiveTab("editor");
  };

  const handleEditForm = (form: Form) => {
    const settings = form.settings as any;
    setFormData({
      key: form.key,
      title: form.title,
      settings: {
        submitAction: settings?.submitAction || "email",
        redirectUrl: settings?.redirectUrl,
        emailNotifications: settings?.emailNotifications !== false,
        notificationEmail: settings?.notificationEmail,
      },
      status: form.status
    });
    setSelectedForm(form);
    setActiveTab("editor");
  };

  const handleSaveForm = () => {
    if (selectedForm) {
      updateFormMutation.mutate({ ...formData, id: selectedForm.id });
    } else {
      createFormMutation.mutate(formData);
    }
  };

  const handleDeleteForm = (form: Form) => {
    if (window.confirm(`Are you sure you want to delete "${form.title}"? This will also delete all form fields and submissions.`)) {
      deleteFormMutation.mutate(form.id);
    }
  };

  const handleAddField = () => {
    resetFieldData();
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (field: FormField) => {
    const props = field.props as any;
    setFieldData({
      key: field.key,
      type: field.type,
      label: field.label,
      required: field.required,
      order: field.order,
      props: props || {}
    });
    setSelectedField(field);
    setIsFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!selectedForm) return;

    const fieldPayload = {
      ...fieldData,
      formId: selectedForm.id
    };

    if (selectedField) {
      updateFieldMutation.mutate({ ...fieldPayload, id: selectedField.id });
    } else {
      createFieldMutation.mutate(fieldPayload);
    }
  };

  const handleDeleteField = (field: FormField) => {
    if (window.confirm(`Are you sure you want to delete the "${field.label}" field?`)) {
      deleteFieldMutation.mutate(field.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="form-builder-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="form-builder">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Form Builder</h2>
          <p className="text-muted-foreground">
            Create and manage custom forms with conditional logic
          </p>
        </div>
        <Button onClick={handleNewForm} data-testid="button-new-form">
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-form-list">Forms</TabsTrigger>
          <TabsTrigger value="editor" data-testid="tab-form-editor">
            {selectedForm ? 'Edit Form' : 'New Form'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                All Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forms.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No forms created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first form to start collecting data.
                  </p>
                  <Button onClick={handleNewForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Form
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50" data-testid={`form-row-${form.key}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{form.title}</h3>
                          <Badge className={getStatusColor(form.status)}>
                            {form.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Key: {form.key}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(form.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditForm(form)}
                          data-testid={`button-edit-form-${form.key}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteForm(form)}
                          disabled={deleteFormMutation.isPending}
                          data-testid={`button-delete-form-${form.key}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formData.title}
                    onChange={(e) => handleFormInputChange("title", e.target.value)}
                    placeholder="Contact Form"
                    data-testid="input-form-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="form-key">Form Key</Label>
                  <Input
                    id="form-key"
                    value={formData.key}
                    onChange={(e) => handleFormInputChange("key", e.target.value)}
                    placeholder="contact"
                    data-testid="input-form-key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used to identify the form in code and URLs
                  </p>
                </div>

                <div>
                  <Label htmlFor="submit-action">Submit Action</Label>
                  <Select 
                    value={formData.settings.submitAction} 
                    onValueChange={(value) => handleFormInputChange("settings", { submitAction: value })}
                  >
                    <SelectTrigger data-testid="select-submit-action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Send Email</SelectItem>
                      <SelectItem value="redirect">Redirect to URL</SelectItem>
                      <SelectItem value="both">Email & Redirect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.settings.submitAction === 'redirect' || formData.settings.submitAction === 'both') && (
                  <div>
                    <Label htmlFor="redirect-url">Redirect URL</Label>
                    <Input
                      id="redirect-url"
                      value={formData.settings.redirectUrl || ""}
                      onChange={(e) => handleFormInputChange("settings", { redirectUrl: e.target.value })}
                      placeholder="/thank-you"
                      data-testid="input-redirect-url"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-notifications"
                    checked={formData.settings.emailNotifications}
                    onCheckedChange={(checked) => handleFormInputChange("settings", { emailNotifications: checked })}
                    data-testid="checkbox-email-notifications"
                  />
                  <Label htmlFor="email-notifications">Enable email notifications</Label>
                </div>

                {formData.settings.emailNotifications && (
                  <div>
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      value={formData.settings.notificationEmail || ""}
                      onChange={(e) => handleFormInputChange("settings", { notificationEmail: e.target.value })}
                      placeholder="admin@example.com"
                      data-testid="input-notification-email"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="form-status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleFormInputChange("status", value)}
                  >
                    <SelectTrigger data-testid="select-form-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveForm}
                  disabled={createFormMutation.isPending || updateFormMutation.isPending || !formData.title || !formData.key}
                  className="w-full"
                  data-testid="button-save-form"
                >
                  {(createFormMutation.isPending || updateFormMutation.isPending) ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {selectedForm ? 'Update Form' : 'Create Form'}
                </Button>
              </CardContent>
            </Card>

            {/* Form Fields */}
            {selectedForm && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Form Fields</CardTitle>
                    <Button size="sm" onClick={handleAddField} data-testid="button-add-field">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formFields.length === 0 ? (
                    <div className="text-center py-8">
                      <Type className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">No fields added yet</p>
                      <Button size="sm" onClick={handleAddField}>
                        Add First Field
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formFields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => {
                          const FieldIcon = fieldTypes.find(t => t.value === field.type)?.icon || Type;
                          return (
                            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`field-row-${field.key}`}>
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <FieldIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{field.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {field.type} {field.required && '• Required'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditField(field)}
                                  data-testid={`button-edit-field-${field.key}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteField(field)}
                                  data-testid={`button-delete-field-${field.key}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Field Editor Dialog would go here - simplified for now */}
      {isFieldDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="field-dialog">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{selectedField ? 'Edit Field' : 'Add Field'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Field Type</Label>
                <Select 
                  value={fieldData.type} 
                  onValueChange={(value) => handleFieldInputChange("type", value)}
                >
                  <SelectTrigger data-testid="select-field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Field Label</Label>
                <Input
                  value={fieldData.label}
                  onChange={(e) => handleFieldInputChange("label", e.target.value)}
                  placeholder="Full Name"
                  data-testid="input-field-label"
                />
              </div>

              <div>
                <Label>Field Key</Label>
                <Input
                  value={fieldData.key}
                  onChange={(e) => handleFieldInputChange("key", e.target.value)}
                  placeholder="full_name"
                  data-testid="input-field-key"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={fieldData.required}
                  onCheckedChange={(checked) => handleFieldInputChange("required", checked)}
                  data-testid="checkbox-field-required"
                />
                <Label htmlFor="field-required">Required field</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFieldDialogOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-field"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveField}
                  disabled={!fieldData.label || !fieldData.key}
                  className="flex-1"
                  data-testid="button-save-field"
                >
                  {selectedField ? 'Update' : 'Add'} Field
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}