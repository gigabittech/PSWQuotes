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
  ArrowDownRight,
  Code,
  Mail
} from "lucide-react";
import { formatPrice } from "../utils/pricingCalculator";
import ThemeEditor from "@/components/admin/ThemeEditor";
import PageManager from "@/components/admin/PageManager";
import FormBuilder from "@/components/admin/FormBuilder";
import AnalyticsView from "@/components/admin/AnalyticsView";
import MediaManager from "@/components/admin/MediaManager";
import { Settings } from "@/components/admin/Settings";
import EmbedCodeGenerator from "@/components/EmbedCodeGenerator";
import ProductManager from "@/components/admin/ProductManager";
import EmailLogs from "@/components/admin/EmailLogs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
        return 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800';
      case 'converted':
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800';
      case 'lost':
        return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700';
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
        `${quote.firstName} ${quote.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.phone?.includes(searchQuery);
      
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-screen">
          {/* Desktop Sidebar Skeleton */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-white lg:dark:bg-gray-800 lg:shadow-sm lg:border-r lg:border-border p-6">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 p-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96 mb-8" />
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 rounded-lg border bg-card">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>

            {/* Additional Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-6 rounded-lg border bg-card">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <button
          onClick={() => handleTabChange("email-logs")}
          className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "email-logs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-email-logs"
        >
          <Mail className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Email Logs</span>
        </button>

        <button
          onClick={() => handleTabChange("embed")}
          className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "embed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-embed"
        >
          <Code className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Embed Code</span>
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
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-products"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Products</span>
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
    <TooltipProvider>
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
              <div className="max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-outfit font-bold text-foreground mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Here's what's happening with your solar quotes today.</p>
                </div>

                {/* Today's Activity Strip */}
                {stats.todayQuotes > 0 && (
                  <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium">Today</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-semibold text-lg">{stats.todayQuotes}</span>
                        <span className="text-muted-foreground">new {stats.todayQuotes === 1 ? 'quote' : 'quotes'}</span>
                        <Button variant="link" size="sm" className="ml-auto" onClick={() => handleTabChange("quotes")}>
                          Review →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Stats - Clean 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {stats.quoteTrend !== 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.quoteTrend >= 0 ? '+' : ''}{stats.quoteTrend.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Quotes</p>
                        <p className="text-3xl font-bold" data-testid="total-quotes">{stats.total}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        </div>
                        {stats.pending > 0 && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                            Action needed
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Pending</p>
                        <p className="text-3xl font-bold" data-testid="pending-quotes">{stats.pending}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                        </div>
                        {stats.conversionRate > 0 && (
                          <Badge variant="secondary">
                            {stats.conversionRate.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Converted</p>
                        <p className="text-3xl font-bold" data-testid="converted-quotes">{stats.converted}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                        <p className="text-2xl font-bold" data-testid="total-value">{formatPrice(stats.totalValue)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((quote: Quote) => (
                        <div key={quote.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{quote.firstName} {quote.lastName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()} • {quote.email}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(parseFloat(quote.finalPrice.toString()))}</p>
                            <Badge variant="outline" className={`text-xs whitespace-nowrap ${getStatusColor(quote.status)}`}>
                              {quote.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {quotes.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No quotes yet. They'll appear here once customers submit requests.</p>
                        </div>
                      )}
                      {quotes.length > 0 && (
                        <Button variant="outline" className="w-full mt-4" onClick={() => handleTabChange("quotes")}>
                          View All Quotes
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === "quotes" && (
              <div className="max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-outfit font-bold text-foreground mb-2">Quotes</h1>
                  <p className="text-muted-foreground">Review and manage customer quote requests</p>
                </div>

                {/* Search and Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="search-quotes"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                {/* Results Summary */}
                {(searchQuery || statusFilter !== "all") && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredQuotes.length} of {quotes.length} quotes
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}

                {/* Quote List */}
                <div className="space-y-3">
                  {filteredQuotes.length === 0 ? (
                    <Card className="p-12">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">No Quotes Found</h3>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery || statusFilter !== "all" 
                            ? "No quotes match your current filters" 
                            : "Quote requests will appear here once customers submit the form"}
                        </p>
                      </div>
                    </Card>
                  ) : (
                    filteredQuotes.map((quote: Quote) => (
                    <Card key={quote.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Customer Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">{quote.firstName} {quote.lastName}</h3>
                                <div className="space-y-0.5 text-sm text-muted-foreground">
                                  <p>{quote.email}</p>
                                  <p>{quote.phone}</p>
                                  <p>{quote.address}, {quote.suburb} {quote.state} {quote.postcode}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quote Details */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Systems:</span>
                                <span className="ml-1 font-medium">{quote.selectedSystems?.join(', ') || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Supply:</span>
                                <span className="ml-1 font-medium">{quote.powerSupply} Phase</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Price & Status */}
                          <div className="md:text-right">
                            <p className="text-2xl font-bold mb-2">
                              {formatPrice(parseFloat(quote.finalPrice.toString()))}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {new Date(quote.createdAt).toLocaleDateString('en-AU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <Select
                              value={quote.status}
                              onValueChange={(value) => handleStatusUpdate(quote.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-full md:w-36">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  )}
                </div>
              </div>
            )}

            {/* Embed Code */}
            {activeTab === "embed" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Embed Quote Form</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Generate embed codes to add the quote form to external websites</p>
                </div>
                <EmbedCodeGenerator />
              </div>
            )}

            {/* Email Logs */}
            {activeTab === "email-logs" && <EmailLogs />}

            {/* CMS Components */}
            {activeTab === "theme" && <ThemeEditor />}
            {activeTab === "pages" && <PageManager />}
            {activeTab === "products" && <ProductManager />}
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
    </TooltipProvider>
  );
}