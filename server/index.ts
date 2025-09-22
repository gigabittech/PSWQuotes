import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import Tokens from "csrf";
import pkg from "pg";
const { Pool } = pkg;
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";

const app = express();

// Trust proxy for rate limiting and secure cookies
// This is required for Replit and other reverse proxy environments
app.set('trust proxy', 1);

// Disable X-Powered-By header
app.disable('x-powered-by');

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: process.env.NODE_ENV === 'production'
        ? ["'self'"] // Remove unsafe-inline in production
        : ["'self'", "'unsafe-inline'"], // Allow unsafe-inline only in dev
      scriptSrc: process.env.NODE_ENV === 'production' 
        ? ["'self'"] 
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow unsafe only in dev for Vite
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
      fontSrc: ["'self'", "https:"],
      connectSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "https://storage.googleapis.com"] 
        : ["'self'", "ws:", "wss:", "https://storage.googleapis.com"], // Add GCS for uploads
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://storage.googleapis.com"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"], // Prevent clickjacking
      baseUri: ["'self'"], // Restrict base URI to prevent injection
      formAction: ["'self'"], // Restrict form actions to same origin
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' }
}));

// CORS Configuration - Environment driven
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-domain.replit.app'])
  : ['http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  optionsSuccessStatus: 200
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many requests from this IP, please try again later' });
  }
});

app.use(globalLimiter);

// Ensure SESSION_SECRET is set
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

// Body parser with size limits (must come before CSRF)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration with proper PostgreSQL Pool (must come before CSRF)
const PgSession = ConnectPgSimple(session);
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(session({
  store: new PgSession({
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Change default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // CSRF protection
  },
  genid: () => {
    // Generate cryptographically secure session ID
    return crypto.randomBytes(16).toString('hex');
  }
}));

// CSRF Protection Setup (must come after session)
const csrfProtection = new Tokens();

// CSRF middleware
const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = req.get('X-CSRF-Token') || req.body._csrf;
  
  if (!req.session) {
    return res.status(500).json({ error: 'Session not initialized' });
  }

  // Initialize CSRF secret if not exists
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = csrfProtection.secretSync();
  }

  // Verify token
  if (!token || !csrfProtection.verify(req.session.csrfSecret, token)) {
    console.log(`CSRF token validation failed for ${req.method} ${req.path} from IP: ${req.ip}`);
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Apply CSRF protection to all API routes except auth endpoints that need special handling
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for login route (we'll handle it separately with additional validation)
  if (req.path === '/auth/login' && req.method === 'POST') {
    return next();
  }
  
  // Skip CSRF for GET requests and public endpoints
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Apply CSRF protection for all other routes
  return csrfMiddleware(req, res, next);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging
    console.error('Error:', err);

    // Send response without throwing to prevent DoS
    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
