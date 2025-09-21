import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

const brevoApi = new TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
  brevoApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
} else {
  console.warn("BREVO_API_KEY environment variable not set - email functionality disabled");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) {
    console.log('Brevo not configured - email not sent');
    return false;
  }
  
  try {
    await brevoApi.sendTransacEmail({
      to: [{ email: params.to }],
      sender: { email: params.from, name: 'Perth Solar Warehouse' },
      subject: params.subject,
      textContent: params.text,
      htmlContent: params.html,
      attachment: params.attachments?.map(att => ({
        content: att.content,
        name: att.filename
      }))
    });
    return true;
  } catch (error) {
    console.error('Brevo email error:', error);
    return false;
  }
}
