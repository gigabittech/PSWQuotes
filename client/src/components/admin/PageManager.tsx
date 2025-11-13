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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Edit, Trash2, Eye, Save, RefreshCw } from "lucide-react";
import type { CmsPage } from "@shared/schema";

interface PageFormData {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  status: string;
}

interface PageApiPayload {
  slug: string;
  title: string;
  seo: {
    title: string;
    metaDescription: string;
  };
  blocks: {
    type: string;
    content: string;
  }[];
  status: string;
}

export default function PageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const [formData, setFormData] = useState<PageFormData>({
    slug: "",
    title: "",
    content: "",
    metaDescription: "",
    status: "draft"
  });

  const { data: pages = [], isLoading } = useQuery<CmsPage[]>({
    queryKey: ['/api/cms/pages'],
  });

  const createPageMutation = useMutation({
    mutationFn: async (pageData: PageApiPayload) => {
      const response = await apiRequest('POST', '/api/cms/pages', pageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page created",
        description: "New page has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page.",
        variant: "destructive",
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...pageData }: PageApiPayload & { id: string }) => {
      const response = await apiRequest('PUT', `/api/cms/pages/${id}`, pageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page updated",
        description: "Page has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
      setSelectedPage(null);
      setActiveTab("list");
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update page.",
        variant: "destructive",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cms/pages/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "Page has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
      setSelectedPage(null);
      setActiveTab("list");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      });
    },
  });

  const publishPageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/cms/pages/${id}/publish`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page published",
        description: "Page is now live on the website.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish page.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof PageFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      content: "",
      metaDescription: "",
      status: "draft"
    });
  };

  const handleNewPage = () => {
    resetForm();
    setSelectedPage(null);
    setActiveTab("editor");
  };

  const handleEditPage = (page: CmsPage) => {
    const seoData = page.seo as { title?: string; metaDescription?: string } | null;
    const blocksData = page.blocks as Array<{ type: string; content: string }> | null;
    
    setFormData({
      slug: page.slug,
      title: page.title,
      content: Array.isArray(blocksData) ? blocksData.map(block => block.content || '').join('\n') : '',
      metaDescription: seoData?.metaDescription || "",
      status: page.status
    });
    setSelectedPage(page);
    setActiveTab("editor");
  };

  const handleSavePage = () => {
    // Transform flat form data to JSON structure expected by API
    const payload = {
      slug: formData.slug,
      title: formData.title,
      seo: {
        title: formData.title,
        metaDescription: formData.metaDescription,
      },
      blocks: [
        {
          type: 'content',
          content: formData.content,
        }
      ],
      status: formData.status,
    };
    
    if (selectedPage) {
      updatePageMutation.mutate({ ...payload, id: selectedPage.id });
    } else {
      createPageMutation.mutate(payload);
    }
  };

  const handleDeletePage = (page: CmsPage) => {
    if (window.confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      deletePageMutation.mutate(page.id);
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
      <div className="flex items-center justify-center h-64" data-testid="page-manager-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-manager">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Page Management</h2>
          <p className="text-muted-foreground">
            Create and manage your website pages and content
          </p>
        </div>
        <Button onClick={handleNewPage} data-testid="button-new-page">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-page-list">Page List</TabsTrigger>
          <TabsTrigger value="editor" data-testid="tab-page-editor">
            {selectedPage ? 'Edit Page' : 'New Page'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pages created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first page to get started with content management.
                  </p>
                  <Button onClick={handleNewPage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50" data-testid={`page-row-${page.slug}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{page.title}</h3>
                          <Badge className={getStatusColor(page.status)}>
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Slug: /{page.slug}
                        </p>
                        {(page.seo as { metaDescription?: string })?.metaDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {(page.seo as { metaDescription?: string }).metaDescription}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {page.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => publishPageMutation.mutate(page.id)}
                            disabled={publishPageMutation.isPending}
                            data-testid={`button-publish-${page.slug}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPage(page)}
                          data-testid={`button-edit-${page.slug}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePage(page)}
                          disabled={deletePageMutation.isPending}
                          data-testid={`button-delete-${page.slug}`}
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
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedPage ? `Edit Page: ${selectedPage.title}` : 'Create New Page'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="About Us"
                    data-testid="input-page-title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Page Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="about-us"
                    data-testid="input-page-slug"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL path: /{formData.slug}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  data-testid="textarea-meta-description"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Write your page content here. HTML is supported."
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="textarea-page-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML markup is supported. Use semantic tags for better SEO.
                </p>
              </div>

              <div>
                <Label htmlFor="status">Page Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger data-testid="select-page-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedPage ? "Editing existing page" : "Creating new page"}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setSelectedPage(null);
                  setActiveTab("list");
                }}
                data-testid="button-cancel-page"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePage}
                disabled={createPageMutation.isPending || updatePageMutation.isPending || !formData.title || !formData.slug}
                data-testid="button-save-page"
              >
                {(createPageMutation.isPending || updatePageMutation.isPending) ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {selectedPage ? 'Update Page' : 'Create Page'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}