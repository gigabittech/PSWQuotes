-- First, check current email logs
SELECT id, status, subject, recipient, sent_at 
FROM email_logs 
ORDER BY sent_at DESC 
LIMIT 10;

-- Update the most recent email log to 'sent' status
-- Replace 'YOUR_EMAIL_LOG_ID' with an actual ID from the query above
UPDATE email_logs 
SET status = 'sent', 
    error_message = NULL 
WHERE id = (SELECT id FROM email_logs ORDER BY sent_at DESC LIMIT 1);

-- Or update a specific email log by ID
-- UPDATE email_logs 
-- SET status = 'sent', 
--     error_message = NULL 
-- WHERE id = 'YOUR_EMAIL_LOG_ID';

-- Verify the update
SELECT id, status, subject, recipient, sent_at 
FROM email_logs 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 5;

