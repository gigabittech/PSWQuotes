import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema, insertProductSchema, insertUserSchemaWithRole } from "@shared/schema";
import { emailService } from "./services/emailService";
import { generateQuotePDF } from "./pdfGenerator";
import multer from "multer";
import { z } from "zod";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";

const upload = multer({ dest: "uploads/" });

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      next();
    } catch (error) {
      console.error("Error checking user role:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Regenerate session ID to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration failed:", err);
          return res.status(500).json({ error: "Login failed" });
        }

        req.session.userId = user.id;
        req.session.userRole = user.role;

        res.json({ 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Create admin user (development only)
  app.post("/api/auth/create-admin", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Not available in production" });
    }

    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUserWithRole({
        username,
        password: hashedPassword,
        role: "admin"
      });

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        }
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(400).json({ error: "Failed to create admin user" });
    }
  });

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
      // Parse JSON stringified arrays from FormData
      const requestBody = { ...req.body };
      
      // Parse selectedSystems if it's a JSON string
      if (requestBody.selectedSystems && typeof requestBody.selectedSystems === 'string') {
        try {
          requestBody.selectedSystems = JSON.parse(requestBody.selectedSystems);
        } catch (e) {
          console.error('Error parsing selectedSystems:', e);
          requestBody.selectedSystems = [];
        }
      }
      
      const validatedData = insertQuoteSchema.parse(requestBody);
      
      // Handle file upload if present
      if (req.file) {
        validatedData.switchboardPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const quote = await storage.createQuote(validatedData);

      // Generate PDF
      const pdfBuffer = await generateQuotePDF(quote);
      
      // Send email with quote
      const emailSent = await emailService.sendQuoteEmail(quote);

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
  app.get("/api/quotes", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  // Get single quote
  app.get("/api/quotes/:id", requireRole(['admin', 'editor']), async (req, res) => {
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
  app.put("/api/quotes/:id/status", requireRole(['admin', 'editor']), async (req, res) => {
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
  app.get("/api/quotes/:id/pdf", requireRole(['admin', 'editor']), async (req, res) => {
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
  app.post("/api/products", requireRole(['admin']), async (req, res) => {
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
