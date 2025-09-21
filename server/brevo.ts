import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY environment variable must be set");
}

const brevoApi = new TransactionalEmailsApi();
brevoApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

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
