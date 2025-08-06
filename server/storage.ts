import { 
  type User, 
  type InsertUser,
  type Campaign,
  type InsertCampaign,
  type CampaignApplication,
  type Testimonial,
  type InsertTestimonial,
  type BlogPost,
  type InsertBlogPost,
  type Newsletter,
  type InsertNewsletter
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Campaigns
  getCampaign(id: string): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Campaign Applications
  getCampaignApplications(campaignId: string): Promise<CampaignApplication[]>;
  getUserApplications(userId: string): Promise<CampaignApplication[]>;
  createCampaignApplication(application: Omit<CampaignApplication, 'id' | 'appliedAt'>): Promise<CampaignApplication>;
  updateCampaignApplication(id: string, updates: Partial<CampaignApplication>): Promise<CampaignApplication>;
  
  // Testimonials
  getVisibleTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Blog Posts
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Newsletter
  subscribeToNewsletter(email: string): Promise<Newsletter>;
  isEmailSubscribed(email: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private campaigns: Map<string, Campaign>;
  private campaignApplications: Map<string, CampaignApplication>;
  private testimonials: Map<string, Testimonial>;
  private blogPosts: Map<string, BlogPost>;
  private newsletters: Map<string, Newsletter>;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.campaignApplications = new Map();
    this.testimonials = new Map();
    this.blogPosts = new Map();
    this.newsletters = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data for demonstration
    const sampleUsers: User[] = [
      {
        id: "user1",
        username: "anjali_verma",
        email: "anjali@example.com",
        password: "hashedpassword",
        firstName: "Anjali",
        lastName: "Verma",
        phone: "+91-9876543210",
        platform: "instagram",
        followerCount: 15000,
        bio: "Fashion and lifestyle content creator",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        tier: "rising",
        totalEarnings: 15000,
        completedCampaigns: 12,
        referralCode: "ANJALI15",
        referredBy: null,
        isActive: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: "user2",
        username: "arjun_singh",
        email: "arjun@example.com",
        password: "hashedpassword",
        firstName: "Arjun",
        lastName: "Singh",
        phone: "+91-9876543211",
        platform: "instagram",
        followerCount: 50000,
        bio: "Tech reviewer and lifestyle influencer",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        tier: "legendary",
        totalEarnings: 45000,
        completedCampaigns: 38,
        referralCode: "ARJUN50",
        referredBy: null,
        isActive: true,
        createdAt: new Date('2023-10-10'),
      },
      {
        id: "user3",
        username: "priya_sharma",
        email: "priya@example.com",
        password: "hashedpassword",
        firstName: "Priya",
        lastName: "Sharma",
        phone: "+91-9876543212",
        platform: "instagram",
        followerCount: 25000,
        bio: "Beauty and wellness content creator",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        tier: "rising",
        totalEarnings: 25000,
        completedCampaigns: 18,
        referralCode: "PRIYA25",
        referredBy: null,
        isActive: true,
        createdAt: new Date('2024-02-20'),
      }
    ];

    const sampleCampaigns: Campaign[] = [
      {
        id: "campaign1",
        title: "Fashion Brand X - Instagram Reel",
        description: "Create an engaging Instagram Reel showcasing our latest summer collection",
        brandName: "FashionX",
        brandLogo: "https://via.placeholder.com/100x100/6366F1/white?text=FX",
        category: "fashion",
        type: "online",
        compensation: 2500,
        requirements: { minFollowers: 10000, platforms: ["instagram"] },
        deadline: new Date('2024-12-25'),
        status: "active",
        maxParticipants: 5,
        currentParticipants: 2,
        createdAt: new Date('2024-12-01'),
      }
    ];

    const sampleTestimonials: Testimonial[] = [
      {
        id: "test1",
        userId: "user1",
        content: "I received my first brand task just one day after subscribing. The video task was simple, and I instantly earned ₹500. Even the referral income is great!",
        rating: 5,
        isVisible: true,
        createdAt: new Date('2024-11-15'),
      },
      {
        id: "test2",
        userId: "user2",
        content: "I've also done offline campaigns with Stars Flock. It's fun and great for networking. I'm now earning over ₹10,000 per month from brand collabs.",
        rating: 5,
        isVisible: true,
        createdAt: new Date('2024-10-20'),
      },
      {
        id: "test3",
        userId: "user3",
        content: "After joining Stars Flock, I earned ₹1200 in my very first week. I get a new brand task every day. It's the best platform for those who want to earn by making videos.",
        rating: 5,
        isVisible: true,
        createdAt: new Date('2024-09-10'),
      }
    ];

    const sampleBlogPosts: BlogPost[] = [
      {
        id: "blog1",
        title: "Mastering Captions & Hashtags – How to Boost Your Reach as a Creator",
        slug: "mastering-captions-hashtags-boost-reach",
        excerpt: "Learn the secrets of writing compelling captions and using hashtags strategically to maximize your content's reach and engagement.",
        content: "Full blog content here...",
        featuredImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
        category: "Content Creation",
        isPublished: true,
        publishedAt: new Date('2024-12-23'),
        createdAt: new Date('2024-12-20'),
      }
    ];

    // Populate maps
    sampleUsers.forEach(user => this.users.set(user.id, user));
    sampleCampaigns.forEach(campaign => this.campaigns.set(campaign.id, campaign));
    sampleTestimonials.forEach(testimonial => this.testimonials.set(testimonial.id, testimonial));
    sampleBlogPosts.forEach(post => this.blogPosts.set(post.id, post));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      followerCount: insertUser.followerCount || 0,
      tier: "rising",
      totalEarnings: 0,
      completedCampaigns: 0,
      referralCode: `${insertUser.username.toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 100)}`,
      referredBy: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Campaign methods
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.status === "active");
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      status: "active",
      currentParticipants: 0,
      createdAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    
    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  // Campaign Application methods
  async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    return Array.from(this.campaignApplications.values()).filter(app => app.campaignId === campaignId);
  }

  async getUserApplications(userId: string): Promise<CampaignApplication[]> {
    return Array.from(this.campaignApplications.values()).filter(app => app.userId === userId);
  }

  async createCampaignApplication(application: Omit<CampaignApplication, 'id' | 'appliedAt'>): Promise<CampaignApplication> {
    const id = randomUUID();
    const newApplication: CampaignApplication = {
      ...application,
      id,
      appliedAt: new Date(),
    };
    this.campaignApplications.set(id, newApplication);
    return newApplication;
  }

  async updateCampaignApplication(id: string, updates: Partial<CampaignApplication>): Promise<CampaignApplication> {
    const application = this.campaignApplications.get(id);
    if (!application) throw new Error("Application not found");
    
    const updatedApplication = { ...application, ...updates };
    this.campaignApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Testimonial methods
  async getVisibleTestimonials(): Promise<any[]> {
    const testimonials = Array.from(this.testimonials.values()).filter(t => t.isVisible);
    
    // Join with user data for frontend consumption
    return testimonials.map(testimonial => {
      const user = this.users.get(testimonial.userId);
      return {
        ...testimonial,
        user: user ? {
          name: `${user.firstName} ${user.lastName}`,
          location: testimonial.id === 'test1' ? 'Lucknow' :
                   testimonial.id === 'test2' ? 'Mumbai' :
                   testimonial.id === 'test3' ? 'Delhi' :
                   'India',
          image: user.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80',
          tier: user.tier === 'rising' ? 'Rising Star' : 'Legendary Star'
        } : null,
        // Add additional fields for testimonial display
        title: testimonial.id === 'test1' ? 'Create videos from home and earn money!' :
               testimonial.id === 'test2' ? 'Onsite shoots gave me new exposure' :
               testimonial.id === 'test3' ? 'First time I actually got paid from a platform!' :
               'Amazing platform for creators!',
        earnings: `₹${user?.totalEarnings || 0}`,
        timeframe: testimonial.id === 'test1' ? '2 months' :
                  testimonial.id === 'test2' ? '3 months' :
                  testimonial.id === 'test3' ? '6 weeks' :
                  '1 month',
      };
    });
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      isVisible: true,
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Blog Post methods
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(p => p.isPublished);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(p => p.slug === slug);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      isPublished: false,
      publishedAt: null,
      createdAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    const existing = Array.from(this.newsletters.values()).find(n => n.email === email);
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const newsletter: Newsletter = {
      id,
      email,
      isActive: true,
      subscribedAt: new Date(),
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    return Array.from(this.newsletters.values()).some(n => n.email === email && n.isActive);
  }
}

import { storage as databaseStorage } from "./database-storage";
export const storage = databaseStorage;
