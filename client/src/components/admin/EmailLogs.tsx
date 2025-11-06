import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const { data: emailLogs = [], isLoading } = useQuery<EmailLog[]>({
    queryKey: ['/api/email-logs'],
  });

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Logs</h2>
        <p className="text-muted-foreground">
          Track all email sending attempts and delivery status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
          <CardDescription>
            View all email sending attempts with success and failure details
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  data-testid={`email-log-${log.id}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" data-testid="icon-email-sent" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" data-testid="icon-email-failed" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={log.status === 'sent' ? 'default' : 'destructive'}
                        data-testid={`badge-status-${log.status}`}
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-type-${log.emailType}`}>
                        {log.emailType}
                      </Badge>
                    </div>
                    
                    <p className="font-medium text-sm" data-testid="text-email-subject">
                      {log.subject}
                    </p>
                    
                    <p className="text-sm text-muted-foreground" data-testid="text-email-recipient">
                      To: {log.recipient}
                    </p>
                    
                    {log.quoteId && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid="text-quote-id">
                        Quote ID: {log.quoteId.split('-')[0].toUpperCase()}
                      </p>
                    )}
                    
                    {log.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200" data-testid="text-error-message">
                        <strong>Error:</strong> {log.errorMessage}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground" data-testid="text-sent-time">
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
