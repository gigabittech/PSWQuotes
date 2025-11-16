import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Building, Lock, Sun, Zap, Shield, Menu } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import type { User } from "@shared/schema";

const ADMIN_TAB_STORAGE_KEY = "admin_active_tab";

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Load activeTab from localStorage on mount, default to "overview"
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_TAB_STORAGE_KEY) || "overview";
    }
    return "overview";
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_TAB_STORAGE_KEY, activeTab);
    }
  }, [activeTab]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: authResponse, isLoading: isCheckingAuth, error: authError } = useQuery<{user: User}>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  // Extract user from response structure
  const user = authResponse?.user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard!",
      });
      // Force refresh all auth-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      loginMutation.mutate({ username: username.trim(), password });
    }
  };

  // Loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
        
        {/* Header */}
        <header className="relative bg-white/80 backdrop-blur-sm shadow-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                {/* Enhanced Logo */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <Sun className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Perth Solar Warehouse
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium">Solar Energy Solutions</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
                  data-testid="link-quote-form"
                >
                  ← Back to Quote Form
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="relative flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
          <div className="w-full max-w-md">
            {/* Main Login Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-8 pt-8">
                {/* Logo Section in Form */}
                <div className="mx-auto mb-6 relative">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl">
                    <div className="relative">
                      <Sun className="h-10 w-10 text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </CardTitle>
                <p className="text-muted-foreground text-base">
                  Sign in to access your admin dashboard
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      className="h-12 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      data-testid="input-password"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loginMutation.isPending || !username.trim() || !password.trim()}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign in to Dashboard
                      </>
                    )}
                  </Button>
                </form>
                
                {/* Development-only credentials hint */}
                {import.meta.env.DEV && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      <p className="text-xs font-medium text-slate-600">Development Mode</p>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Username: <span className="font-mono font-medium">admin</span> | 
                      Password: <span className="font-mono font-medium">admin123</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info Cards */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                <Sun className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Solar</p>
              </div>
              <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                <Zap className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Energy</p>
              </div>
              <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="w-full">
          <div className="flex justify-between items-center h-16 sm:h-20 px-2 sm:px-4 lg:px-6">
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Enhanced Logo in Header */}
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-md">
                  <Sun className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="h-1.5 w-1.5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  Perth Solar Warehouse
                </h1>
                <span className="text-xs text-muted-foreground font-medium leading-tight">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hamburger Menu for Mobile */}
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                  <div className="p-4 sm:p-6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground">CMS Admin</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Perth Solar Warehouse</p>
                      </div>
                    </div>
                  </div>
                  <AdminDashboard mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} showOnlySidebar={true} activeTab={activeTab} setActiveTab={setActiveTab} />
                </SheetContent>
              </Sheet>
              
              {/* Back button - hidden on small screens when hamburger menu is visible */}
              <a 
                href="/" 
                className="hidden lg:inline-flex text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 whitespace-nowrap"
                data-testid="link-quote-form"
              >
                ← Back to Quote Form
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 sm:pt-20">
        <AdminDashboard mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
