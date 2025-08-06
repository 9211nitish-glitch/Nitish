import { eq, and, desc, sql, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { 
  users,
  wallets,
  walletTransactions,
  tasks,
  taskAssignments,
  withdrawalRequests,
  referrals,
  campaigns,
  campaignApplications,
  testimonials,
  blogPosts,
  newsletters,
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
  type InsertNewsletter,
  type Task,
  type InsertTask,
  type TaskAssignment,
  type InsertTaskAssignment,
  type Wallet,
  type WalletTransaction,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type Referral,
  type LoginCredentials
} from "@shared/schema";

export interface IStorage {
  // Authentication
  authenticateUser(credentials: LoginCredentials): Promise<User | null>;
  registerUser(userData: InsertUser): Promise<User>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Tasks (Admin Functions)
  createTask(task: InsertTask & { createdBy: string }): Promise<Task>;
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  assignTaskToUsers(taskId: string, userIds: string[]): Promise<TaskAssignment[]>;
  
  // Task Assignments (User Functions)
  getUserTasks(userId: string): Promise<(TaskAssignment & { task: Task })[]>;
  acceptTask(assignmentId: string): Promise<TaskAssignment>;
  declineTask(assignmentId: string): Promise<TaskAssignment>;
  submitTask(assignmentId: string, files: string[], notes?: string): Promise<TaskAssignment>;
  
  // Task Management (Admin Functions)
  getTaskAssignments(taskId?: string): Promise<(TaskAssignment & { task: Task; user: User })[]>;
  approveTaskSubmission(assignmentId: string, reviewerId: string): Promise<TaskAssignment>;
  rejectTaskSubmission(assignmentId: string, reviewerId: string, comments: string): Promise<TaskAssignment>;
  reassignTask(assignmentId: string, reviewerId: string, comments: string): Promise<TaskAssignment>;
  
  // Wallet System
  getUserWallet(userId: string): Promise<Wallet>;
  addWalletTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction>;
  getWalletTransactions(userId: string): Promise<WalletTransaction[]>;
  
  // Withdrawal System
  createWithdrawalRequest(request: InsertWithdrawalRequest & { userId: string }): Promise<WithdrawalRequest>;
  getWithdrawalRequests(userId?: string): Promise<WithdrawalRequest[]>;
  processWithdrawalRequest(requestId: string, adminId: string, approved: boolean, notes?: string): Promise<WithdrawalRequest>;
  
  // Referral System
  processReferral(referredUserId: string, referrerCode: string): Promise<void>;
  getReferralTree(userId: string): Promise<Referral[]>;
  calculateReferralCommission(amount: number, level: number): number;
  
  // Legacy methods (keeping for backward compatibility)
  getCampaign(id: string): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  getCampaignApplications(campaignId: string): Promise<CampaignApplication[]>;
  getUserApplications(userId: string): Promise<CampaignApplication[]>;
  createCampaignApplication(application: Omit<CampaignApplication, 'id' | 'appliedAt'>): Promise<CampaignApplication>;
  updateCampaignApplication(id: string, updates: Partial<CampaignApplication>): Promise<CampaignApplication>;
  getVisibleTestimonials(): Promise<any[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  subscribeToNewsletter(email: string): Promise<Newsletter>;
  isEmailSubscribed(email: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Authentication
  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, credentials.email));
    if (!user) return null;
    
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    return isValidPassword ? user : null;
  }

  async registerUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const referralCode = this.generateReferralCode(userData.username);
    
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      referralCode,
    }).returning();

    // Create wallet for user
    await db.insert(wallets).values({
      userId: user.id,
    });

    // Process referral if provided
    if (userData.referredBy) {
      await this.processReferral(user.id, userData.referredBy);
    }

    return user;
  }

  private generateReferralCode(username: string): string {
    return `${username.toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 1000)}`;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    return this.registerUser(userData);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isActive, true));
  }

  // Tasks (Admin Functions)
  async createTask(taskData: InsertTask & { createdBy: string }): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }

  async assignTaskToUsers(taskId: string, userIds: string[]): Promise<TaskAssignment[]> {
    const assignments = userIds.map(userId => ({
      taskId,
      userId,
    }));
    
    const createdAssignments = await db.insert(taskAssignments).values(assignments).returning();
    
    // Update task current assignees count
    await db.update(tasks).set({
      currentAssignees: sql`${tasks.currentAssignees} + ${userIds.length}`
    }).where(eq(tasks.id, taskId));
    
    return createdAssignments;
  }

  // Task Assignments (User Functions)
  async getUserTasks(userId: string): Promise<(TaskAssignment & { task: Task })[]> {
    const results = await db.select().from(taskAssignments)
      .innerJoin(tasks, eq(taskAssignments.taskId, tasks.id))
      .where(eq(taskAssignments.userId, userId))
      .orderBy(desc(taskAssignments.createdAt));

    return results.map(result => ({
      ...result.task_assignments,
      task: result.tasks
    }));
  }

  async acceptTask(assignmentId: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'accepted',
      acceptedAt: new Date(),
    }).where(eq(taskAssignments.id, assignmentId)).returning();
    return assignment;
  }

  async declineTask(assignmentId: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'declined',
    }).where(eq(taskAssignments.id, assignmentId)).returning();
    return assignment;
  }

  async submitTask(assignmentId: string, files: string[], notes?: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'submitted',
      submittedAt: new Date(),
      submissionFiles: files,
      submissionNotes: notes,
    }).where(eq(taskAssignments.id, assignmentId)).returning();
    return assignment;
  }

  // Task Management (Admin Functions)
  async getTaskAssignments(taskId?: string): Promise<(TaskAssignment & { task: Task; user: User })[]> {
    let query = db.select().from(taskAssignments)
      .innerJoin(tasks, eq(taskAssignments.taskId, tasks.id))
      .innerJoin(users, eq(taskAssignments.userId, users.id));
    
    if (taskId) {
      query = query.where(eq(taskAssignments.taskId, taskId));
    }
    
    const results = await query.orderBy(desc(taskAssignments.createdAt));
    
    return results.map(result => ({
      ...result.task_assignments,
      task: result.tasks,
      user: result.users
    }));
  }

  async approveTaskSubmission(assignmentId: string, reviewerId: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    }).where(eq(taskAssignments.id, assignmentId)).returning();

    // Get task details for payment
    const [taskAssignment] = await db.select().from(taskAssignments)
      .innerJoin(tasks, eq(taskAssignments.taskId, tasks.id))
      .where(eq(taskAssignments.id, assignmentId));

    if (taskAssignment) {
      // Credit user wallet
      await this.creditUserWallet(
        assignment.userId, 
        parseFloat(taskAssignment.tasks.compensation), 
        'task_payment', 
        `Payment for task: ${taskAssignment.tasks.title}`,
        assignment.taskId
      );
    }

    return assignment;
  }

  async rejectTaskSubmission(assignmentId: string, reviewerId: string, comments: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      adminComments: comments,
    }).where(eq(taskAssignments.id, assignmentId)).returning();
    return assignment;
  }

  async reassignTask(assignmentId: string, reviewerId: string, comments: string): Promise<TaskAssignment> {
    const [assignment] = await db.update(taskAssignments).set({
      status: 'reassigned',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      adminComments: comments,
    }).where(eq(taskAssignments.id, assignmentId)).returning();
    return assignment;
  }

  // Wallet System
  async getUserWallet(userId: string): Promise<Wallet> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet) {
      // Create wallet if doesn't exist
      const [newWallet] = await db.insert(wallets).values({ userId }).returning();
      return newWallet;
    }
    return wallet;
  }

  async addWalletTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
    const [newTransaction] = await db.insert(walletTransactions).values(transaction).returning();
    
    // Update wallet balance
    const amount = parseFloat(transaction.amount);
    const isCredit = transaction.type === 'credit' || transaction.type === 'referral_bonus' || transaction.type === 'task_payment';
    
    if (isCredit) {
      await db.update(wallets).set({
        balance: sql`${wallets.balance} + ${amount}`,
        totalEarned: sql`${wallets.totalEarned} + ${amount}`,
        updatedAt: new Date(),
      }).where(eq(wallets.id, transaction.walletId));
    } else {
      await db.update(wallets).set({
        balance: sql`${wallets.balance} - ${amount}`,
        totalWithdrawn: sql`${wallets.totalWithdrawn} + ${amount}`,
        updatedAt: new Date(),
      }).where(eq(wallets.id, transaction.walletId));
    }
    
    return newTransaction;
  }

  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    return db.select().from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  private async creditUserWallet(userId: string, amount: number, type: string, description: string, referenceId?: string): Promise<void> {
    const wallet = await this.getUserWallet(userId);
    
    await this.addWalletTransaction({
      userId,
      walletId: wallet.id,
      type,
      amount: amount.toString(),
      description,
      status: 'completed',
      referenceType: type === 'task_payment' ? 'task' : 'other',
      referenceId: referenceId || null,
    });

    // Process referral commissions
    if (type === 'task_payment') {
      await this.processReferralCommissions(userId, amount);
    }
  }

  // Withdrawal System
  async createWithdrawalRequest(request: InsertWithdrawalRequest & { userId: string }): Promise<WithdrawalRequest> {
    const [withdrawalRequest] = await db.insert(withdrawalRequests).values(request).returning();
    return withdrawalRequest;
  }

  async getWithdrawalRequests(userId?: string): Promise<WithdrawalRequest[]> {
    const query = db.select().from(withdrawalRequests);
    
    if (userId) {
      query.where(eq(withdrawalRequests.userId, userId));
    }
    
    return query.orderBy(desc(withdrawalRequests.createdAt));
  }

  async processWithdrawalRequest(requestId: string, adminId: string, approved: boolean, notes?: string): Promise<WithdrawalRequest> {
    const status = approved ? 'processed' : 'rejected';
    
    const [request] = await db.update(withdrawalRequests).set({
      status,
      processedBy: adminId,
      processedAt: new Date(),
      adminNotes: notes,
    }).where(eq(withdrawalRequests.id, requestId)).returning();

    // If approved, deduct from wallet
    if (approved) {
      const wallet = await this.getUserWallet(request.userId);
      await this.addWalletTransaction({
        userId: request.userId,
        walletId: wallet.id,
        type: 'withdrawal',
        amount: request.amount,
        description: `Withdrawal processed - ${request.paymentMethod}`,
        status: 'completed',
        referenceType: 'withdrawal',
        referenceId: requestId,
      });
    }

    return request;
  }

  // Referral System
  async processReferral(referredUserId: string, referrerCode: string): Promise<void> {
    // Find referrer by code
    const [referrer] = await db.select().from(users).where(eq(users.referralCode, referrerCode));
    if (!referrer) return;

    // Create 5-level referral chain
    const commissionRates = [10, 5, 4, 3, 2]; // Percentages for levels 1-5
    let currentReferrerId = referrer.id;
    
    for (let level = 1; level <= 5 && currentReferrerId; level++) {
      await db.insert(referrals).values({
        referrerId: currentReferrerId,
        referredId: referredUserId,
        level,
        commissionRate: commissionRates[level - 1].toString(),
      });

      // Find next level referrer
      const [nextReferrer] = await db.select().from(users).where(eq(users.id, currentReferrerId));
      currentReferrerId = nextReferrer?.referredBy;
    }
  }

  async getReferralTree(userId: string): Promise<Referral[]> {
    return db.select().from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(referrals.level);
  }

  calculateReferralCommission(amount: number, level: number): number {
    const rates = [10, 5, 4, 3, 2]; // 10%, 5%, 4%, 3%, 2%
    if (level < 1 || level > 5) return 0;
    return (amount * rates[level - 1]) / 100;
  }

  private async processReferralCommissions(userId: string, amount: number): Promise<void> {
    // Get all referrers for this user
    const referralChain = await db.select().from(referrals)
      .where(eq(referrals.referredId, userId))
      .orderBy(referrals.level);

    for (const referral of referralChain) {
      const commission = this.calculateReferralCommission(amount, referral.level);
      if (commission > 0) {
        await this.creditUserWallet(
          referral.referrerId,
          commission,
          'referral_bonus',
          `Level ${referral.level} referral commission`,
          userId
        );

        // Update referral total earned
        await db.update(referrals).set({
          totalEarned: sql`${referrals.totalEarned} + ${commission}`,
        }).where(eq(referrals.id, referral.id));
      }
    }
  }

  // Legacy methods for backward compatibility
  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns).where(eq(campaigns.status, 'active'));
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
    return campaign;
  }

  async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    return db.select().from(campaignApplications).where(eq(campaignApplications.campaignId, campaignId));
  }

  async getUserApplications(userId: string): Promise<CampaignApplication[]> {
    return db.select().from(campaignApplications).where(eq(campaignApplications.userId, userId));
  }

  async createCampaignApplication(application: Omit<CampaignApplication, 'id' | 'appliedAt'>): Promise<CampaignApplication> {
    const [newApplication] = await db.insert(campaignApplications).values(application).returning();
    return newApplication;
  }

  async updateCampaignApplication(id: string, updates: Partial<CampaignApplication>): Promise<CampaignApplication> {
    const [application] = await db.update(campaignApplications).set(updates).where(eq(campaignApplications.id, id)).returning();
    return application;
  }

  async getVisibleTestimonials(): Promise<any[]> {
    const testimonialsWithUsers = await db.select().from(testimonials)
      .innerJoin(users, eq(testimonials.userId, users.id))
      .where(eq(testimonials.isVisible, true));

    return testimonialsWithUsers.map(({ testimonials: testimonial, users: user }) => ({
      ...testimonial,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        location: 'India',
        image: user.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80',
        tier: user.tier === 'rising' ? 'Rising Star' : 'Legendary Star',
      },
      title: 'Amazing platform for creators!',
      earnings: `₹${user.totalEarnings}`,
      timeframe: '2 months',
    }));
  }

  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(testimonialData).returning();
    return testimonial;
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(postData).returning();
    return post;
  }

  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    const [existing] = await db.select().from(newsletters).where(eq(newsletters.email, email));
    if (existing) return existing;

    const [newsletter] = await db.insert(newsletters).values({ email }).returning();
    return newsletter;
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    const [subscriber] = await db.select().from(newsletters)
      .where(and(eq(newsletters.email, email), eq(newsletters.isActive, true)));
    return !!subscriber;
  }
}

export const storage = new DatabaseStorage();