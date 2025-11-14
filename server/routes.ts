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
import { pricingDataService } from "./services/pricingDataService";
import { insightlyService } from "./services/insightlyService";
import { generateQuotePDF } from "./pdfGenerator";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  objectStorageClient,
} from "./objectStorage";
import { randomUUID } from "crypto";
import { ObjectPermission } from "./objectAcl";
import { z } from "zod";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";

// Multer for parsing multipart/form-data
// Use memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
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
  app.get("/api/csrf-token", async (req, res) => {
    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' });
    }
    
    // Initialize CSRF secret if not exists
    if (!req.session.csrfSecret) {
      const { default: Tokens } = await import('csrf');
      const tokens = new Tokens();
      req.session.csrfSecret = tokens.secretSync();
    }
    
    const { default: Tokens } = await import('csrf');
    const tokens = new Tokens();
    const token = tokens.create(req.session.csrfSecret);
    
    res.json({ csrfToken: token });
  });

  // Secure Object Storage Endpoints
  
  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects (requires authentication and ACL check)
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get upload URL (requires authentication)
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      // Validate request body
      const uploadRequestSchema = z.object({
        fileType: z.string().min(1).regex(/^[a-zA-Z0-9\/+-]+$/),
        maxSizeBytes: z.number().optional().default(10 * 1024 * 1024)
      });
      
      const { fileType, maxSizeBytes } = uploadRequestSchema.parse(req.body);
      const objectStorageService = new ObjectStorageService();
      const result = await objectStorageService.getObjectEntityUploadURL(fileType, maxSizeBytes);
      res.json(result);
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get upload URL" });
    }
  });

  // Update media asset after upload (for admin use)
  app.put("/api/media-assets", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      // Validate request body
      const mediaAssetRequestSchema = z.object({
        assetURL: z.string().url(),
        filename: z.string().min(1).max(255),
        mimeType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
        size: z.number().min(0).max(50 * 1024 * 1024), // Max 50MB
        expectedMimeType: z.string().optional()
      });
      
      const { assetURL, filename, mimeType, size, expectedMimeType } = mediaAssetRequestSchema.parse(req.body);
      const userId = req.session.userId;

      const objectStorageService = new ObjectStorageService();
      
      // Verify the uploaded object meets security requirements
      const isValid = await objectStorageService.verifyUploadedObject(
        assetURL, 
        expectedMimeType || mimeType, 
        size
      );
      
      if (!isValid) {
        return res.status(400).json({ error: "Uploaded file failed security verification" });
      }

      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        assetURL,
        {
          owner: userId!,
          visibility: "public", // Media assets are typically public
        },
      );

      // Store media asset in database
      const mediaAsset = await storage.createMediaAsset({
        filename: filename,
        url: objectPath,
        mimeType: mimeType,
        size: size
      });

      res.status(200).json({
        objectPath: objectPath,
        assetId: mediaAsset.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error setting media asset:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Authentication routes
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      // Validate Origin/Referer for CSRF protection
      const origin = req.get('Origin');
      const referer = req.get('Referer');
      const host = req.get('Host');
      
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-domain.replit.app'])
        : ['http://localhost:5000', 'http://127.0.0.1:5000', `https://${host}`, `http://${host}`];
      
      let validOrigin = false;
      if (origin) {
        validOrigin = allowedOrigins.includes(origin);
      } else if (referer) {
        validOrigin = allowedOrigins.some(allowed => referer.startsWith(allowed + '/') || referer.startsWith(allowed));
      }
      
      // In development, also allow any .replit.dev domain
      if (!validOrigin && process.env.NODE_ENV === 'development') {
        if (origin?.includes('.replit.dev') || referer?.includes('.replit.dev')) {
          validOrigin = true;
        }
      }
      
      if (!validOrigin) {
        console.error('CSRF validation failed:', { origin, referer, host, allowedOrigins });
        return res.status(403).json({ error: "Invalid credentials" }); // Consistent error message
      }

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
      res.status(401).json({ error: "Invalid credentials" }); // Consistent error response
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      // Clear the session cookie with correct name and options
      res.clearCookie('sessionId', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
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

  // Get all users (admin only)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const users = await storage.getUsers();
      // Don't send password hashes to client
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }));

      res.json({ users: safeUsers });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create user (admin only)
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { username, password, role = 'viewer' } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Validate role
      if (!['admin', 'editor', 'viewer'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be admin, editor, or viewer" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUserWithRole({
        username,
        password: hashedPassword,
        role
      });

      res.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { id } = req.params;
      const { role, password } = req.body;

      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deleting yourself
      if (id === req.session.userId) {
        return res.status(400).json({ error: "Cannot modify your own account" });
      }

      const updates: { role?: string; password?: string } = {};
      
      if (role !== undefined) {
        if (!['admin', 'editor', 'viewer'].includes(role)) {
          return res.status(400).json({ error: "Invalid role. Must be admin, editor, or viewer" });
        }
        updates.role = role;
      }

      if (password !== undefined && password.trim() !== '') {
        updates.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }

      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { id } = req.params;

      // Prevent deleting yourself
      if (id === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const { powerSupply = 'single-phase' } = req.query;
      const phaseType: 'single_phase' | 'three_phase' = powerSupply === '3-phase' ? 'three_phase' : 'single_phase';
      
      const [solarBrands, batteryBrands, evChargerBrands] = await Promise.all([
        pricingDataService.getAllSolarBrands(phaseType),
        pricingDataService.getAllBatteryBrands(phaseType),
        pricingDataService.getAllEVChargerBrands(phaseType)
      ]);

      const products: any[] = [];

      // Transform solar panels into Product format
      Object.entries(solarBrands).forEach(([brandKey, brandData]) => {
        brandData.packages.forEach((pkg: any, index) => {
          products.push({
            id: pkg.id || `solar-${brandKey}-${pkg.size_kw}kw`,
            name: `${pkg.size_kw}kW ${brandData.brand} Solar System`,
            type: 'solar',
            category: 'residential',
            capacity: `${pkg.size_kw}kW`,
            price: pkg.price_after_rebate.toString(),
            rebateEligible: true,
            rebateAmount: '0',
            specifications: {
              panels: `${pkg.panels} × ${pkg.wattage}W ${brandData.brand} ${brandData.model}`,
              technology: brandData.technology,
              warranty: `${brandData.warranty_product} years product, ${brandData.warranty_performance} years performance`,
              generation: `~${Math.round(pkg.size_kw * 1500)} kWh annually`,
            },
            warranty: `${brandData.warranty_product} years`,
            popular: index === 1, // Mark second option (typically 6.6kW) as popular
            active: true,
          });
        });
      });

      // Transform batteries into Product format
      Object.entries(batteryBrands).forEach(([brandKey, brandData]) => {
        brandData.options.forEach((opt: any, index) => {
          const displayName = opt.model || `${brandData.brand} ${opt.capacity_kwh}kWh`;
          products.push({
            id: opt.id || `battery-${brandKey}-${opt.capacity_kwh}kwh`,
            name: displayName,
            type: 'battery',
            category: brandKey === 'tesla' ? 'premium' : 'value',
            capacity: `${opt.capacity_kwh}kWh`,
            price: opt.price_after_rebate.toString(),
            rebateEligible: brandKey !== 'tesla',
            rebateAmount: '0',
            specifications: {
              capacity: `${opt.capacity_kwh}kWh usable`,
              power: opt.power_kw ? `${opt.power_kw}kW continuous` : 'Varies',
              warranty: `${brandData.warranty_years} years`,
              cellType: brandData.cell_type || 'N/A',
            },
            warranty: `${brandData.warranty_years} years`,
            popular: index === 0, // Mark first option as popular
            active: true,
          });
        });
      });

      // Transform EV chargers into Product format
      Object.entries(evChargerBrands).forEach(([brandKey, brandData]) => {
        brandData.options.forEach((opt: any, index) => {
          products.push({
            id: opt.id || `ev-${brandKey}-${opt.power_kw}kw`,
            name: `${brandData.brand} ${brandData.model} ${opt.power_kw}kW`,
            type: 'ev_charger',
            category: 'standard',
            capacity: `${opt.power_kw}kW`,
            price: opt.installed_price.toString(),
            rebateEligible: false,
            rebateAmount: '0',
            specifications: {
              power: `${opt.power_kw}kW`,
              phase: opt.phase,
              cableType: brandData.cable_type,
              cableLength: brandData.cable_length_m ? `${brandData.cable_length_m}m` : 'N/A',
            },
            warranty: '2 years',
            popular: index === 0,
            active: true,
          });
        });
      });

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
      const { powerSupply = 'single-phase' } = req.query;
      const phaseType: 'single_phase' | 'three_phase' = powerSupply === '3-phase' ? 'three_phase' : 'single_phase';
      
      let products: any[] = [];

      if (type === 'solar') {
        const solarBrands = await pricingDataService.getAllSolarBrands(phaseType);
        Object.entries(solarBrands).forEach(([brandKey, brandData]) => {
          brandData.packages.forEach((pkg: any, index) => {
            products.push({
              id: pkg.id || `solar-${brandKey}-${pkg.size_kw}kw`,
              name: `${pkg.size_kw}kW ${brandData.brand} Solar System`,
              type: 'solar',
              category: 'residential',
              capacity: `${pkg.size_kw}kW`,
              price: pkg.price_after_rebate.toString(),
              rebateEligible: true,
              specifications: {
                panels: `${pkg.panels} × ${pkg.wattage}W ${brandData.brand} ${brandData.model}`,
                technology: brandData.technology,
                warranty: `${brandData.warranty_product} years product, ${brandData.warranty_performance} years performance`,
                generation: `~${Math.round(pkg.size_kw * 1500)} kWh annually`,
              },
              warranty: `${brandData.warranty_product} years`,
              popular: index === 1,
              active: true,
            });
          });
        });
      } else if (type === 'battery') {
        const batteryBrands = await pricingDataService.getAllBatteryBrands(phaseType);
        Object.entries(batteryBrands).forEach(([brandKey, brandData]) => {
          brandData.options.forEach((opt: any, index) => {
            const displayName = opt.model || `${brandData.brand} ${opt.capacity_kwh}kWh`;
            products.push({
              id: opt.id || `battery-${brandKey}-${opt.capacity_kwh}kwh`,
              name: displayName,
              type: 'battery',
              category: brandKey === 'tesla' ? 'premium' : 'value',
              capacity: `${opt.capacity_kwh}kWh`,
              price: opt.price_after_rebate.toString(),
              rebateEligible: brandKey !== 'tesla',
              specifications: {
                capacity: `${opt.capacity_kwh}kWh usable`,
                power: opt.power_kw ? `${opt.power_kw}kW continuous` : 'Varies',
                warranty: `${brandData.warranty_years} years`,
                cellType: brandData.cell_type || 'N/A',
              },
              warranty: `${brandData.warranty_years} years`,
              popular: index === 0,
              active: true,
            });
          });
        });
      } else if (type === 'ev_charger') {
        const evChargerBrands = await pricingDataService.getAllEVChargerBrands(phaseType);
        Object.entries(evChargerBrands).forEach(([brandKey, brandData]) => {
          brandData.options.forEach((opt: any, index) => {
            products.push({
              id: opt.id || `ev-${brandKey}-${opt.power_kw}kw`,
              name: `${brandData.brand} ${brandData.model} ${opt.power_kw}kW`,
              type: 'ev_charger',
              category: 'standard',
              capacity: `${opt.power_kw}kW`,
              price: opt.installed_price.toString(),
              rebateEligible: false,
              specifications: {
                power: `${opt.power_kw}kW`,
                phase: opt.phase,
                cableType: brandData.cable_type,
                cableLength: brandData.cable_length_m ? `${brandData.cable_length_m}m` : 'N/A',
              },
              warranty: '2 years',
              popular: index === 0,
              active: true,
            });
          });
        });
      }

      res.json(products);
    } catch (error) {
      console.error("Error fetching products by type:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get minimum prices for system selection
  app.get("/api/minimum-prices", async (req, res) => {
    try {
      const minPrices = await pricingDataService.getMinimumPrices();
      res.json(minPrices);
    } catch (error) {
      console.error("Error fetching minimum prices:", error);
      res.status(500).json({ error: "Failed to fetch minimum prices" });
    }
  });

  // Create a new quote
  app.post("/api/quotes", quoteLimiter, upload.single('switchboardPhoto'), async (req, res) => {
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
      
      // Handle switchboard photo upload if present
      if (req.file) {
        try {
          const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
          
          // Check if we're in a Replit environment (sidecar available)
          const isReplitEnv = process.env.REPL_ID !== undefined || 
                              process.env.REPL_SLUG !== undefined;
          
          if (privateObjectDir && isReplitEnv) {
            const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
            const fileName = `switchboard-${randomUUID()}.${fileExtension}`;
            const objectPath = `${privateObjectDir}/quotes/${fileName}`;
            
            // Parse object path (bucket/object format)
            const pathParts = objectPath.startsWith('/') ? objectPath.slice(1).split('/') : objectPath.split('/');
            if (pathParts.length < 2) {
              throw new Error('Invalid object path');
            }
            const bucketName = pathParts[0];
            const objectName = pathParts.slice(1).join('/');
            
            const bucket = objectStorageClient.bucket(bucketName);
            const file = bucket.file(objectName);
            
            // Upload file to Google Cloud Storage
            await file.save(req.file.buffer, {
              metadata: {
                contentType: req.file.mimetype,
              },
            });
            
            // Make file publicly accessible or set appropriate ACL
            await file.makePublic();
            
            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectName}`;
            validatedData.switchboardPhotoUrl = publicUrl;
          } else {
            if (!privateObjectDir) {
              console.warn('PRIVATE_OBJECT_DIR not set, skipping file upload');
            } else if (!isReplitEnv) {
              console.warn('Not running in Replit environment, skipping file upload (object storage requires Replit sidecar)');
            }
            // Continue without photo URL - quote will be created without it
          }
        } catch (error) {
          console.error('Error uploading switchboard photo:', error);
          // Continue without photo if upload fails - don't break quote creation
        }
      }
      
      // Calculate pricing from the selected products using pricing-data.json
      const phaseType: 'single_phase' | 'three_phase' = validatedData.powerSupply === '3-phase' ? 'three_phase' : 'single_phase';
      
      let totalPrice = 0;
      let totalRebates = 0;
      
      // Find and price the solar package
      if (validatedData.selectedSystems.includes('solar') && validatedData.solarPackage) {
        const solarBrands = await pricingDataService.getAllSolarBrands(phaseType);
        
        // Try to match the product ID or name with a package in pricing data
        for (const [brandKey, brandData] of Object.entries(solarBrands)) {
          const matchingPackage = brandData.packages.find((pkg: any) => {
            // Match by ID if it's an ID format
            if (pkg.id && validatedData.solarPackage === pkg.id) {
              return true;
            }
            // Otherwise match by name
            const productName = `${pkg.size_kw}kW ${brandData.brand} Solar System`;
            return validatedData.solarPackage?.includes(productName) || 
                   (validatedData.solarPackage?.includes(`${pkg.size_kw}kW`) && 
                   validatedData.solarPackage?.includes(brandData.brand));
          });
          
          if (matchingPackage) {
            totalPrice += matchingPackage.price_after_rebate;
            // STC rebates are already included in price_after_rebate
            const rebates = await pricingDataService.calculateSolarRebates(matchingPackage.size_kw);
            totalRebates += rebates.stcRebate;
            break;
          }
        }
      }
      
      // Find and price the battery
      if (validatedData.selectedSystems.includes('battery') && validatedData.batterySystem) {
        const batteryBrands = await pricingDataService.getAllBatteryBrands(phaseType);
        
        for (const [brandKey, brandData] of Object.entries(batteryBrands)) {
          const matchingOption = brandData.options.find((opt: any) => {
            // Match by ID if it's an ID format
            if (opt.id && validatedData.batterySystem === opt.id) {
              return true;
            }
            // Otherwise match by name
            const productName = opt.model || `${brandData.brand} ${opt.capacity_kwh}kWh`;
            return validatedData.batterySystem?.includes(productName) ||
                   (validatedData.batterySystem?.includes(`${opt.capacity_kwh}kWh`) &&
                   validatedData.batterySystem?.includes(brandData.brand));
          });
          
          if (matchingOption) {
            totalPrice += matchingOption.price_after_rebate;
            // Battery rebates are already included in price_after_rebate
            const isTesla = brandKey === 'tesla';
            const rebates = await pricingDataService.calculateBatteryRebates(matchingOption.capacity_kwh, isTesla);
            totalRebates += rebates.totalRebate;
            break;
          }
        }
      }
      
      // Find and price the EV charger
      if (validatedData.selectedSystems.includes('ev') && validatedData.evCharger) {
        const evChargerBrands = await pricingDataService.getAllEVChargerBrands(phaseType);
        
        for (const [brandKey, brandData] of Object.entries(evChargerBrands)) {
          const matchingOption = brandData.options.find((opt: any) => {
            // Match by ID if it's an ID format
            if (opt.id && validatedData.evCharger === opt.id) {
              return true;
            }
            // Otherwise match by name
            const productName = `${brandData.brand} ${brandData.model} ${opt.power_kw}kW`;
            return validatedData.evCharger?.includes(productName) ||
                   (validatedData.evCharger?.includes(`${opt.power_kw}kW`) &&
                   validatedData.evCharger?.includes(brandData.brand));
          });
          
          if (matchingOption) {
            totalPrice += matchingOption.installed_price;
            break;
          }
        }
      }
      
      // Update validated data with calculated prices
      validatedData.totalPrice = totalPrice.toFixed(2);
      validatedData.rebateAmount = totalRebates.toFixed(2);
      validatedData.finalPrice = totalPrice.toFixed(2); // Price is already after rebates

      const quote = await storage.createQuote(validatedData);

      // Create Insightly lead
      let insightlyLeadId: string | null = null;
      try {
        insightlyLeadId = await insightlyService.createLead(quote);
        console.log(`Insightly lead created: ${insightlyLeadId}`);
        
        // Update quote with Insightly lead ID
        await storage.updateQuote(quote.id, { insightlyLeadId });
      } catch (error) {
        console.error("Failed to create Insightly lead:", error);
        // Continue with quote creation even if Insightly fails
      }

      // Generate PDF
      const pdfBuffer = await generateQuotePDF(quote);
      
      // Send email with quote and PDF
      const emailSent = await emailService.sendQuoteEmail(quote, pdfBuffer);

      if (!emailSent) {
        console.error("Failed to send email to customer");
      }

      res.json({ quote, emailSent, insightlyLeadId });
    } catch (error) {
      console.error("Error creating quote:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      res.status(400).json({ 
        error: "Failed to create quote",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
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

  // Get single quote (public access for customers to view their quotes)
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

  // Get all email logs (admin)
  app.get("/api/email-logs", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const logs = await storage.getEmailLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ error: "Failed to fetch email logs" });
    }
  });

  // Get email logs for a specific quote (admin)
  app.get("/api/email-logs/quote/:quoteId", requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const { quoteId } = req.params;
      const logs = await storage.getEmailLogsByQuote(quoteId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs for quote:", error);
      res.status(500).json({ error: "Failed to fetch email logs" });
    }
  });

  // Generate and download PDF for a quote (public access for customers)
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

  // Real-time pricing calculation using pricing-data.json
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { selectedSystems, solarPackage, batterySystem, evCharger, powerSupply } = req.body;
      
      // Determine phase type from power supply
      const phaseType: 'single_phase' | 'three_phase' = powerSupply === '3-phase' ? 'three_phase' : 'single_phase';
      
      let totalPrice = 0;
      let solarRebate = 0;
      let batteryRebate = 0;
      const breakdown: any = {
        solarPrice: 0,
        batteryPrice: 0,
        evPrice: 0,
        inverterPrice: 0,
        solarRebate: 0,
        batteryRebate: 0,
      };
      
      // Calculate solar pricing by matching product ID or name
      if (selectedSystems?.includes('solar') && solarPackage) {
        const solarBrands = await pricingDataService.getAllSolarBrands(phaseType);
        
        for (const [brandKey, brandData] of Object.entries(solarBrands)) {
          const matchingPackage = brandData.packages.find((pkg: any) => {
            // Match by ID if it's an ID format
            if (pkg.id && solarPackage === pkg.id) {
              return true;
            }
            // Otherwise match by name
            const productName = `${pkg.size_kw}kW ${brandData.brand} Solar System`;
            return solarPackage.includes(productName) || 
                   (solarPackage.includes(`${pkg.size_kw}kW`) && solarPackage.includes(brandData.brand));
          });
          
          if (matchingPackage) {
            totalPrice += matchingPackage.price_after_rebate;
            breakdown.solarPrice = matchingPackage.price_after_rebate;
            
            // Calculate STC rebate (already included in price_after_rebate, for display only)
            const rebates = await pricingDataService.calculateSolarRebates(matchingPackage.size_kw);
            solarRebate = rebates.stcRebate;
            breakdown.solarRebate = solarRebate;
            break;
          }
        }
      }
      
      // Calculate battery pricing by matching product ID or name
      if (selectedSystems?.includes('battery') && batterySystem) {
        const batteryBrands = await pricingDataService.getAllBatteryBrands(phaseType);
        
        for (const [brandKey, brandData] of Object.entries(batteryBrands)) {
          const matchingOption = brandData.options.find((opt: any) => {
            // Match by ID if it's an ID format
            if (opt.id && batterySystem === opt.id) {
              return true;
            }
            // Otherwise match by name
            const productName = opt.model || `${brandData.brand} ${opt.capacity_kwh}kWh`;
            return batterySystem.includes(productName) ||
                   (batterySystem.includes(`${opt.capacity_kwh}kWh`) && batterySystem.includes(brandData.brand));
          });
          
          if (matchingOption) {
            totalPrice += matchingOption.price_after_rebate;
            breakdown.batteryPrice = matchingOption.price_after_rebate;
            
            // Calculate battery rebates (already included in price_after_rebate, for display only)
            const isTesla = brandKey === 'tesla';
            const rebates = await pricingDataService.calculateBatteryRebates(matchingOption.capacity_kwh, isTesla);
            batteryRebate = rebates.totalRebate;
            breakdown.batteryRebate = batteryRebate;
            break;
          }
        }
      }
      
      // Calculate EV charger pricing by matching product ID or name
      if (selectedSystems?.includes('ev') && evCharger) {
        const evChargerBrands = await pricingDataService.getAllEVChargerBrands(phaseType);
        
        for (const [brandKey, brandData] of Object.entries(evChargerBrands)) {
          const matchingOption = brandData.options.find((opt: any) => {
            // Match by ID if it's an ID format
            if (opt.id && evCharger === opt.id) {
              return true;
            }
            // Otherwise match by name
            const productName = `${brandData.brand} ${brandData.model} ${opt.power_kw}kW`;
            return evCharger.includes(productName) ||
                   (evCharger.includes(`${opt.power_kw}kW`) && evCharger.includes(brandData.brand));
          });
          
          if (matchingOption) {
            totalPrice += matchingOption.installed_price;
            breakdown.evPrice = matchingOption.installed_price;
            break;
          }
        }
      }
      
      const rebateAmount = solarRebate + batteryRebate;
      
      res.json({
        totalPrice,
        rebateAmount,
        finalPrice: totalPrice,
        breakdown,
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

  // Get available products from pricing-data.json
  app.get("/api/pricing-products/:phaseType", async (req, res) => {
    try {
      const phaseType = req.params.phaseType as 'single_phase' | 'three_phase';
      
      if (phaseType !== 'single_phase' && phaseType !== 'three_phase') {
        return res.status(400).json({ error: "Invalid phase type. Must be 'single_phase' or 'three_phase'" });
      }

      const [solarBrands, inverterBrands, batteryBrands, evChargerBrands] = await Promise.all([
        pricingDataService.getAllSolarBrands(phaseType),
        pricingDataService.getAllInverterBrands(phaseType),
        pricingDataService.getAllBatteryBrands(phaseType),
        pricingDataService.getAllEVChargerBrands(phaseType)
      ]);

      res.json({
        solar: solarBrands,
        inverters: inverterBrands,
        batteries: batteryBrands,
        evChargers: evChargerBrands,
      });
    } catch (error) {
      console.error("Error fetching pricing products:", error);
      res.status(500).json({ error: "Failed to fetch pricing products" });
    }
  });

  // Add product to pricing-data.json (Admin only)
  app.post("/api/admin/products", requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
    try {
      const productData = req.body;

      // Validate required fields
      if (!productData.phase || !productData.productType || !productData.brand || !productData.model) {
        return res.status(400).json({ error: "Missing required fields: phase, productType, brand, model" });
      }

      // Add product to pricing data
      const result = await pricingDataService.addProduct(productData);
      
      res.json({ 
        success: true, 
        message: "Product added successfully",
        product: result 
      });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to add product" });
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
