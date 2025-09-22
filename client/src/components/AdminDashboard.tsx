import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { 
  Settings as SettingsIcon, 
  Users, 
  FileText, 
  BarChart3, 
  Palette, 
  FileEdit, 
  Building, 
  Image, 
  Menu, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  Eye,
  Edit,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { formatPrice } from "../utils/pricingCalculator";
import ThemeEditor from "@/components/admin/ThemeEditor";
import PageManager from "@/components/admin/PageManager";
import FormBuilder from "@/components/admin/FormBuilder";
import AnalyticsView from "@/components/admin/AnalyticsView";
import MediaManager from "@/components/admin/MediaManager";
import { Settings } from "@/components/admin/Settings";
import type { User, Quote } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: authResponse, refetch: refetchUser } = useQuery<{user: User}>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  
  // Extract user from response structure
  const user = authResponse?.user;

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close mobile sidebar when tab changes
  };

  // Filter quotes based on search and status
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote: Quote) => {
      const matchesSearch = searchQuery === "" || 
        quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="admin-dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats with trends
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const recentQuotes = quotes.filter((q: Quote) => new Date(q.createdAt) >= thirtyDaysAgo);
    const previousQuotes = quotes.filter((q: Quote) => {
      const date = new Date(q.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    
    const total = quotes.length || 0;
    const pending = quotes.filter((q: Quote) => q.status === 'pending').length || 0;
    const contacted = quotes.filter((q: Quote) => q.status === 'contacted').length || 0;
    const converted = quotes.filter((q: Quote) => q.status === 'converted').length || 0;
    const lost = quotes.filter((q: Quote) => q.status === 'lost').length || 0;
    const totalValue = quotes.reduce((sum: number, q: Quote) => sum + parseFloat(q.finalPrice.toString()), 0) || 0;
    
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;
    const avgQuoteValue = total > 0 ? totalValue / total : 0;
    
    // Calculate trends
    const recentCount = recentQuotes.length;
    const previousCount = previousQuotes.length;
    const quoteTrend = previousCount > 0 ? ((recentCount - previousCount) / previousCount) * 100 : 0;
    
    const recentValue = recentQuotes.reduce((sum: number, q: Quote) => sum + parseFloat(q.finalPrice.toString()), 0);
    const previousValue = previousQuotes.reduce((sum: number, q: Quote) => sum + parseFloat(q.finalPrice.toString()), 0);
    const valueTrend = previousValue > 0 ? ((recentValue - previousValue) / previousValue) * 100 : 0;
    
    return {
      total,
      pending,
      contacted,
      converted,
      lost,
      totalValue,
      conversionRate,
      avgQuoteValue,
      quoteTrend,
      valueTrend,
      recentQuotes: recentQuotes.length,
      todayQuotes: quotes.filter((q: Quote) => {
        const quoteDate = new Date(q.createdAt);
        const today = new Date();
        return quoteDate.toDateString() === today.toDateString();
      }).length
    };
  }, [quotes]);

  // Sidebar component for both desktop and mobile
  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">CMS Admin</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Perth Solar Warehouse</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="mb-6 sm:mb-8 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground" data-testid="user-username">{user?.username}</p>
          <p className="text-xs text-muted-foreground capitalize" data-testid="user-role">{userRole}</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1 sm:space-y-2">
        <button
          onClick={() => handleTabChange("overview")}
          className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-overview"
        >
          <BarChart3 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Overview</span>
        </button>
        
        <button
          onClick={() => handleTabChange("quotes")}
          className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "quotes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-quotes"
        >
          <FileText className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Quotes</span>
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
              onClick={() => handleTabChange("theme")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "theme" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-theme"
            >
              <Palette className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Theme</span>
            </button>
            
            <button
              onClick={() => handleTabChange("pages")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "pages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-pages"
            >
              <FileEdit className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Pages</span>
            </button>
            
            <button
              onClick={() => handleTabChange("forms")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "forms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-forms"
            >
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Forms</span>
            </button>
            
            <button
              onClick={() => handleTabChange("media")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "media" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-media"
            >
              <Image className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Media</span>
            </button>
            
            <button
              onClick={() => handleTabChange("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-analytics"
            >
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Analytics</span>
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
              onClick={() => handleTabChange("users")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-users"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Users</span>
            </button>
            
            <button
              onClick={() => handleTabChange("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-settings"
            >
              <SettingsIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Settings</span>
            </button>
          </>
        )}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="admin-dashboard">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-white lg:dark:bg-gray-800 lg:shadow-sm lg:border-r lg:border-border">
          <SidebarContent />
        </div>

        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">CMS Admin</h1>
            </div>
            
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  data-testid="mobile-menu-button"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:overflow-hidden">
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your solar quote system and website content</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button onClick={() => handleTabChange("quotes")} className="gap-2" data-testid="quick-action-quotes">
                    <FileText className="h-4 w-4" />
                    View All Quotes
                  </Button>
                  <Button variant="outline" onClick={() => handleTabChange("analytics")} className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                  <Button variant="outline" onClick={() => handleTabChange("theme")} className="gap-2">
                    <Palette className="h-4 w-4" />
                    Customize Theme
                  </Button>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Quotes</CardTitle>
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1" data-testid="total-quotes">
                        {stats.total}
                      </div>
                      <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                        {stats.quoteTrend >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        <span>{Math.abs(stats.quoteTrend).toFixed(1)}% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</CardTitle>
                      <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-lg">
                        <Clock className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1" data-testid="pending-quotes">
                        {stats.pending}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600 dark:text-amber-400">Needs attention</span>
                        <Progress value={stats.total ? (stats.pending / stats.total) * 100 : 0} className="w-16 h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Converted</CardTitle>
                      <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1" data-testid="converted-quotes">
                        {stats.converted}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        {stats.conversionRate.toFixed(1)}% conversion rate
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Value</CardTitle>
                      <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                        <DollarSign className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1" data-testid="total-value">
                        {formatPrice(stats.totalValue)}
                      </div>
                      <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                        {stats.valueTrend >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        <span>{Math.abs(stats.valueTrend).toFixed(1)}% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Today's Quotes</p>
                          <p className="text-2xl font-bold">{stats.todayQuotes}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Quote Value</p>
                          <p className="text-2xl font-bold">{formatPrice(stats.avgQuoteValue)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold">{stats.recentQuotes}</p>
                        </div>
                        <Activity className="h-8 w-8 text-amber-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Recent Quotes
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange("quotes")}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((quote: Quote) => (
                          <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{quote.customerName}</p>
                              <p className="text-xs text-muted-foreground truncate">{quote.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(quote.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-medium text-sm">{formatPrice(parseFloat(quote.finalPrice.toString()))}</p>
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(quote.status)}`}>
                                {quote.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {quotes.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No quotes yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Distribution */}
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Quote Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm">Pending</span>
                            </div>
                            <span className="text-sm font-medium">{stats.pending}</span>
                          </div>
                          <Progress value={(stats.pending / (stats.total || 1)) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">Contacted</span>
                            </div>
                            <span className="text-sm font-medium">{stats.contacted}</span>
                          </div>
                          <Progress value={(stats.contacted / (stats.total || 1)) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm">Converted</span>
                            </div>
                            <span className="text-sm font-medium">{stats.converted}</span>
                          </div>
                          <Progress value={(stats.converted / (stats.total || 1)) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm">Lost</span>
                            </div>
                            <span className="text-sm font-medium">{stats.lost}</span>
                          </div>
                          <Progress value={(stats.lost / (stats.total || 1)) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {activeTab === "quotes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Quote Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Review and manage solar system quote requests</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Search and Filter Controls */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search quotes by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="search-quotes"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Results Summary */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredQuotes.length} of {quotes.length} quotes
                      {searchQuery && ` matching "${searchQuery}"`}
                      {statusFilter !== "all" && ` with status "${statusFilter}"`}
                    </p>
                  </div>
                </Card>

                {/* Enhanced Quote Cards */}
                <div className="space-y-4">
                  {filteredQuotes.map((quote: Quote) => (
                    <Card key={quote.id} className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-foreground">{quote.customerName}</h3>
                              <Button variant="ghost" size="sm" className="ml-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>📧</span> {quote.email}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>📱</span> {quote.phone}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>📍</span> {quote.address}, {quote.suburb}, {quote.state} {quote.postcode}
                              </p>
                            </div>
                          </div>
                          <div className="text-left lg:text-right">
                            <p className="text-xl sm:text-2xl font-bold text-primary mb-1">
                              {formatPrice(parseFloat(quote.finalPrice.toString()))}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              {new Date(quote.createdAt).toLocaleDateString('en-AU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <div className="flex flex-col lg:items-end gap-2">
                              <Badge className={`${getStatusColor(quote.status)} border-0`}>
                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quote Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Systems</p>
                            <p className="text-sm font-medium">{quote.selectedSystems?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Power Supply</p>
                            <p className="text-sm font-medium">{quote.powerSupply} Phase</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Price</p>
                            <p className="text-sm font-medium">{formatPrice(parseFloat(quote.totalPrice.toString()))}</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Select
                              value={quote.status}
                              onValueChange={(value) => handleStatusUpdate(quote.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-36 h-8">
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
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredQuotes.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">No quotes found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || statusFilter !== "all" 
                            ? "Try adjusting your search or filter criteria." 
                            : "No quotes have been submitted yet."}
                        </p>
                        {(searchQuery || statusFilter !== "all") && (
                          <Button 
                            variant="outline" 
                            onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                            className="gap-2"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* CMS Components */}
            {activeTab === "theme" && <ThemeEditor />}
            {activeTab === "pages" && <PageManager />}
            {activeTab === "forms" && <FormBuilder />}
            {activeTab === "media" && <MediaManager />}
            {activeTab === "analytics" && <AnalyticsView />}
            
            {/* User Management */}
            {activeTab === "users" && userRole === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">User Management</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">User management functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && userRole === 'admin' && (
              <Settings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}