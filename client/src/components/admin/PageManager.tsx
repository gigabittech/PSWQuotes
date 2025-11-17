import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Plus, Edit, Trash2, Eye, Save, RefreshCw, MoreVertical } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("list");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 432);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    <div className="space-y-4 sm:space-y-6" data-testid="page-manager">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Page Management</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage your website pages and content
          </p>
        </div>
        <Button onClick={handleNewPage} data-testid="button-new-page" className="w-full sm:w-auto" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full h-10 items-center justify-center bg-transparent p-0 gap-2 rounded-none border-0">
          <TabsTrigger 
            value="list" 
            data-testid="tab-page-list" 
            className={cn(
              "h-10 flex-1 text-xs sm:text-sm font-medium transition-all border-0",
              "rounded-md",
              "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-none",
              "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700"
            )}
          >
            Page List
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            data-testid="tab-page-editor" 
            className={cn(
              "h-10 flex-1 text-xs sm:text-sm font-medium transition-all border-0",
              "rounded-md",
              "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-none",
              "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700"
            )}
          >
            {selectedPage ? 'Edit Page' : 'New Page'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                All Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {pages.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No pages created yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Create your first page to get started with content management.
                  </p>
                  <Button onClick={handleNewPage} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {pages.map((page) => (
                    <div key={page.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50" data-testid={`page-row-${page.slug}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-medium text-sm sm:text-base truncate">{page.title}</h3>
                          <Badge className={getStatusColor(page.status)}>
                            {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                          Slug: /{page.slug}
                        </p>
                        {(page.seo as { metaDescription?: string })?.metaDescription && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {(page.seo as { metaDescription?: string }).metaDescription}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        {isSmallScreen ? (
                          /* Three-dot menu for screens less than 432px */
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-actions-menu-${page.slug}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {page.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => publishPageMutation.mutate(page.id)}
                                  disabled={publishPageMutation.isPending}
                                  data-testid={`menu-publish-${page.slug}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleEditPage(page)}
                                data-testid={`menu-edit-${page.slug}`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePage(page)}
                                disabled={deletePageMutation.isPending}
                                data-testid={`menu-delete-${page.slug}`}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          // Individual buttons for screens 432px and above
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                {selectedPage ? `Edit Page: ${selectedPage.title}` : 'Create New Page'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="title" className="text-sm sm:text-base">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="About Us"
                    data-testid="input-page-title"
                    className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-sm sm:text-base">Page Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="about-us"
                    data-testid="input-page-slug"
                    className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL path: /{formData.slug}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="metaDescription" className="text-sm sm:text-base">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  data-testid="textarea-meta-description"
                  className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="content" className="text-sm sm:text-base">Page Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Write your page content here. HTML is supported."
                  rows={12}
                  className="font-mono text-xs sm:text-sm mt-1.5 sm:mt-2"
                  data-testid="textarea-page-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML markup is supported. Use semantic tags for better SEO.
                </p>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm sm:text-base">Page Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger data-testid="select-page-status" className="mt-1.5 sm:mt-2 text-sm sm:text-base">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {selectedPage ? "Editing existing page" : "Creating new page"}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setSelectedPage(null);
                  setActiveTab("list");
                }}
                data-testid="button-cancel-page"
                size="sm"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePage}
                disabled={createPageMutation.isPending || updatePageMutation.isPending || !formData.title || !formData.slug}
                data-testid="button-save-page"
                size="sm"
                className="w-full sm:w-auto"
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