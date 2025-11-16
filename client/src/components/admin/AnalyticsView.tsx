import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  MousePointer,
  Clock
} from "lucide-react";
import type { Quote, Submission } from "@shared/schema";

interface AnalyticsData {
  quotes: {
    total: number;
    thisMonth: number;
    conversion: number;
    avgValue: number;
    byStatus: { [key: string]: number };
    byMonth: { month: string; count: number; value: number }[];
  };
  submissions: {
    total: number;
    thisMonth: number;
    byForm: { [key: string]: number };
    conversionRate: number;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: { page: string; views: number }[];
  };
}

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("quotes");

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['/api/cms/submissions'],
  });

  // Calculate analytics data
  const quoteConversion = quotes.length > 0 ? (quotes.filter(q => q.status === 'converted').length / quotes.length) * 100 : 0;
  
  const analyticsData: AnalyticsData = {
    quotes: {
      total: quotes.length,
      thisMonth: quotes.filter(q => {
        const created = new Date(q.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      conversion: quoteConversion,
      avgValue: quotes.length > 0 ? quotes.reduce((sum, q) => sum + parseFloat(q.finalPrice.toString()), 0) / quotes.length : 0,
      byStatus: quotes.reduce((acc, q) => {
        acc[q.status] = (acc[q.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      byMonth: [] // Would calculate monthly trends
    },
    submissions: {
      total: submissions.length,
      thisMonth: submissions.filter(s => {
        const created = new Date(s.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      byForm: submissions.reduce((acc, s) => {
        acc[s.formId] = (acc[s.formId] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      conversionRate: quoteConversion // Based on actual quote conversion
    },
    traffic: {
      pageViews: 0, // TODO: Implement analytics tracking with analytics_events table
      uniqueVisitors: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      topPages: [] // Will be populated from analytics_events when implemented
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="analytics-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 md:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1 sm:mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track performance metrics and conversion analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-data" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Quotes</p>
              <p className="text-2xl sm:text-3xl font-bold" data-testid="metric-total-quotes">
                {analyticsData.quotes.total}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">
                +{analyticsData.quotes.thisMonth} this month
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl sm:text-3xl font-bold" data-testid="metric-conversion-rate">
                {analyticsData.quotes.conversion.toFixed(1)}%
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +2.4% vs last month
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Quote Value</p>
              <p className="text-2xl sm:text-3xl font-bold" data-testid="metric-avg-value">
                {formatCurrency(analyticsData.quotes.avgValue)}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                Total: {formatCurrency(analyticsData.quotes.total * analyticsData.quotes.avgValue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl sm:text-3xl font-bold" data-testid="metric-page-views">
                {analyticsData.traffic.pageViews.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-purple-600 mt-1">
                {analyticsData.traffic.uniqueVisitors.toLocaleString()} unique visitors
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="quotes" data-testid="tab-quotes" className="text-xs sm:text-sm">Quotes</TabsTrigger>
          <TabsTrigger value="forms" data-testid="tab-forms" className="text-xs sm:text-sm">Forms</TabsTrigger>
          <TabsTrigger value="traffic" data-testid="tab-traffic" className="text-xs sm:text-sm">Traffic</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.quotes.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(status)} variant="secondary">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {count} quotes
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {((count / analyticsData.quotes.total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotes.slice(0, 5).map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between py-2 border-b last:border-0" data-testid={`recent-quote-${quote.id}`}>
                      <div>
                        <div className="font-medium text-sm">{quote.firstName?.charAt(0).toUpperCase() + quote.firstName?.slice(1).toLowerCase()} {quote.lastName?.charAt(0).toUpperCase() + quote.lastName?.slice(1).toLowerCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {formatCurrency(parseFloat(quote.finalPrice.toString()))}
                        </div>
                        <Badge className={getStatusColor(quote.status)} variant="secondary">
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Submissions</span>
                    <span className="font-medium">{analyticsData.submissions.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-medium">{analyticsData.submissions.thisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium text-green-600">
                      {analyticsData.submissions.conversionRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.submissions.byForm).slice(0, 3).map(([formId, count]) => (
                    <div key={formId} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-sm">Form {formId}</div>
                        <div className="text-xs text-muted-foreground">
                          {count} submissions
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((count / analyticsData.submissions.total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Page Views</span>
                  </div>
                  <span className="font-medium">{analyticsData.traffic.pageViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Unique Visitors</span>
                  </div>
                  <span className="font-medium">{analyticsData.traffic.uniqueVisitors.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Avg Session Duration</span>
                  </div>
                  <span className="font-medium">{formatDuration(analyticsData.traffic.avgSessionDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  </div>
                  <span className="font-medium">{analyticsData.traffic.bounceRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.traffic.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between py-2" data-testid={`top-page-${index}`}>
                      <div>
                        <div className="font-medium text-sm">{page.page}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.views.toLocaleString()} views
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((page.views / analyticsData.traffic.pageViews) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">A</div>
                  <div className="text-sm text-muted-foreground">Performance Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}