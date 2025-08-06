import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  platform: text("platform"), // instagram, youtube, tiktok, twitter, multiple
  followerCount: integer("follower_count").default(0),
  bio: text("bio"),
  profileImage: text("profile_image"),
  tier: text("tier").default("rising"), // rising, legendary
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  completedCampaigns: integer("completed_campaigns").default(0),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  isActive: boolean("is_active").default(true),
  role: text("role").default("user"), // admin, user
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin tasks that can be assigned to users
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  taskImage: text("task_image"), // Image for the task
  compensation: decimal("compensation", { precision: 10, scale: 2 }).notNull(),
  timeLimit: timestamp("time_limit").notNull(), // Deadline to accept task
  submissionDeadline: timestamp("submission_deadline").notNull(), // Deadline to submit work
  maxAssignees: integer("max_assignees").default(1),
  currentAssignees: integer("current_assignees").default(0),
  status: text("status").default("active"), // active, paused, completed, cancelled
  requirements: jsonb("requirements"), // Any specific requirements
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task assignments to users
export const taskAssignments = pgTable("task_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: text("status").default("assigned"), // assigned, accepted, declined, submitted, approved, rejected, reassigned
  acceptedAt: timestamp("accepted_at"),
  submittedAt: timestamp("submitted_at"),
  submissionFiles: jsonb("submission_files"), // Array of uploaded file URLs
  submissionNotes: text("submission_notes"),
  adminComments: text("admin_comments"), // For reassignment feedback
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User wallet for earnings and transactions
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet transactions for all money movements
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  type: text("type").notNull(), // credit, debit, referral_bonus, task_payment, withdrawal
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceType: text("reference_type"), // task, referral, withdrawal
  referenceId: varchar("reference_id"), // ID of related task, referral, etc.
  status: text("status").default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankAccountNumber: text("bank_account_number"),
  bankIFSC: text("bank_ifsc"),
  bankAccountHolder: text("bank_account_holder"),
  upiId: text("upi_id"),
  paymentMethod: text("payment_method").notNull(), // bank, upi
  status: text("status").default("pending"), // pending, approved, rejected, processed
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral system tracking
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredId: varchar("referred_id").notNull().references(() => users.id),
  level: integer("level").notNull(), // 1-5 levels
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // 10%, 5%, 4%, 3%, 2%
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  brandName: text("brand_name").notNull(),
  brandLogo: text("brand_logo"),
  category: text("category").notNull(), // fashion, food, tech, lifestyle, etc.
  type: text("type").notNull(), // online, onsite, both
  compensation: integer("compensation").notNull(),
  requirements: jsonb("requirements"), // follower count, platform, etc.
  deadline: timestamp("deadline"),
  status: text("status").default("active"), // active, paused, completed
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignApplications = pgTable("campaign_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: text("status").default("pending"), // pending, approved, rejected, completed
  appliedAt: timestamp("applied_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  category: text("category").notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  platform: true,
  followerCount: true,
  bio: true,
  profileImage: true,
  referredBy: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  title: true,
  description: true,
  brandName: true,
  brandLogo: true,
  category: true,
  type: true,
  compensation: true,
  requirements: true,
  deadline: true,
  maxParticipants: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  userId: true,
  content: true,
  rating: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  category: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).pick({
  email: true,
});

// New insert schemas for admin system
export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  taskImage: true,
  compensation: true,
  timeLimit: true,
  submissionDeadline: true,
  maxAssignees: true,
  requirements: true,
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).pick({
  taskId: true,
  userId: true,
  submissionFiles: true,
  submissionNotes: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).pick({
  amount: true,
  bankAccountNumber: true,
  bankIFSC: true,
  bankAccountHolder: true,
  upiId: true,
  paymentMethod: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  walletTransactions: many(walletTransactions),
  tasks: many(tasks, { relationName: "createdTasks" }),
  taskAssignments: many(taskAssignments),
  withdrawalRequests: many(withdrawalRequests),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
  assignments: many(taskAssignments),
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [taskAssignments.reviewedBy],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id],
  }),
  processor: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignApplication = typeof campaignApplications.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

// Login credentials schema
export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

// New types for admin system
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;
export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
