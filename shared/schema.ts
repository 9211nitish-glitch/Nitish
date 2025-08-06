import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, boolean, timestamp, json, decimal, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  platform: varchar("platform", { length: 100 }), // instagram, youtube, tiktok, twitter, multiple
  followerCount: int("follower_count").default(0),
  bio: text("bio"),
  profileImage: text("profile_image"),
  tier: varchar("tier", { length: 50 }).default("rising"), // rising, legendary
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  completedCampaigns: int("completed_campaigns").default(0),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by", { length: 20 }),
  isActive: boolean("is_active").default(true),
  role: varchar("role", { length: 50 }).default("user"), // admin, user
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Session storage table for authentication
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin tasks that can be assigned to users
export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  taskImage: text("task_image"), // Image for the task
  compensation: decimal("compensation", { precision: 10, scale: 2 }).notNull(),
  timeLimit: timestamp("time_limit").notNull(), // Deadline to accept task
  submissionDeadline: timestamp("submission_deadline").notNull(), // Deadline to submit work
  maxAssignees: int("max_assignees").default(1),
  currentAssignees: int("current_assignees").default(0),
  status: varchar("status", { length: 50 }).default("active"), // active, paused, completed, cancelled
  requirements: json("requirements"), // Any specific requirements
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Task assignments to users
export const taskAssignments = mysqlTable("task_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  taskId: varchar("task_id", { length: 36 }).notNull().references(() => tasks.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("assigned"), // assigned, accepted, declined, submitted, approved, rejected, reassigned
  acceptedAt: timestamp("accepted_at"),
  submittedAt: timestamp("submitted_at"),
  submissionFiles: json("submission_files"), // Array of uploaded file URLs
  submissionNotes: text("submission_notes"),
  adminComments: text("admin_comments"), // For reassignment feedback
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// User wallet for earnings and transactions
export const wallets = mysqlTable("wallets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().unique().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wallet transactions for all money movements
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  walletId: varchar("wallet_id", { length: 36 }).notNull().references(() => wallets.id),
  type: varchar("type", { length: 50 }).notNull(), // credit, debit, referral_bonus, task_payment, withdrawal
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceType: varchar("reference_type", { length: 50 }), // task, referral, withdrawal
  referenceId: varchar("reference_id", { length: 36 }), // ID of related task, referral, etc.
  status: varchar("status", { length: 50 }).default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Withdrawal requests
export const withdrawalRequests = mysqlTable("withdrawal_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // bank_transfer, upi, paytm, paypal
  paymentDetails: text("payment_details").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, processed
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by", { length: 36 }).references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Referral system tracking
export const referrals = mysqlTable("referrals", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  referrerId: varchar("referrer_id", { length: 36 }).notNull().references(() => users.id),
  referredId: varchar("referred_id", { length: 36 }).notNull().references(() => users.id),
  level: int("level").notNull(), // 1-5 levels
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // 10%, 5%, 4%, 3%, 2%
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  brandLogo: text("brand_logo"),
  category: varchar("category", { length: 100 }).notNull(), // fashion, food, tech, lifestyle, etc.
  type: varchar("type", { length: 50 }).notNull(), // online, onsite, both
  compensation: int("compensation").notNull(),
  requirements: json("requirements"), // follower count, platform, etc.
  deadline: timestamp("deadline"),
  status: varchar("status", { length: 50 }).default("active"), // active, paused, completed
  maxParticipants: int("max_participants").default(10),
  currentParticipants: int("current_participants").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const campaignApplications = mysqlTable("campaign_applications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  campaignId: varchar("campaign_id", { length: 36 }).notNull().references(() => campaigns.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, completed
  appliedAt: timestamp("applied_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid
});

export const testimonials = mysqlTable("testimonials", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  rating: int("rating").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  category: varchar("category", { length: 100 }).notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const newsletters = mysqlTable("newsletters", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").default(sql`CURRENT_TIMESTAMP`),
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
