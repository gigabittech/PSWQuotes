import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle, Clock, RotateCw } from "lucide-react";
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

export default function EmailLogs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  
  const { data: emailLogs = [], isLoading } = useQuery<EmailLog[]>({
    queryKey: ['/api/email-logs'],
  });

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
    <div className="space-y-6">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Email Logs</h2>
        <p className="text-muted-foreground">
          Track all email sending attempts and delivery status
        </p>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            Email History
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            View all email sending attempts with success and failure details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
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
    </div>
  );
}
