import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import type { Quote } from '@shared/schema';

const brevoApi = new TransactionalEmailsApi();

if (!process.env.BREVO_API_KEY) {
  console.warn("BREVO_API_KEY environment variable not set");
} else {
  brevoApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

class EmailService {
  async sendQuoteEmail(quote: Quote, pdfPath?: string): Promise<boolean> {
    if (!process.env.BREVO_API_KEY) {
      console.log("Brevo not configured - quote email not sent");
      return false;
    }

    try {
      const emailContent = this.generateQuoteEmailContent(quote);
      
      const attachments = pdfPath ? [{
        content: require('fs').readFileSync(pdfPath).toString('base64'),
        name: `Solar_Quote_${quote.id}.pdf`
      }] : undefined;

      await brevoApi.sendTransacEmail({
        to: [{ email: quote.email }],
        sender: { 
          email: process.env.FROM_EMAIL || 'quotes@perthsolarwarehouse.com.au',
          name: 'Perth Solar Warehouse'
        },
        subject: `Your Solar Quote - Perth Solar Warehouse`,
        textContent: emailContent.text,
        htmlContent: emailContent.html,
        attachment: attachments
      });
      console.log(`Quote email sent successfully to ${quote.email}`);
      return true;
    } catch (error) {
      console.error('Brevo email error:', error);
      return false;
    }
  }

  private generateQuoteEmailContent(quote: Quote) {
    const systemTypes = quote.selectedSystems.join(', ');
    
    const text = `
Dear ${quote.customerName},

Thank you for your interest in Perth Solar Warehouse! Your personalized solar quote is ready.

Quote Summary:
- System Types: ${systemTypes}
- Installation Address: ${quote.address}, ${quote.suburb}, ${quote.state} ${quote.postcode}
- System Price: $${quote.totalPrice}
- Rebate Applied: $${quote.rebateAmount}
- Final Investment: $${quote.finalPrice}

What's Next:
1. Our team will contact you within 24 hours to discuss your quote
2. We'll schedule a site assessment at your convenience  
3. Professional installation with minimal disruption

Questions? Reply to this email or call us at (08) 6171 4111.

Best regards,
Perth Solar Warehouse Team
Licensed Electrical Contractor EC010771
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .quote-summary { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .price-highlight { font-size: 24px; font-weight: bold; color: #2563eb; }
        .steps { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Perth Solar Warehouse</h1>
        <p>Your Solar Quote is Ready!</p>
    </div>
    
    <div class="content">
        <h2>Dear ${quote.customerName},</h2>
        <p>Thank you for your interest in Perth Solar Warehouse! Your personalized solar quote is ready.</p>
        
        <div class="quote-summary">
            <h3>Quote Summary</h3>
            <p><strong>System Types:</strong> ${systemTypes}</p>
            <p><strong>Installation Address:</strong> ${quote.address}, ${quote.suburb}, ${quote.state} ${quote.postcode}</p>
            <p><strong>System Price:</strong> $${quote.totalPrice}</p>
            <p><strong>Rebate Applied:</strong> $${quote.rebateAmount}</p>
            <p><strong>Final Investment:</strong> <span class="price-highlight">$${quote.finalPrice}</span></p>
        </div>
        
        <div class="steps">
            <h3>What's Next?</h3>
            <ol>
                <li>Our team will contact you within 24 hours to discuss your quote</li>
                <li>We'll schedule a site assessment at your convenience</li>
                <li>Professional installation with minimal disruption</li>
            </ol>
        </div>
        
        <p>Questions? Reply to this email or call us at <strong>(08) 6171 4111</strong>.</p>
    </div>
    
    <div class="footer">
        <p>Perth Solar Warehouse Team<br>
        Licensed Electrical Contractor EC010771<br>
        4.9/5 from 1500+ reviews</p>
    </div>
</body>
</html>
    `;

    return { text, html };
  }
}

export const emailService = new EmailService();
