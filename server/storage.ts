import { 
  users, quotes, products, quoteItems,
  cmsTheme, cmsPages, mediaAssets, forms, formFields, formConditions, submissions, analyticsEvents, settings, emailLogs,
  type User, type InsertUser, type InsertUserWithRole,
  type Quote, type InsertQuote,
  type Product, type InsertProduct,
  type QuoteItem, type InsertQuoteItem,
  type CmsTheme, type InsertCmsTheme,
  type CmsPage, type InsertCmsPage,
  type MediaAsset, type InsertMediaAsset,
  type Form, type InsertForm,
  type FormField, type InsertFormField,
  type FormCondition, type InsertFormCondition,
  type Submission, type InsertSubmission,
  type AnalyticsEvent, type InsertAnalyticsEvent,
  type Setting, type InsertSetting,
  type EmailLog, type InsertEmailLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithRole(user: InsertUserWithRole): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUser(id: string, updates: { role?: string; password?: string }): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Quote management
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotes(): Promise<Quote[]>;
  getQuotesPaginated(params: { page: number; limit: number; search?: string; status?: string }): Promise<{ data: Quote[]; total: number; page: number; limit: number; totalPages: number }>;
  updateQuoteStatus(id: string, status: string): Promise<Quote | undefined>;
  updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote | undefined>;
  
  // Product management
  getProducts(): Promise<Product[]>;
  getProductsByType(type: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Quote items
  createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem>;
  getQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  
  // CMS Theme management
  getCmsTheme(): Promise<CmsTheme | undefined>;
  getCmsThemeForAdmin(): Promise<CmsTheme | undefined>;
  createCmsTheme(theme: InsertCmsTheme): Promise<CmsTheme>;
  updateCmsTheme(id: string, theme: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined>;
  
  // CMS Pages management
  getCmsPage(slug: string): Promise<CmsPage | undefined>;
  getCmsPageForAdmin(slug: string): Promise<CmsPage | undefined>;
  getCmsPages(): Promise<CmsPage[]>;
  getCmsPagesPaginated(params: { page: number; limit: number }): Promise<{ data: CmsPage[]; total: number; page: number; limit: number; totalPages: number }>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, page: Partial<InsertCmsPage>): Promise<CmsPage | undefined>;
  publishCmsPage(id: string): Promise<CmsPage | undefined>;
  
  // Media management
  getMediaAssets(): Promise<MediaAsset[]>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  deleteMediaAsset(id: string): Promise<boolean>;
  
  // Form management
  getForms(): Promise<Form[]>;
  getFormsPaginated(params: { page: number; limit: number }): Promise<{ data: Form[]; total: number; page: number; limit: number; totalPages: number }>;
  getForm(id: string): Promise<Form | undefined>;
  getFormByKey(key: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;
  
  // Form fields management
  getFormFields(formId: string): Promise<FormField[]>;
  createFormField(field: InsertFormField): Promise<FormField>;
  updateFormField(id: string, field: Partial<InsertFormField>): Promise<FormField | undefined>;
  deleteFormField(id: string): Promise<boolean>;
  
  // Form conditions management
  getFormConditions(formId: string): Promise<FormCondition[]>;
  createFormCondition(condition: InsertFormCondition): Promise<FormCondition>;
  updateFormCondition(id: string, condition: Partial<InsertFormCondition>): Promise<FormCondition | undefined>;
  deleteFormCondition(id: string): Promise<boolean>;
  
  // Settings management
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  upsertSetting(key: string, value: any): Promise<Setting>;
  
  // Submissions management
  getSubmissions(formId?: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined>;
  
  // Analytics events
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(filters?: {formId?: string, type?: string, dateFrom?: Date, dateTo?: Date}): Promise<AnalyticsEvent[]>;
  
  // Email logs
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(quoteId?: string): Promise<EmailLog[]>;
  getEmailLogsPaginated(params: { page: number; limit: number }): Promise<{ data: EmailLog[]; total: number; page: number; limit: number; totalPages: number }>;
  getEmailLogsByQuote(quoteId: string): Promise<EmailLog[]>;
  getEmailLogById(id: string): Promise<EmailLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createUserWithRole(insertUser: InsertUserWithRole): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUser(id: string, updates: { role?: string; password?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return true;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuotesPaginated(params: { page: number; limit: number; search?: string; status?: string }): Promise<{ data: Quote[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (status && status !== "all") {
      conditions.push(eq(quotes.status, status));
    }

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${quotes.firstName}::text) LIKE ${searchPattern}`,
          sql`LOWER(${quotes.lastName}::text) LIKE ${searchPattern}`,
          sql`LOWER(${quotes.email}::text) LIKE ${searchPattern}`,
          sql`LOWER(COALESCE(${quotes.phone}::text, '')) LIKE ${searchPattern}`
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(quotes)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    let query = db.select().from(quotes).orderBy(desc(quotes.createdAt));
    if (whereClause) {
      query = query.where(whereClause) as any;
    }
    const data = await query.limit(limit).offset(offset);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateQuoteStatus(id: string, status: string): Promise<Quote | undefined> {
    const [quote] = await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [quote] = await db
      .update(quotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.active, true));
  }

  async getProductsByType(type: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.type, type), eq(products.active, true)));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async createQuoteItem(insertItem: InsertQuoteItem): Promise<QuoteItem> {
    const [item] = await db
      .insert(quoteItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
  }

  // CMS Theme methods
  async getCmsTheme(): Promise<CmsTheme | undefined> {
    const [theme] = await db.select().from(cmsTheme).where(eq(cmsTheme.status, "published"));
    return theme || undefined;
  }

  async getCmsThemeForAdmin(): Promise<CmsTheme | undefined> {
    const [theme] = await db.select().from(cmsTheme).orderBy(desc(cmsTheme.updatedAt));
    return theme || undefined;
  }

  async createCmsTheme(insertTheme: InsertCmsTheme): Promise<CmsTheme> {
    const [theme] = await db
      .insert(cmsTheme)
      .values(insertTheme)
      .returning();
    return theme;
  }

  async updateCmsTheme(id: string, updateData: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined> {
    const [theme] = await db
      .update(cmsTheme)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(cmsTheme.id, id))
      .returning();
    return theme || undefined;
  }

  // CMS Pages methods
  async getCmsPage(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages)
      .where(and(eq(cmsPages.slug, slug), eq(cmsPages.status, "published")));
    return page || undefined;
  }

  async getCmsPageForAdmin(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page || undefined;
  }

  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(desc(cmsPages.createdAt));
  }

  async getCmsPagesPaginated(params: { page: number; limit: number }): Promise<{ data: CmsPage[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit } = params;
    // Ensure page is at least 1
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const offset = (validPage - 1) * validLimit;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(cmsPages);
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(cmsPages)
      .orderBy(desc(cmsPages.createdAt))
      .limit(validLimit)
      .offset(offset);

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };
  }

  async createCmsPage(insertPage: InsertCmsPage): Promise<CmsPage> {
    const [page] = await db
      .insert(cmsPages)
      .values(insertPage)
      .returning();
    return page;
  }

  async updateCmsPage(id: string, updateData: Partial<InsertCmsPage>): Promise<CmsPage | undefined> {
    const [page] = await db
      .update(cmsPages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(cmsPages.id, id))
      .returning();
    return page || undefined;
  }

  async publishCmsPage(id: string): Promise<CmsPage | undefined> {
    const [page] = await db
      .update(cmsPages)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(cmsPages.id, id))
      .returning();
    return page || undefined;
  }

  // Media methods
  async getMediaAssets(): Promise<MediaAsset[]> {
    return await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  }

  async createMediaAsset(insertAsset: InsertMediaAsset): Promise<MediaAsset> {
    const [asset] = await db
      .insert(mediaAssets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset || undefined;
  }

  async deleteMediaAsset(id: string): Promise<boolean> {
    const result = await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Form methods
  async getForms(): Promise<Form[]> {
    return await db.select().from(forms).orderBy(desc(forms.createdAt));
  }

  async getFormsPaginated(params: { page: number; limit: number }): Promise<{ data: Form[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit } = params;
    // Ensure page is at least 1
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const offset = (validPage - 1) * validLimit;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(forms);
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(forms)
      .orderBy(desc(forms.createdAt))
      .limit(validLimit)
      .offset(offset);

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };
  }

  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async getFormByKey(key: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.key, key));
    return form || undefined;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values(insertForm)
      .returning();
    return form;
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return form || undefined;
  }

  // Form fields methods
  async getFormFields(formId: string): Promise<FormField[]> {
    return await db.select().from(formFields).where(eq(formFields.formId, formId));
  }

  async createFormField(insertField: InsertFormField): Promise<FormField> {
    const [field] = await db
      .insert(formFields)
      .values(insertField)
      .returning();
    return field;
  }

  async updateFormField(id: string, updateData: Partial<InsertFormField>): Promise<FormField | undefined> {
    const [field] = await db
      .update(formFields)
      .set(updateData)
      .where(eq(formFields.id, id))
      .returning();
    return field || undefined;
  }

  async deleteFormField(id: string): Promise<boolean> {
    const result = await db.delete(formFields).where(eq(formFields.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Form conditions methods
  async getFormConditions(formId: string): Promise<FormCondition[]> {
    return await db.select().from(formConditions).where(eq(formConditions.formId, formId));
  }

  async createFormCondition(insertCondition: InsertFormCondition): Promise<FormCondition> {
    const [condition] = await db
      .insert(formConditions)
      .values(insertCondition)
      .returning();
    return condition;
  }

  async updateFormCondition(id: string, updateData: Partial<InsertFormCondition>): Promise<FormCondition | undefined> {
    const [condition] = await db
      .update(formConditions)
      .set(updateData)
      .where(eq(formConditions.id, id))
      .returning();
    return condition || undefined;
  }

  async deleteFormCondition(id: string): Promise<boolean> {
    const result = await db.delete(formConditions).where(eq(formConditions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Submissions methods
  async getSubmissions(formId?: string): Promise<Submission[]> {
    if (formId) {
      return await db.select().from(submissions).where(eq(submissions.formId, formId)).orderBy(desc(submissions.createdAt));
    }
    return await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }

  // Analytics events methods
  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analyticsEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getAnalyticsEvents(filters?: {formId?: string, type?: string, dateFrom?: Date, dateTo?: Date}): Promise<AnalyticsEvent[]> {
    if (filters) {
      const conditions = [];
      if (filters.formId) conditions.push(eq(analyticsEvents.formId, filters.formId));
      if (filters.type) conditions.push(eq(analyticsEvents.type, filters.type));
      
      if (conditions.length > 0) {
        return await db.select().from(analyticsEvents)
          .where(and(...conditions))
          .orderBy(desc(analyticsEvents.createdAt));
      }
    }
    
    return await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt));
  }

  // Settings management
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async upsertSetting(key: string, value: any): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }

  // Email logs methods
  async createEmailLog(insertLog: InsertEmailLog): Promise<EmailLog> {
    const [log] = await db
      .insert(emailLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getEmailLogs(quoteId?: string): Promise<EmailLog[]> {
    if (quoteId) {
      return await db.select().from(emailLogs).where(eq(emailLogs.quoteId, quoteId)).orderBy(desc(emailLogs.sentAt));
    }
    return await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
  }

  async getEmailLogsPaginated(params: { page: number; limit: number }): Promise<{ data: EmailLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit } = params;
    // Ensure page is at least 1
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const offset = (validPage - 1) * validLimit;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(emailLogs);
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(validLimit)
      .offset(offset);

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };
  }

  async getEmailLogsByQuote(quoteId: string): Promise<EmailLog[]> {
    return await db.select().from(emailLogs).where(eq(emailLogs.quoteId, quoteId)).orderBy(desc(emailLogs.sentAt));
  }

  async getEmailLogById(id: string): Promise<EmailLog | undefined> {
    const [log] = await db.select().from(emailLogs).where(eq(emailLogs.id, id)).limit(1);
    return log;
  }
}

export const storage = new DatabaseStorage();
