import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import type { Quote, Product } from '@shared/schema';
import { storage } from '../storage';
import { generateQuotePDF } from '../pdfGenerator';

const brevoApi = new TransactionalEmailsApi();

if (!process.env.BREVO_API_KEY) {
  console.warn("BREVO_API_KEY environment variable not set");
} else {
  brevoApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export type EmailType = 'quote' | 'follow_up' | 'confirmation' | 'welcome';

class EmailService {
  async sendQuoteEmail(quote: Quote, pdfBuffer?: Buffer): Promise<boolean> {
    return this.sendEmail(quote, 'quote', pdfBuffer);
  }

  async sendFollowUpEmail(quote: Quote): Promise<boolean> {
    return this.sendEmail(quote, 'follow_up');
  }

  async sendConfirmationEmail(quote: Quote): Promise<boolean> {
    return this.sendEmail(quote, 'confirmation');
  }

  async retryEmail(emailLogId: string, pdfBuffer?: Buffer): Promise<boolean> {
    try {
      // Get the email log
      const emailLog = await storage.getEmailLogById(emailLogId);
      
      if (!emailLog) {
        throw new Error('Email log not found');
      }

      if (!emailLog.quoteId) {
        throw new Error('Email log does not have an associated quote');
      }

      // Get the quote
      const quote = await storage.getQuote(emailLog.quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      // Resend the email based on the email type
      const emailType = emailLog.emailType as EmailType;
      
      if (emailType === 'quote') {
        // Generate PDF for quote emails if not provided
        const pdf = pdfBuffer || await generateQuotePDF(quote);
        return await this.sendEmail(quote, 'quote', pdf);
      } else if (emailType === 'follow_up') {
        return await this.sendEmail(quote, 'follow_up');
      } else if (emailType === 'confirmation') {
        return await this.sendEmail(quote, 'confirmation');
      } else {
        throw new Error(`Unsupported email type for retry: ${emailType}`);
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      throw error;
    }
  }

  private async sendEmail(quote: Quote, emailType: EmailType, pdfBuffer?: Buffer): Promise<boolean> {
    if (!process.env.BREVO_API_KEY) {
      console.log("Brevo not configured - skipping email");
      return false;
    }

    try {
      const emailContent = await this.generateEmailContent(quote, emailType);
      
      // Handle PDF attachment from Buffer
      const attachments = pdfBuffer ? [{
        content: pdfBuffer.toString('base64'),
        name: `Perth_Solar_Quote_${quote.id.split('-')[0].toUpperCase()}.pdf`
      }] : undefined;

      const result = await brevoApi.sendTransacEmail({
        to: [{ email: quote.email, name: `${quote.firstName} ${quote.lastName}` }],
        sender: { 
          email: process.env.FROM_EMAIL || 'quotes@perthsolarwarehouse.com.au',
          name: 'Perth Solar Warehouse'
        },
        subject: emailContent.subject,
        textContent: emailContent.text,
        htmlContent: emailContent.html,
        attachment: attachments,
        replyTo: {
          email: 'info@perthsolarwarehouse.com.au',
          name: 'Perth Solar Warehouse Support'
        }
      });

      console.log(`${emailType} email sent successfully to ${quote.email}`);
      
      // Log successful send to database
      await storage.createEmailLog({
        quoteId: quote.id,
        emailType,
        recipient: quote.email,
        subject: emailContent.subject,
        status: 'sent',
      });
      
      return true;
    } catch (error) {
      console.error(`Brevo ${emailType} email error:`, error);
      
      // Log failed attempt to database
      const emailContent = await this.generateEmailContent(quote, emailType);
      await storage.createEmailLog({
        quoteId: quote.id,
        emailType,
        recipient: quote.email,
        subject: emailContent.subject,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return false;
    }
  }

  private async generateEmailContent(quote: Quote, emailType: EmailType): Promise<EmailTemplate> {
    switch (emailType) {
      case 'quote':
        return this.generateQuoteEmailContent(quote);
      case 'follow_up':
        return this.generateFollowUpEmailContent(quote);
      case 'confirmation':
        return this.generateConfirmationEmailContent(quote);
      default:
        throw new Error(`Unsupported email type: ${emailType}`);
    }
  }

  private async generateQuoteEmailContent(quote: Quote): Promise<EmailTemplate> {
    // Fetch detailed product information
    const selectedProducts: { product: Product; type: string }[] = [];
    
    if (quote.solarPackage) {
      const product = await storage.getProduct(quote.solarPackage);
      if (product) selectedProducts.push({ product, type: 'solar' });
    }
    
    if (quote.batterySystem) {
      const product = await storage.getProduct(quote.batterySystem);
      if (product) selectedProducts.push({ product, type: 'battery' });
    }
    
    if (quote.evCharger) {
      const product = await storage.getProduct(quote.evCharger);
      if (product) selectedProducts.push({ product, type: 'ev' });
    }

    const systemTypes = quote.selectedSystems.map(s => 
      s === 'solar' ? 'Solar Power' : 
      s === 'battery' ? 'Battery Storage' : 
      s === 'ev' ? 'EV Charging' : s
    ).join(' + ');

    const quoteId = quote.id.split('-')[0].toUpperCase();
    
    const text = `
Dear ${quote.firstName} ${quote.lastName},

🎉 Great news! Your personalized solar quote from Perth Solar Warehouse is ready.

QUOTE #${quoteId} SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Systems Selected: ${systemTypes}
Installation Address: ${quote.address}, ${quote.suburb}, ${quote.state} ${quote.postcode}
Power Supply: ${quote.powerSupply.charAt(0).toUpperCase() + quote.powerSupply.slice(1)} Phase

SELECTED PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${selectedProducts.map(({ product, type }) => `${type === 'solar' ? '☀️' : type === 'battery' ? '🔋' : '⚡'} ${product.name} - ${product.capacity} - $${parseFloat(product.price).toLocaleString()}`).join('\n')}

INVESTMENT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total System Price: $${parseFloat(quote.totalPrice).toLocaleString()}
Government Rebates: -$${parseFloat(quote.rebateAmount).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR INVESTMENT: $${parseFloat(quote.finalPrice).toLocaleString()}

WHAT HAPPENS NEXT?
1. 📞 Our solar consultant will contact you within 24 hours
2. 📋 We'll schedule a FREE site assessment at your convenience
3. ⚡ Professional installation with minimal disruption to your home
4. 🎯 Start saving on your electricity bills immediately!

WHY CHOOSE PERTH SOLAR WAREHOUSE?
✓ 20+ years experience in Western Australia
✓ Licensed Electrical Contractor (EC010771)
✓ 4.9/5 star rating from 1,500+ customers
✓ Premium quality components with comprehensive warranties
✓ No pressure sales - honest, transparent service

QUESTIONS? We're here to help!
📞 Call: (08) 6171 4111
📧 Reply to this email
🌐 Visit: www.perthsolarwarehouse.com.au

Best regards,
The Perth Solar Warehouse Team

*This quote is valid for 30 days. Terms and conditions apply.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Solar Quote - Perth Solar Warehouse</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            position: relative;
        }
        .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: bold; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p { 
            margin: 10px 0 0 0; 
            font-size: 18px; 
            opacity: 0.9;
        }
        .content { 
            padding: 30px 20px; 
        }
        .greeting { 
            font-size: 18px; 
            margin-bottom: 20px; 
            color: #1f2937;
        }
        .quote-header {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .quote-id {
            font-size: 24px;
            font-weight: bold;
            color: #1d4ed8;
            margin-bottom: 10px;
        }
        .system-types {
            font-size: 18px;
            color: #374151;
            margin-bottom: 15px;
        }
        .address {
            color: #6b7280;
            font-size: 14px;
        }
        .products-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #10b981;
        }
        .products-section h3 {
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .product {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .product:last-child { margin-bottom: 0; }
        .product-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .product-details {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .product-price {
            color: #059669;
            font-weight: bold;
            font-size: 16px;
        }
        .pricing-table {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 2px solid #0ea5e9;
        }
        .pricing-table h3 {
            color: #0c4a6e;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
            font-size: 20px;
        }
        .pricing-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #bae6fd;
        }
        .pricing-row:last-child {
            border-bottom: none;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            margin: 15px -25px -25px -25px;
            padding: 20px 25px;
            border-radius: 0 0 10px 10px;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        .pricing-label { color: #374151; }
        .pricing-value { 
            font-weight: bold; 
            color: #1f2937;
        }
        .discount { color: #dc2626; }
        .steps {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #f59e0b;
        }
        .steps h3 {
            color: #92400e;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .steps ol {
            margin: 0;
            padding-left: 20px;
            color: #78350f;
        }
        .steps li {
            margin-bottom: 10px;
            font-weight: 500;
        }
        .benefits {
            background: #f0fdf4;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #22c55e;
        }
        .benefits h3 {
            color: #14532d;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .benefits ul {
            margin: 0;
            padding-left: 0;
            list-style: none;
            color: #166534;
        }
        .benefits li {
            margin-bottom: 8px;
            padding-left: 25px;
            position: relative;
        }
        .benefits li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: bold;
            font-size: 16px;
        }
        .contact-info {
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
            border: 2px solid #8b5cf6;
        }
        .contact-info h3 {
            color: #581c87;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .contact-methods {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 15px;
        }
        .contact-method {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 150px;
        }
        .contact-method strong {
            color: #6b21a8;
            display: block;
            margin-bottom: 5px;
        }
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .footer .credentials {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 15px;
        }
        @media (max-width: 600px) {
            .contact-methods { flex-direction: column; }
            .contact-method { min-width: auto; }
            .pricing-row { flex-direction: column; align-items: flex-start; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏡 PERTH SOLAR WAREHOUSE</h1>
            <p>Your Solar Quote is Ready! 🎉</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear ${quote.firstName} ${quote.lastName},
            </div>
            
            <p>Great news! Your personalized solar quote is ready. We've carefully selected the perfect solar solution for your home based on your requirements.</p>
            
            <div class="quote-header">
                <div class="quote-id">Quote #${quoteId}</div>
                <div class="system-types">${systemTypes}</div>
                <div class="address">📍 ${quote.address}, ${quote.suburb}, ${quote.state} ${quote.postcode}</div>
                <div class="address">⚡ ${quote.powerSupply.charAt(0).toUpperCase() + quote.powerSupply.slice(1)} Phase Power Supply</div>
            </div>
            
            ${selectedProducts.length > 0 ? `
            <div class="products-section">
                <h3>🛠️ Your Selected Products</h3>
                ${selectedProducts.map(({ product, type }) => `
                <div class="product">
                    <div class="product-name">
                        ${type === 'solar' ? '☀️' : type === 'battery' ? '🔋' : '⚡'} ${product.name}
                    </div>
                    <div class="product-details">
                        Capacity: ${product.capacity} | Warranty: ${product.warranty}
                    </div>
                    <div class="product-price">$${parseFloat(product.price).toLocaleString()}</div>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="pricing-table">
                <h3>💰 Investment Summary</h3>
                <div class="pricing-row">
                    <span class="pricing-label">Total System Price</span>
                    <span class="pricing-value">$${parseFloat(quote.totalPrice).toLocaleString()}</span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">Government Rebates & Incentives</span>
                    <span class="pricing-value discount">-$${parseFloat(quote.rebateAmount).toLocaleString()}</span>
                </div>
                <div class="pricing-row">
                    <span>YOUR TOTAL INVESTMENT</span>
                    <span>$${parseFloat(quote.finalPrice).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="steps">
                <h3>🚀 What Happens Next?</h3>
                <ol>
                    <li>📞 Our solar consultant will contact you within 24 hours</li>
                    <li>📋 We'll schedule a FREE site assessment at your convenience</li>
                    <li>⚡ Professional installation with minimal disruption</li>
                    <li>🎯 Start saving on your electricity bills immediately!</li>
                </ol>
            </div>
            
            <div class="benefits">
                <h3>🏆 Why Choose Perth Solar Warehouse?</h3>
                <ul>
                    <li>20+ years experience in Western Australia</li>
                    <li>Licensed Electrical Contractor (EC010771)</li>
                    <li>4.9/5 star rating from 1,500+ satisfied customers</li>
                    <li>Premium quality components with comprehensive warranties</li>
                    <li>No pressure sales - honest, transparent service</li>
                    <li>Local Perth business supporting WA families</li>
                </ul>
            </div>
            
            <div class="contact-info">
                <h3>💬 Questions? We're Here to Help!</h3>
                <div class="contact-methods">
                    <div class="contact-method">
                        <strong>📞 Call Us</strong>
                        (08) 6171 4111
                    </div>
                    <div class="contact-method">
                        <strong>📧 Email Us</strong>
                        Reply to this email
                    </div>
                    <div class="contact-method">
                        <strong>🌐 Visit Website</strong>
                        perthsolarwarehouse.com.au
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>The Perth Solar Warehouse Team</strong></p>
            <p>Making Solar Simple for Western Australian Families</p>
            <div class="credentials">
                Licensed Electrical Contractor EC010771 | ABN: 12 345 678 901<br>
                This quote is valid for 30 days. Terms and conditions apply.
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return {
      subject: `🏡 Your Solar Quote #${quoteId} is Ready - Perth Solar Warehouse`,
      text,
      html
    };
  }

  private generateFollowUpEmailContent(quote: Quote): EmailTemplate {
    const quoteId = quote.id.split('-')[0].toUpperCase();
    
    return {
      subject: `🌟 Follow-up: Your Solar Quote #${quoteId} - Perth Solar Warehouse`,
      text: `Hi ${quote.firstName}, we wanted to follow up on your solar quote...`,
      html: `<p>Follow-up email content for ${quote.firstName} ${quote.lastName}</p>`
    };
  }

  private generateConfirmationEmailContent(quote: Quote): EmailTemplate {
    const quoteId = quote.id.split('-')[0].toUpperCase();
    
    return {
      subject: `✅ Quote #${quoteId} Confirmed - Perth Solar Warehouse`,
      text: `Hi ${quote.firstName}, your solar quote has been confirmed...`,
      html: `<p>Confirmation email content for ${quote.firstName} ${quote.lastName}</p>`
    };
  }
}

export const emailService = new EmailService();
