import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, FileText, BarChart3, Palette, FileEdit, Building, Image } from "lucide-react";
import { formatPrice } from "../utils/pricingCalculator";
import ThemeEditor from "@/components/admin/ThemeEditor";
import PageManager from "@/components/admin/PageManager";
import FormBuilder from "@/components/admin/FormBuilder";
import AnalyticsView from "@/components/admin/AnalyticsView";
import MediaManager from "@/components/admin/MediaManager";
import type { User, Quote } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/quotes/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const userRole = user?.role || 'viewer';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="admin-dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: quotes.length || 0,
    pending: quotes.filter((q: Quote) => q.status === 'pending').length || 0,
    contacted: quotes.filter((q: Quote) => q.status === 'contacted').length || 0,
    converted: quotes.filter((q: Quote) => q.status === 'converted').length || 0,
    totalValue: quotes.reduce((sum: number, q: Quote) => sum + parseFloat(q.finalPrice.toString()), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="admin-dashboard">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">CMS Admin</h1>
                <p className="text-sm text-muted-foreground">Perth Solar Warehouse</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="mb-8 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground" data-testid="user-email">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="user-role">{userRole}</p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-overview"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab("quotes")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "quotes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-quotes"
            >
              <FileText className="h-5 w-5" />
              <span>Quotes</span>
              <Badge className="ml-auto" variant="secondary">
                {quotes.length}
              </Badge>
            </button>

            {/* CMS Section */}
            {(userRole === 'admin' || userRole === 'editor') && (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Content Management
                  </h3>
                </div>
                
                <button
                  onClick={() => setActiveTab("theme")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "theme" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-theme"
                >
                  <Palette className="h-5 w-5" />
                  <span>Theme</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("pages")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "pages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-pages"
                >
                  <FileEdit className="h-5 w-5" />
                  <span>Pages</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("forms")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "forms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-forms"
                >
                  <Building className="h-5 w-5" />
                  <span>Forms</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("media")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "media" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-media"
                >
                  <Image className="h-5 w-5" />
                  <span>Media</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-analytics"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
              </>
            )}

            {/* User Management Section */}
            {userRole === 'admin' && (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User Management
                  </h3>
                </div>
                
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid="nav-users"
                >
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground">Manage your solar quote system and website content</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="total-quotes">{stats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600" data-testid="pending-quotes">{stats.pending}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Converted</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="converted-quotes">{stats.converted}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary" data-testid="total-value">{formatPrice(stats.totalValue)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Quotes */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quotes.slice(0, 5).map((quote: Quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{quote.customerName}</p>
                          <p className="text-sm text-muted-foreground">{quote.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatPrice(parseFloat(quote.finalPrice.toString()))}</p>
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "quotes" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Quote Management</h1>
                <p className="text-muted-foreground">Review and manage solar system quote requests</p>
              </div>

              <div className="space-y-4">
                {quotes.map((quote: Quote) => (
                  <Card key={quote.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{quote.customerName}</h3>
                          <p className="text-muted-foreground">{quote.email}</p>
                          <p className="text-sm text-muted-foreground">{quote.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatPrice(parseFloat(quote.finalPrice.toString()))}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Address</p>
                          <p className="text-sm text-muted-foreground">{quote.address}, {quote.suburb}, {quote.state} {quote.postcode}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Systems</p>
                          <p className="text-sm text-muted-foreground">{quote.selectedSystems.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(quote.status)} data-testid={`quote-status-${quote.id}`}>
                          {quote.status}
                        </Badge>
                        <Select
                          value={quote.status}
                          onValueChange={(status) => handleStatusUpdate(quote.id, status)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "theme" && <ThemeEditor />}

          {activeTab === "pages" && <PageManager />}

          {activeTab === "forms" && <FormBuilder />}

          {activeTab === "media" && <MediaManager />}

          {activeTab === "analytics" && <AnalyticsView />}

          {activeTab === "users" && userRole === 'admin' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage system users and permissions</p>
              </div>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">User management functionality coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}