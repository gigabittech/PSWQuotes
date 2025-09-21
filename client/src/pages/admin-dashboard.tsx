import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Quote } from "@/types/quote";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery<Quote[]>({
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'converted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  // Filter and search quotes
  const filteredQuotes = quotes?.filter((quote) => {
    const matchesSearch = !searchTerm || 
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="admin-dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: quotes?.length || 0,
    pending: quotes?.filter((q) => q.status === 'pending').length || 0,
    contacted: quotes?.filter((q) => q.status === 'contacted').length || 0,
    converted: quotes?.filter((q) => q.status === 'converted').length || 0,
    totalValue: quotes?.reduce((sum, q) => sum + parseFloat(q.finalPrice), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Perth Solar Warehouse</h1>
              <span className="text-sm text-muted-foreground">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-back-to-form"
              >
                Back to Quote Form
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8" data-testid="admin-dashboard">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Quote Management Dashboard</h1>

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

          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-search"
                />
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quotes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes ({filteredQuotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No quotes found matching your criteria.</p>
                </div>
              ) : (
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
                      {filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="border-b hover:bg-muted/50 transition-colors" data-testid={`quote-row-${quote.id}`}>
                          <td className="p-4 font-medium">{quote.customerName}</td>
                          <td className="p-4">{quote.email}</td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                              {quote.selectedSystems.map((system: string) => (
                                <Badge key={system} variant="secondary" className="text-xs">
                                  {system}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-semibold">{formatPrice(quote.finalPrice)}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString('en-AU', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                                title="Download PDF"
                              >
                                📥
                              </Button>
                              <Button
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(`mailto:${quote.email}?subject=Re: Your Solar Quote&body=Dear ${quote.customerName},%0A%0AThank you for your interest in Perth Solar Warehouse.`)}
                                data-testid={`button-email-customer-${quote.id}`}
                                title="Email Customer"
                              >
                                📧
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => quote.phone && window.open(`tel:${quote.phone}`)}
                                disabled={!quote.phone}
                                data-testid={`button-call-customer-${quote.id}`}
                                title="Call Customer"
                              >
                                📞
                              </Button>
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

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  data-testid="button-refresh"
                >
                  🔄 Refresh Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const csv = [
                      ['Customer Name', 'Email', 'Phone', 'Systems', 'Total Value', 'Status', 'Date'].join(','),
                      ...filteredQuotes.map(quote => [
                        quote.customerName,
                        quote.email,
                        quote.phone || '',
                        quote.selectedSystems.join(';'),
                        quote.finalPrice,
                        quote.status,
                        new Date(quote.createdAt).toLocaleDateString()
                      ].join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'solar-quotes.csv';
                    a.click();
                  }}
                  data-testid="button-export-csv"
                >
                  📊 Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const pending = quotes?.filter(q => q.status === 'pending') || [];
                    if (pending.length > 0) {
                      alert(`You have ${pending.length} pending quotes that need attention.`);
                    } else {
                      alert('All quotes have been processed!');
                    }
                  }}
                  data-testid="button-check-pending"
                >
                  ⚠️ Check Pending ({stats.pending})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
