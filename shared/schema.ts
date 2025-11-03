import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // admin, editor, viewer
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postcode: text("postcode").notNull(),
  powerSupply: text("power_supply").notNull(), // single, three, unknown
  selectedSystems: text("selected_systems").array().notNull(), // solar, battery, ev
  solarPackage: text("solar_package"),
  batterySystem: text("battery_system"),
  evCharger: text("ev_charger"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  rebateAmount: decimal("rebate_amount", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  additionalInfo: text("additional_info"),
  switchboardPhotoUrl: text("switchboard_photo_url"),
  status: text("status").notNull().default("pending"), // pending, contacted, converted, lost
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // solar, battery, ev_charger
  category: text("category").notNull(), // single_phase, three_phase for solar
  capacity: text("capacity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rebateEligible: boolean("rebate_eligible").notNull().default(false),
  rebateAmount: decimal("rebate_amount", { precision: 10, scale: 2 }),
  specifications: jsonb("specifications").notNull(),
  warranty: text("warranty").notNull(),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const quoteRelations = relations(quotes, ({ many }) => ({
  items: many(quoteItems),
}));

export const quoteItems = pgTable("quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// CMS Tables
export const cmsTheme = pgTable("cms_theme", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  colors: jsonb("colors").notNull(), // CSS custom properties
  typography: jsonb("typography").notNull(), // Font settings
  header: jsonb("header").notNull(), // Logo, nav, contact info
  footer: jsonb("footer").notNull(), // Footer content and layout
  status: text("status").notNull().default("draft"), // draft, published
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const cmsPages = pgTable("cms_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  seo: jsonb("seo").notNull(), // title, meta description, og tags
  blocks: jsonb("blocks").notNull(), // Array of page section blocks
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., "quote", "contact"
  title: text("title").notNull(),
  settings: jsonb("settings").notNull(), // Submit actions, notifications
  status: text("status").notNull().default("draft"), // draft, published
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const formFields = pgTable("form_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => forms.id),
  key: text("key").notNull(), // field identifier
  type: text("type").notNull(), // text, select, checkbox, etc.
  label: text("label").notNull(),
  order: integer("order").notNull(),
  props: jsonb("props").notNull(), // Options, placeholders, validation
  required: boolean("required").notNull().default(false),
});

export const formConditions = pgTable("form_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => forms.id),
  targetKey: text("target_key").notNull(), // Field to affect
  logic: jsonb("logic").notNull(), // Conditional rules
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => forms.id),
  payload: jsonb("payload").notNull(), // Form data
  source: text("source"), // Page slug where submitted
  utm: jsonb("utm"), // UTM parameters
  ip: text("ip"),
  userAgent: text("user_agent"),
  status: text("status").notNull().default("new"), // new, processed, contacted
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  type: text("type").notNull(), // page_view, step_view, form_submit, quote_created
  formId: varchar("form_id").references(() => forms.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., "business.company_name", "email.smtp_host"
  value: jsonb("value").notNull(), // Configuration value as JSON
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const quoteItemRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
  product: one(products, {
    fields: [quoteItems.productId],
    references: [products.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
});

// CMS Insert Schemas
export const insertUserSchemaWithRole = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertCmsThemeSchema = createInsertSchema(cmsTheme).omit({
  id: true,
  updatedAt: true,
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormFieldSchema = createInsertSchema(formFields).omit({
  id: true,
});

export const insertFormConditionSchema = createInsertSchema(formConditions).omit({
  id: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserWithRole = z.infer<typeof insertUserSchemaWithRole>;
export type User = typeof users.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

// CMS Types
export type CmsTheme = typeof cmsTheme.$inferSelect;
export type InsertCmsTheme = z.infer<typeof insertCmsThemeSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type FormField = typeof formFields.$inferSelect;
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;
export type FormCondition = typeof formConditions.$inferSelect;
export type InsertFormCondition = z.infer<typeof insertFormConditionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
