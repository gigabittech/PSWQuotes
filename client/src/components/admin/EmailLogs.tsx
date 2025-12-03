import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, CheckCircle, XCircle, Clock, RotateCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailLog {
  id: string;
  quoteId: string | null;
  emailType: string;
  recipient: string;
  subject: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
}

interface EmailLogsResponse {
  data: EmailLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EmailLogs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const { data: emailLogsResponse, isLoading } = useQuery<EmailLogsResponse | EmailLog[]>({
    queryKey: ['/api/email-logs', currentPage, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      const response = await fetch(`/api/email-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email logs');
      }
      return response.json();
    },
  });

  // Handle both paginated response and legacy array response
  const isPaginated = emailLogsResponse && !Array.isArray(emailLogsResponse);
  const emailLogs = isPaginated ? (emailLogsResponse as EmailLogsResponse).data : (emailLogsResponse as EmailLog[] || []);
  const totalLogs = isPaginated ? (emailLogsResponse as EmailLogsResponse).total : emailLogs.length;
  const totalPages = isPaginated ? (emailLogsResponse as EmailLogsResponse).totalPages : Math.ceil(totalLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalLogs);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

  const retryMutation = useMutation({
    mutationFn: async (emailLogId: string) => {
      const response = await apiRequest('POST', `/api/email-logs/${emailLogId}/retry`);
      return response.json();
    },
    onSuccess: () => {
      // Refresh the email logs after successful retry
      queryClient.invalidateQueries({ queryKey: ['/api/email-logs'] });
      toast({
        title: "Email sent successfully",
        description: "The email has been resent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to retry email",
        description: error.message || "An error occurred while retrying the email.",
        variant: "destructive",
      });
    },
  });

  const handleRetry = async (emailLogId: string) => {
    setRetryingIds(prev => new Set(prev).add(emailLogId));
    try {
      await retryMutation.mutateAsync(emailLogId);
    } catch (error) {
      // Error is handled by onError in mutation
    } finally {
      setRetryingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailLogId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading email logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Email Logs</h2>
        <p className="text-muted-foreground">
          Track all email sending attempts and delivery status
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="px-4 sm:px-6 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            Email History
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            View all email sending attempts with success and failure details
          </CardDescription>
     

        </CardHeader>
        <CardContent className="px-4 sm:px-6 flex-1 overflow-y-auto min-h-0">
          {emailLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No email logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  data-testid={`email-log-${log.id}`}
                >
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" data-testid="icon-email-sent" />
                    ) : (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" data-testid="icon-email-failed" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-1">
                      <Badge 
                        variant={log.status === 'sent' ? 'default' : 'destructive'}
                        className="text-xs"
                        data-testid={`badge-status-${log.status}`}
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs" data-testid={`badge-type-${log.emailType}`}>
                        {log.emailType.charAt(0).toUpperCase() + log.emailType.slice(1).replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="font-medium text-sm sm:text-base break-words" data-testid="text-email-subject">
                      {log.subject}
                    </p>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground break-all" data-testid="text-email-recipient">
                      To: {log.recipient}
                    </p>
                    
                    {log.quoteId && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid="text-quote-id">
                        Quote ID: {log.quoteId.split('-')[0].toUpperCase()}
                      </p>
                    )}
                    
                    {log.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200 break-words" data-testid="text-error-message">
                        <strong>Error:</strong> {log.errorMessage}
                      </div>
                    )}
                    
                    {log.status === 'failed' && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingIds.has(log.id)}
                          className="gap-2 w-full sm:w-auto"
                          data-testid={`button-retry-${log.id}`}
                        >
                          <RotateCw className={`h-3 w-3 ${retryingIds.has(log.id) ? 'animate-spin' : ''}`} />
                          {retryingIds.has(log.id) ? 'Retrying...' : 'Retry'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="hidden sm:block flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground whitespace-nowrap" data-testid="text-sent-time">
                      {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalLogs > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-0.5 flex-shrink-0 mt-2">
          {/* Left side - Info and page size selector */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {startIndex + 1} to {endIndex} of {totalLogs} email logs
            </div>
            <div className="flex items-center space-x-1.5">
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
  );
}
