import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  totalEarnings: integer("total_earnings").default(0),
  completedCampaigns: integer("completed_campaigns").default(0),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
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
export type Newsletter = typeof newsletters.$inferSelect;
