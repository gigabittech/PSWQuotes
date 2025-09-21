import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema, insertProductSchema } from "@shared/schema";
import { sendEmail } from "./sendgrid";
import { generateQuotePDF } from "./pdfGenerator";
import multer from "multer";
import { z } from "zod";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get products by type
  app.get("/api/products/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const products = await storage.getProductsByType(type);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by type:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Create a new quote
  app.post("/api/quotes", upload.single('switchboardPhoto'), async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      
      // Handle file upload if present
      if (req.file) {
        validatedData.switchboardPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const quote = await storage.createQuote(validatedData);

      // Generate PDF
      const pdfBuffer = await generateQuotePDF(quote);
      
      // Send email with quote
      const emailSent = await sendEmail(
        process.env.SENDGRID_API_KEY || "",
        {
          to: quote.email,
          from: "quotes@perthsolarwarehouse.com.au",
          subject: "Your Solar Quote from Perth Solar Warehouse",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #3b82f6;">Your Solar Quote is Ready!</h1>
              <p>Dear ${quote.customerName},</p>
              <p>Thank you for your interest in Perth Solar Warehouse. Your personalized solar quote is attached to this email.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Quote Summary:</h3>
                <p><strong>Total Investment:</strong> $${quote.finalPrice}</p>
                <p><strong>After Rebates:</strong> $${quote.rebateAmount} savings</p>
                <p><strong>Systems Selected:</strong> ${quote.selectedSystems.join(', ')}</p>
              </div>
              <p>Our team will contact you within 24 hours to discuss your quote and answer any questions.</p>
              <p>Best regards,<br>Perth Solar Warehouse Team<br>(08) 6171 4111</p>
            </div>
          `,
        }
      );

      if (!emailSent) {
        console.error("Failed to send email to customer");
      }

      res.json({ quote, emailSent });
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(400).json({ error: "Failed to create quote" });
    }
  });

  // Get all quotes (admin)
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  // Get single quote
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const items = await storage.getQuoteItems(id);
      res.json({ ...quote, items });
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // Update quote status
  app.put("/api/quotes/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const quote = await storage.updateQuoteStatus(id, status);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      res.json(quote);
    } catch (error) {
      console.error("Error updating quote status:", error);
      res.status(500).json({ error: "Failed to update quote status" });
    }
  });

  // Generate and download PDF for a quote
  app.get("/api/quotes/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const pdfBuffer = await generateQuotePDF(quote);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="quote-${quote.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Create product (admin)
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Failed to create product" });
    }
  });

  // Real-time pricing calculation
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { selectedSystems, solarPackage, batterySystem, evCharger, powerSupply } = req.body;
      
      let totalPrice = 0;
      let rebateAmount = 0;
      
      // Calculate solar pricing
      if (selectedSystems.includes('solar') && solarPackage) {
        const solarProduct = await storage.getProduct(solarPackage);
        if (solarProduct) {
          totalPrice += parseFloat(solarProduct.price);
          if (solarProduct.rebateEligible && solarProduct.rebateAmount) {
            rebateAmount += parseFloat(solarProduct.rebateAmount);
          }
        }
      }
      
      // Calculate battery pricing
      if (selectedSystems.includes('battery') && batterySystem) {
        const batteryProduct = await storage.getProduct(batterySystem);
        if (batteryProduct) {
          totalPrice += parseFloat(batteryProduct.price);
          if (batteryProduct.rebateEligible && batteryProduct.rebateAmount) {
            rebateAmount += parseFloat(batteryProduct.rebateAmount);
          }
        }
      }
      
      // Calculate EV charger pricing
      if (selectedSystems.includes('ev') && evCharger) {
        const evProduct = await storage.getProduct(evCharger);
        if (evProduct) {
          totalPrice += parseFloat(evProduct.price);
        }
      }
      
      const finalPrice = totalPrice - rebateAmount;
      
      res.json({
        totalPrice,
        rebateAmount,
        finalPrice,
        breakdown: {
          solar: selectedSystems.includes('solar') ? await storage.getProduct(solarPackage) : null,
          battery: selectedSystems.includes('battery') ? await storage.getProduct(batterySystem) : null,
          ev: selectedSystems.includes('ev') ? await storage.getProduct(evCharger) : null,
        }
      });
    } catch (error) {
      console.error("Error calculating pricing:", error);
      res.status(500).json({ error: "Failed to calculate pricing" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
