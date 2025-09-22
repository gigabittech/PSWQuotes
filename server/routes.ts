import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { 
  insertQuoteSchema, insertProductSchema, insertUserSchemaWithRole,
  insertCmsThemeSchema, insertCmsPageSchema, insertFormSchema,
  insertFormFieldSchema, insertFormConditionSchema, insertSubmissionSchema,
  insertMediaAssetSchema, insertAnalyticsEventSchema, insertSettingSchema
} from "@shared/schema";
import { emailService } from "./services/emailService";
import { pricingService } from "./services/pricingService";
import { generateQuotePDF } from "./pdfGenerator";
import multer from "multer";
import { z } from "zod";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";

const upload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific image types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

// Rate limiters for specific endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

const quoteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 quote submissions per minute
  message: { error: 'Too many quote requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const settingsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 settings updates per minute
  message: { error: 'Too many settings updates, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

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
  
  // CSRF Token endpoint
  app.get("/api/csrf-token", (req, res) => {
    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' });
    }
    
    // Initialize CSRF secret if not exists
    if (!req.session.csrfSecret) {
      const { Tokens } = require('csrf');
      const tokens = new Tokens();
      req.session.csrfSecret = tokens.secretSync();
    }
    
    const { Tokens } = require('csrf');
    const tokens = new Tokens();
    const token = tokens.create(req.session.csrfSecret);
    
    res.json({ csrfToken: token });
  });
  
  // Authentication routes
  app.post("/api/auth/login", authLimiter, async (req, res) => {
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
      
      // Send email with quote and PDF
      const emailSent = await emailService.sendQuoteEmail(quote, pdfBuffer);

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

  // Enhanced pricing calculation endpoint
  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const params = req.body;
      const pricingResult = await pricingService.calculateQuotePrice(params);
      res.json(pricingResult);
    } catch (error) {
      console.error("Error calculating enhanced pricing:", error);
      res.status(500).json({ error: "Failed to calculate pricing" });
    }
  });

  // CMS Theme Management
  app.get("/api/cms/theme", async (req, res) => {
    try {
      const theme = await storage.getCmsTheme();
      res.json(theme || null);
    } catch (error) {
      console.error("Error fetching theme:", error);
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.get("/api/cms/theme/admin", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const theme = await storage.getCmsThemeForAdmin();
      res.json(theme || null);
    } catch (error) {
      console.error("Error fetching admin theme:", error);
      res.status(500).json({ error: "Failed to fetch admin theme" });
    }
  });

  app.put("/api/cms/theme", requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertCmsThemeSchema.parse(req.body);
      
      // Check if theme exists (use admin method to get latest)
      const existingTheme = await storage.getCmsThemeForAdmin();
      let theme;
      
      if (existingTheme) {
        theme = await storage.updateCmsTheme(existingTheme.id, validatedData);
      } else {
        theme = await storage.createCmsTheme(validatedData);
      }
      
      res.json(theme);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(400).json({ error: "Failed to update theme" });
    }
  });

  // Add theme publish endpoint
  app.post("/api/cms/theme/publish", requireRole(['admin']), async (req, res) => {
    try {
      const existingTheme = await storage.getCmsThemeForAdmin();
      
      if (!existingTheme) {
        return res.status(404).json({ error: "No theme found to publish" });
      }
      
      const theme = await storage.updateCmsTheme(existingTheme.id, { status: "published" });
      res.json(theme);
    } catch (error) {
      console.error("Error publishing theme:", error);
      res.status(400).json({ error: "Failed to publish theme" });
    }
  });

  // CMS Pages Management
  app.get("/api/cms/pages", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const pages = await storage.getCmsPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/cms/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getCmsPage(slug);
      
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.get("/api/cms/pages/:slug/admin", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getCmsPageForAdmin(slug);
      
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching admin page:", error);
      res.status(500).json({ error: "Failed to fetch admin page" });
    }
  });

  app.post("/api/cms/pages", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const validatedData = insertCmsPageSchema.parse(req.body);
      const page = await storage.createCmsPage(validatedData);
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(400).json({ error: "Failed to create page" });
    }
  });

  app.put("/api/cms/pages/:id", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCmsPageSchema.partial().parse(req.body);
      const page = await storage.updateCmsPage(id, validatedData);
      
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(400).json({ error: "Failed to update page" });
    }
  });

  app.post("/api/cms/pages/:id/publish", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const page = await storage.publishCmsPage(id);
      
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error publishing page:", error);
      res.status(400).json({ error: "Failed to publish page" });
    }
  });

  // Forms Management
  app.get("/api/cms/forms", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/cms/forms/:id", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const form = await storage.getForm(id);
      
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Get form fields and conditions
      const [fields, conditions] = await Promise.all([
        storage.getFormFields(id),
        storage.getFormConditions(id)
      ]);
      
      res.json({ ...form, fields, conditions });
    } catch (error) {
      console.error("Error fetching form:", error);
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.post("/api/cms/forms", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.json(form);
    } catch (error) {
      console.error("Error creating form:", error);
      res.status(400).json({ error: "Failed to create form" });
    }
  });

  app.put("/api/cms/forms/:id", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(id, validatedData);
      
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Error updating form:", error);
      res.status(400).json({ error: "Failed to update form" });
    }
  });

  // Submissions Management
  app.get("/api/cms/submissions", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { formId } = req.query;
      const submissions = await storage.getSubmissions(formId as string);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.get("/api/cms/submissions/:id", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ error: "Failed to fetch submission" });
    }
  });

  app.put("/api/cms/submissions/:id/status", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const submission = await storage.updateSubmissionStatus(id, status);
      
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(400).json({ error: "Failed to update submission status" });
    }
  });

  // Analytics Events
  app.get("/api/cms/analytics", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { formId, type, dateFrom, dateTo } = req.query;
      
      const filters: any = {};
      if (formId) filters.formId = formId as string;
      if (type) filters.type = type as string;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      
      const events = await storage.getAnalyticsEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Media Assets Management
  app.get("/api/cms/media", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const assets = await storage.getMediaAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching media assets:", error);
      res.status(500).json({ error: "Failed to fetch media assets" });
    }
  });

  // Settings Management (Admin Only)
  app.get("/api/settings", requireRole(['admin']), settingsLimiter, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Redact sensitive values for security
      const redactedSettings = settings.map(setting => ({
        ...setting,
        value: setting.key.includes('password') || setting.key.includes('key') || setting.key.includes('secret') 
          ? '[REDACTED]' 
          : setting.value
      }));
      res.json(redactedSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", requireRole(['admin']), async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      
      // Redact sensitive values
      const isSecret = key.includes('password') || key.includes('key') || key.includes('secret');
      res.json({
        ...setting,
        value: isSecret ? '[REDACTED]' : setting.value
      });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", requireRole(['admin']), settingsLimiter, async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      // Validate that value is provided
      if (value === undefined || value === null) {
        return res.status(400).json({ error: "Value is required" });
      }
      
      const setting = await storage.upsertSetting(key, value);
      
      // Log setting changes for audit trail
      console.log(`Setting updated: ${key} by user ${req.session.userId}`);
      
      res.json({
        ...setting,
        value: key.includes('password') || key.includes('key') || key.includes('secret') 
          ? '[REDACTED]' 
          : setting.value
      });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(400).json({ error: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
