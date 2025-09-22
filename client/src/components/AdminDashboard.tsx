import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, FileText, BarChart3, Palette, FileEdit, Building } from "lucide-react";
import { formatPrice } from "../utils/pricingCalculator";
import ThemeEditor from "@/components/admin/ThemeEditor";
import PageManager from "@/components/admin/PageManager";
import FormBuilder from "@/components/admin/FormBuilder";
import AnalyticsView from "@/components/admin/AnalyticsView";
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
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                data-testid="nav-overview"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab("quotes")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "quotes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                data-testid="nav-quotes"
              >
                <FileText className="h-4 w-4" />
                Quotes
              </button>
              
              {(userRole === 'admin' || userRole === 'editor') && (
                <>
                  <button
                    onClick={() => setActiveTab("theme")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "theme" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    data-testid="nav-theme"
                  >
                    <Palette className="h-4 w-4" />
                    Theme
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("pages")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "pages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    data-testid="nav-pages"
                  >
                    <FileEdit className="h-4 w-4" />
                    Pages
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("forms")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "forms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    data-testid="nav-forms"
                  >
                    <Settings className="h-4 w-4" />
                    Forms
                  </button>
                </>
              )}
              
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                data-testid="nav-analytics"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </nav>
            
            <div className="mt-8 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Logged in as</div>
              <div className="text-sm font-medium">{user?.username || 'User'}</div>
              <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-5 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-total-quotes">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">{stats.pending}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="stat-contacted">{stats.contacted}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="stat-converted">{stats.converted}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary" data-testid="stat-total-value">
                      {formatPrice(stats.totalValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Perth Solar Warehouse CMS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Manage your website content, quotes, and analytics from this central dashboard.
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Active Pages</div>
                          <div className="text-xl font-bold">5</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Forms</div>
                          <div className="text-xl font-bold">3</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">This Month</div>
                          <div className="text-xl font-bold">124</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Conversion</div>
                          <div className="text-xl font-bold">12.5%</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "quotes" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Quote Management</h2>
              
              {/* Quotes Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Customer</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Systems</th>
                          <th className="text-left p-4">Value</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Date</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote: Quote) => (
                          <tr key={quote.id} className="border-b" data-testid={`quote-row-${quote.id}`}>
                            <td className="p-4 font-medium">{quote.customerName}</td>
                            <td className="p-4">{quote.email}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                {quote.selectedSystems.map((system: string) => (
                                  <Badge key={system} variant="secondary" className="text-xs">
                                    {system}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-semibold">{formatPrice(parseFloat(quote.finalPrice))}</td>
                            <td className="p-4">
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Select
                                  value={quote.status}
                                  onValueChange={(status) => handleStatusUpdate(quote.id, status)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/api/quotes/${quote.id}/pdf`, '_blank')}
                                  data-testid={`button-download-pdf-${quote.id}`}
                                >
                                  <i className="fas fa-download"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "theme" && <ThemeEditor />}
          
          {activeTab === "pages" && <PageManager />}
          
          {activeTab === "forms" && <FormBuilder />}
          
          {activeTab === "analytics" && <AnalyticsView />}
        </div>
      </div>
    </div>
  );
}
