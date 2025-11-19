import { useState, useMemo, useEffect } from "react";
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
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { formatPrice } from "../utils/pricingCalculator";
import { cn } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import type { User, Quote } from "@shared/schema";

export default function AdminDashboard({ mobileSidebarOpen, setMobileSidebarOpen, showOnlySidebar, activeTab: externalActiveTab, setActiveTab: externalSetActiveTab }: { mobileSidebarOpen?: boolean; setMobileSidebarOpen?: (open: boolean) => void; showOnlySidebar?: boolean; activeTab?: string; setActiveTab?: (tab: string) => void }) {
  const [internalActiveTab, setInternalActiveTab] = useState("overview");
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = externalSetActiveTab ?? setInternalActiveTab;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({ username: "", password: "", role: "viewer" as "admin" | "editor" | "viewer" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: authResponse, refetch: refetchUser } = useQuery<{user: User}>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  
  // Extract user from response structure
  const user = authResponse?.user;
  const userRole = user?.role || 'viewer';

  // Fetch paginated quotes
  const { data: quotesResponse, isLoading } = useQuery<{ data: Quote[]; total: number; page: number; limit: number; totalPages: number } | Quote[]>({
    queryKey: ['/api/quotes', currentPage, itemsPerPage, searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`/api/quotes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      return response.json();
    },
  });

  // Handle both paginated response and legacy array response
  const quotes = Array.isArray(quotesResponse) ? quotesResponse : (quotesResponse?.data || []);
  const totalQuotes = Array.isArray(quotesResponse) ? quotesResponse.length : (quotesResponse?.total || 0);
  const totalPages = Array.isArray(quotesResponse) ? Math.ceil(totalQuotes / itemsPerPage) : (quotesResponse?.totalPages || 1);

  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery<{users: User[]}>({
    queryKey: ['/api/users'],
    enabled: userRole === 'admin' && activeTab === 'users',
  });

  const users = usersResponse?.users || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/quotes/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      const response = await apiRequest('POST', '/api/users', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsUserDialogOpen(false);
      setUserFormData({ username: "", password: "", role: "viewer" });
      setEditingUser(null);
      toast({
        title: "User created",
        description: "User has been created successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to create user";
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
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { role?: string; password?: string } }) => {
      const response = await apiRequest('PUT', `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsUserDialogOpen(false);
      setUserFormData({ username: "", password: "", role: "viewer" });
      setEditingUser(null);
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to update user";
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
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to delete user";
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
    },
  });

  const capitalizeWords = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const capitalizeFirst = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatSystemName = (system: string): string => {
    return capitalizeFirst(system);
  };

  const formatPowerSupply = (supply: string | null | undefined): string => {
    if (!supply) return '';
    if (supply === 'single') return 'Single';
    if (supply === 'three') return 'Three';
    if (supply === 'unknown') return "I don't know";
    return capitalizeFirst(supply);
  };

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close mobile sidebar when tab changes
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false); // Close parent mobile sidebar when tab changes
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ username: "", password: "", role: "viewer" });
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ username: user.username, password: "", role: user.role as "admin" | "editor" | "viewer" });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitUser = () => {
    if (!userFormData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      // Update user
      const updateData: { role?: string; password?: string } = {};
      if (userFormData.role !== editingUser.role) {
        updateData.role = userFormData.role;
      }
      if (userFormData.password.trim()) {
        updateData.password = userFormData.password;
      }
      
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes",
          description: "No changes to save",
        });
        return;
      }

      updateUserMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      // Create user
      if (!userFormData.password.trim()) {
        toast({
          title: "Validation Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }
      createUserMutation.mutate(userFormData);
    }
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Calculate pagination display values
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalQuotes);
  const paginatedQuotes = quotes; // Quotes are already paginated from server

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

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
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 lg:hidden flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">CMS Admin</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Perth Solar Warehouse</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-0 flex-1 overflow-y-auto pb-4">
        {/* Overview Section */}
        <div className="pt-4 pb-1">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overview
          </h3>
        </div>
        
        <button
          onClick={() => handleTabChange("overview")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "overview" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-overview"
        >
          <BarChart3 className="h-5 w-5 flex-shrink-0" />
          
          <span className="text-sm">Dashboard</span>
        </button>
        
        <button
          onClick={() => handleTabChange("quotes")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "quotes" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-quotes"
        >
          <FileText className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Quotes</span>
          <Badge className="ml-auto" variant="secondary">
            {quotes.length}
          </Badge>
        </button>

        <button
          onClick={() => handleTabChange("email-logs")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "email-logs" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-email-logs"
        >
          <Mail className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Email Logs</span>
        </button>

        <button
          onClick={() => handleTabChange("embed")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "embed" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-embed"
        >
          <Code className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Embed Code</span>
        </button>

        {/* CMS Section */}
        {(userRole === 'admin' || userRole === 'editor') && (
          <>
            <div className="pt-4 pb-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Content Management
              </h3>
            </div>
            
            <button
              onClick={() => handleTabChange("theme")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "theme" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-theme"
            >
              <Palette className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Theme</span>
            </button>
            
            <button
              onClick={() => handleTabChange("pages")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "pages" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-pages"
            >
              <FileEdit className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Pages</span>
            </button>
            
            <button
              onClick={() => handleTabChange("forms")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "forms" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-forms"
            >
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Forms</span>
            </button>
            
            <button
              onClick={() => handleTabChange("media")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "media" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-media"
            >
              <Image className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Media</span>
            </button>
            
            <button
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "products" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-products"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Products</span>
            </button>
            
            <button
              onClick={() => handleTabChange("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "analytics" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-analytics"
            >
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Analytics</span>
            </button>
          </>
        )}

        {/* User Management Section */}
        {userRole === 'admin' && (
          <>
            <div className="pt-4 pb-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Management
              </h3>
            </div>
            
            <button
              onClick={() => handleTabChange("users")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "users" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-users"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Users</span>
            </button>
            
            <button
              onClick={() => handleTabChange("settings")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "settings" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-settings"
            >
              <SettingsIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Settings</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );

  // If showOnlySidebar is true, only render the sidebar navigation
  if (showOnlySidebar) {
    return (
      <nav className="px-3 space-y-0.5 flex-1 overflow-y-auto pb-4">
        <button
          onClick={() => handleTabChange("overview")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "overview" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-overview"
        >
          <BarChart3 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Overview</span>
        </button>
        
        <button
          onClick={() => handleTabChange("quotes")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "quotes" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-quotes"
        >
          <FileText className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Quotes</span>
          <Badge className="ml-auto" variant="secondary">
            {quotes.length}
          </Badge>
        </button>

        <button
          onClick={() => handleTabChange("email-logs")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "email-logs" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-email-logs"
        >
          <Mail className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Email Logs</span>
        </button>

        <button
          onClick={() => handleTabChange("embed")}
          className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
            activeTab === "embed" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="nav-embed"
        >
          <Code className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Embed Code</span>
        </button>

        {/* CMS Section */}
        {(userRole === 'admin' || userRole === 'editor') && (
          <>
            <div className="pt-4 pb-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Content Management
              </h3>
            </div>
            
            <button
              onClick={() => handleTabChange("theme")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "theme" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-theme"
            >
              <Palette className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Theme</span>
            </button>
            
            <button
              onClick={() => handleTabChange("pages")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "pages" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-pages"
            >
              <FileEdit className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Pages</span>
            </button>
            
            <button
              onClick={() => handleTabChange("forms")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "forms" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-forms"
            >
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Forms</span>
            </button>
            
            <button
              onClick={() => handleTabChange("media")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "media" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-media"
            >
              <Image className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Media</span>
            </button>
            
            <button
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "products" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-products"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Products</span>
            </button>
            
            <button
              onClick={() => handleTabChange("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "analytics" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-analytics"
            >
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Analytics</span>
            </button>
          </>
        )}

        {/* User Management Section */}
        {userRole === 'admin' && (
          <>
            <div className="pt-4 pb-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Management
              </h3>
            </div>
            
            <button
              onClick={() => handleTabChange("users")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "users" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-users"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Users</span>
            </button>
            
            <button
              onClick={() => handleTabChange("settings")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                activeTab === "settings" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="nav-settings"
            >
              <SettingsIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Settings</span>
            </button>
          </>
        )}
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="admin-dashboard">
        <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-white lg:dark:bg-gray-800 lg:shadow-sm lg:border-r lg:border-border lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-30">
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
        <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-6 md:py-7 lg:py-8 w-full">
            {activeTab === "overview" && (
              <div>
                {/* Header */}
                <div className="mb-6 md:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-foreground mb-1 sm:mb-2">Dashboard</h1>
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
                        <Button  size="sm" className="ml-auto" onClick={() => handleTabChange("quotes")}>
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
                            <p className="font-medium text-sm truncate">{capitalizeWords(quote.firstName)} {capitalizeWords(quote.lastName)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()} • {quote.email}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(parseFloat(quote.finalPrice.toString()))}</p>
                            <Badge variant="outline" className={`text-xs whitespace-nowrap ${getStatusColor(quote.status)}`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-6 md:mb-8 flex-shrink-0">
                  <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-foreground mb-1 sm:mb-2">Quotes</h1>
                  <p className="text-muted-foreground">Review and manage customer quote requests</p>
                </div>

                {/* Search and Filter Toolbar */}
                <div className="flex flex-col custom:flex-row gap-4 mb-6 items-start custom:items-center flex-shrink-0">
                  <div className="relative w-full custom:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                      data-testid="search-quotes"
                    />
                  </div>
                  <div className="flex-1 flex flex-wrap custom:flex-nowrap gap-2 w-full custom:w-auto custom:ml-auto custom:justify-end">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={cn(
                        "h-11 flex-1 custom:flex-none custom:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center min-h-[44px] min-w-[calc(33.333%-0.5rem)] custom:min-w-0",
                        statusFilter === "all"
                          ? "bg-primary text-black"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={cn(
                        "h-11 flex-1 custom:flex-none custom:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center min-h-[44px] min-w-[calc(33.333%-0.5rem)] custom:min-w-0",
                        statusFilter === "pending"
                          ? "bg-primary text-black"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("contacted")}
                      className={cn(
                        "h-11 flex-1 custom:flex-none custom:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center min-h-[44px] min-w-[calc(33.333%-0.5rem)] custom:min-w-0",
                        statusFilter === "contacted"
                          ? "bg-primary text-black"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => setStatusFilter("converted")}
                      className={cn(
                        "h-11 flex-1 custom:flex-none custom:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center min-h-[44px] min-w-[calc(50%-0.5rem)] custom:min-w-0",
                        statusFilter === "converted"
                          ? "bg-primary text-black"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      Converted
                    </button>
                    <button
                      onClick={() => setStatusFilter("lost")}
                      className={cn(
                        "h-11 flex-1 custom:flex-none custom:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center min-h-[44px] min-w-[calc(50%-0.5rem)] custom:min-w-0",
                        statusFilter === "lost"
                          ? "bg-primary text-black"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      Lost
                    </button>
                  </div>
                  <Button variant="outline" className="gap-2 w-full custom:w-auto">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                {/* Results Summary */}
                {(searchQuery || statusFilter !== "all") && (
                  <div className="mb-4 flex items-center justify-between flex-shrink-0">
                    <p className="text-sm text-muted-foreground">
                      Showing {totalQuotes} of {totalQuotes} quotes
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}

                {/* Quote List - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 mb-6">
                  <div className="space-y-3">
                    {paginatedQuotes.length === 0 ? (
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
                      paginatedQuotes.map((quote: Quote) => (
                      <Card key={quote.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            {/* Customer Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground mb-1">{capitalizeWords(quote.firstName)} {capitalizeWords(quote.lastName)}</h3>
                                  <div className="space-y-0.5 text-sm text-muted-foreground">
                                    <p>{quote.email}</p>
                                    <p>{quote.phone}</p>
                                    <p>{capitalizeWords(quote.address)}, {capitalizeWords(quote.suburb)} {quote.state?.toUpperCase()} {quote.postcode}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Quote Details */}
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Systems:</span>
                                  <span className="ml-1 font-medium">{quote.selectedSystems?.map(formatSystemName).join(', ') || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Supply:</span>
                                  <span className="ml-1 font-medium">{formatPowerSupply(quote.powerSupply)} Phase</span>
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

                {/* Pagination */}
                {totalQuotes > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 flex-shrink-0">
                    {/* Left side - Info and page size selector */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <div className="text-sm text-muted-foreground text-center sm:text-left">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalQuotes)} of {totalQuotes} quotes
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Show Per Page:</span>
                        <span className="text-sm text-muted-foreground sm:hidden">Per Page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className="w-20 h-8 rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Right side - Navigation controls */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {/* First and Previous buttons - always visible */}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 rounded-md hidden sm:flex"
                          title="First page"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 rounded-md"
                          title="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Page numbers - always show at least page 1 */}
                      <div className="flex items-center space-x-1">
                        {/* Mobile: show 3 pages max, Desktop: show 5 pages max */}
                        <div className="flex items-center space-x-1 sm:hidden">
                          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage <= 2) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 1) {
                              pageNum = totalPages - 2 + i;
                            } else {
                              pageNum = currentPage - 1 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-8 w-8 p-0 rounded-md ${
                                  currentPage === pageNum 
                                    ? "bg-[#f7c917] text-black" 
                                    : ""
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        {/* Desktop: show 5 pages max */}
                        <div className="hidden sm:flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-8 w-8 p-0 rounded-md ${
                                  currentPage === pageNum 
                                    ? "bg-[#f7c917] text-black" 
                                    : ""
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Next and Last buttons - always visible */}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 rounded-md"
                          title="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 rounded-md hidden sm:flex"
                          title="Last page"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Embed Code */}
            {activeTab === "embed" && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="flex flex-col h-full">
                  <div className="mb-6 md:mb-8 flex-shrink-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">Embed Quote Form</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Generate embed codes to add the quote form to external websites</p>
                  </div>
                  <EmbedCodeGenerator />
                </div>
              </div>
            )}

            {/* Email Logs */}
            {activeTab === "email-logs" && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <EmailLogs />
              </div>
            )}

            {/* CMS Components */}
            {activeTab === "theme" && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <ThemeEditor />
              </div>
            )}
            {activeTab === "pages" && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <PageManager />
              </div>
            )}
            {activeTab === "products" && <ProductManager />}
            {activeTab === "forms" && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <FormBuilder />
              </div>
            )}
            {activeTab === "media" && <MediaManager />}
            {activeTab === "analytics" && <AnalyticsView />}
            
            {/* User Management */}
            {activeTab === "users" && userRole === 'admin' && (
              <div>
                <div className="mb-6 md:mb-8 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-foreground mb-1 sm:mb-2">User Management</h1>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                  </div>
                  <Button onClick={handleCreateUser} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                </div>

                {isLoadingUsers ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Users ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {users.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No users found.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Username</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Role</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Created</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{user.username}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'secondary' : 'outline'}
                                      className="capitalize"
                                    >
                                      {user.role}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString('en-AU', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex justify-end">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleDeleteUser(user)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Create/Edit User Dialog */}
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                      <DialogDescription>
                        {editingUser ? "Update user role or password." : "Create a new user account with a username, password, and role."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                          value={userFormData.username}
                          onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                          placeholder="Enter username"
                          disabled={!!editingUser}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select
                          value={userFormData.role}
                          onValueChange={(value) => setUserFormData({ ...userFormData, role: value as "admin" | "editor" | "viewer" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitUser}
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                      >
                        {editingUser ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account for <strong>{userToDelete?.username}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDeleteUser}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteUserMutation.isPending}
                      >
                        {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && userRole === 'admin' && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <Settings />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}