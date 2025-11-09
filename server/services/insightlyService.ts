import type { Quote } from "@shared/schema";

const INSIGHTLY_API_KEY = process.env.INSIGHTLY_API_KEY;
const INSIGHTLY_API_URL = "https://api.na1.insightly.com/v3.1";

interface InsightlyLead {
  LEAD_ID?: number;
  FIRST_NAME?: string;
  LAST_NAME: string;
  EMAIL?: string;
  PHONE?: string;
  MOBILE?: string;
  ORGANIZATION_NAME?: string;
  LEAD_DESCRIPTION?: string;
  ADDRESS_STREET?: string;
  ADDRESS_CITY?: string;
  ADDRESS_STATE?: string;
  ADDRESS_POSTCODE?: string;
  LEAD_RATING?: number;
  CUSTOMFIELDS?: Array<{
    FIELD_NAME: string;
    FIELD_VALUE: string | number;
  }>;
  TAGS?: Array<{
    TAG_NAME: string;
  }>;
}

export class InsightlyService {
  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    if (!INSIGHTLY_API_KEY) {
      throw new Error("INSIGHTLY_API_KEY is not configured");
    }

    const url = `${INSIGHTLY_API_URL}${endpoint}`;
    const auth = Buffer.from(`${INSIGHTLY_API_KEY}:`).toString("base64");

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Insightly API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  async createLead(quoteData: Quote): Promise<string> {
    const selectedSystemsText = quoteData.selectedSystems
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(", ");

    const productDetails = [];
    if (quoteData.solarPackage) {
      productDetails.push(`Solar: ${quoteData.solarPackage}`);
    }
    if (quoteData.batterySystem) {
      productDetails.push(`Battery: ${quoteData.batterySystem}`);
    }
    if (quoteData.evCharger) {
      productDetails.push(`EV Charger: ${quoteData.evCharger}`);
    }

    const leadDescription = `
Quote Request for ${selectedSystemsText}
Power Supply: ${quoteData.powerSupply === "single" ? "Single Phase" : quoteData.powerSupply === "three" ? "Three Phase" : "Unknown"}
Products: ${productDetails.join(", ")}
Total Price: $${quoteData.totalPrice}
Rebate Amount: $${quoteData.rebateAmount}
Final Price: $${quoteData.finalPrice}
${quoteData.additionalInfo ? `Additional Info: ${quoteData.additionalInfo}` : ""}
    `.trim();

    const leadData: InsightlyLead = {
      FIRST_NAME: quoteData.firstName,
      LAST_NAME: quoteData.lastName,
      EMAIL: quoteData.email,
      PHONE: quoteData.phone || undefined,
      LEAD_DESCRIPTION: leadDescription,
      ADDRESS_STREET: quoteData.address,
      ADDRESS_CITY: quoteData.suburb,
      ADDRESS_STATE: quoteData.state,
      ADDRESS_POSTCODE: quoteData.postcode,
      LEAD_RATING: 5,
      TAGS: [
        { TAG_NAME: "PerthSolarWarehouse" },
        { TAG_NAME: "QuoteRequest" },
        ...quoteData.selectedSystems.map((s: string) => ({
          TAG_NAME: s.charAt(0).toUpperCase() + s.slice(1),
        })),
      ],
      CUSTOMFIELDS: [
        {
          FIELD_NAME: "Quote_ID__c",
          FIELD_VALUE: quoteData.id,
        },
        {
          FIELD_NAME: "Total_Quote_Value__c",
          FIELD_VALUE: parseFloat(quoteData.finalPrice),
        },
      ],
    };

    try {
      const result = await this.makeRequest("POST", "/Leads", leadData);
      return result.LEAD_ID.toString();
    } catch (error) {
      console.error("Failed to create Insightly lead:", error);
      throw error;
    }
  }

  async updateLead(leadId: string, updates: Partial<InsightlyLead>): Promise<void> {
    try {
      await this.makeRequest("PUT", `/Leads/${leadId}`, updates);
    } catch (error) {
      console.error(`Failed to update Insightly lead ${leadId}:`, error);
      throw error;
    }
  }
}

export const insightlyService = new InsightlyService();
