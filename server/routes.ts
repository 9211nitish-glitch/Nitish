import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertNewsletterSchema, 
  loginCredentialsSchema,
  insertTaskSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import "./types"; // Import session type extension

// Session middleware
function setupSession(app: Express) {
  const PgSession = connectPg(session);
  
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Admin middleware
function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginCredentialsSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.user = user;
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.registerUser(userData);
      req.session.user = user;
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.user) {
      return res.json({ user: null });
    }
    const user = req.session.user;
    res.json({ user: { ...user, password: undefined } });
  });

  // Admin Task Management Routes
  app.post("/api/admin/tasks", requireAuth, requireAdmin, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        createdBy: req.session.user!.id,
      });
      
      // Assign to users if specified
      if (req.body.assignedUserIds && req.body.assignedUserIds.length > 0) {
        await storage.assignTaskToUsers(task.id, req.body.assignedUserIds);
      }
      
      res.status(201).json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/tasks", requireAuth, requireAdmin, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/task-assignments", requireAuth, requireAdmin, async (req, res) => {
    try {
      const taskId = req.query.taskId as string;
      const assignments = await storage.getTaskAssignments(taskId);
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/task-assignments/:id/approve", requireAuth, requireAdmin, async (req, res) => {
    try {
      const assignment = await storage.approveTaskSubmission(req.params.id, req.session.user!.id);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/task-assignments/:id/reject", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { comments } = req.body;
      if (!comments) {
        return res.status(400).json({ message: "Comments are required for rejection" });
      }
      const assignment = await storage.rejectTaskSubmission(req.params.id, req.session.user!.id, comments);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/task-assignments/:id/reassign", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { comments } = req.body;
      if (!comments) {
        return res.status(400).json({ message: "Comments are required for reassignment" });
      }
      const assignment = await storage.reassignTask(req.params.id, req.session.user!.id, comments);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Task Routes
  app.get("/api/user/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getUserTasks(req.session.user!.id);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/task-assignments/:id/accept", requireAuth, async (req, res) => {
    try {
      const assignment = await storage.acceptTask(req.params.id);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/task-assignments/:id/decline", requireAuth, async (req, res) => {
    try {
      const assignment = await storage.declineTask(req.params.id);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/task-assignments/:id/submit", requireAuth, async (req, res) => {
    try {
      const { files, notes } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one file is required for submission" });
      }
      const assignment = await storage.submitTask(req.params.id, files, notes);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wallet Routes
  app.get("/api/user/wallet", requireAuth, async (req, res) => {
    try {
      const wallet = await storage.getUserWallet(req.session.user!.id);
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/wallet/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getWalletTransactions(req.session.user!.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/withdrawal-requests", requireAuth, async (req, res) => {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body;
      
      if (!amount || !paymentMethod || !paymentDetails) {
        return res.status(400).json({ message: "Amount, payment method, and payment details are required" });
      }

      // Check if user has sufficient balance
      const wallet = await storage.getUserWallet(req.session.user!.id);
      if (parseFloat(wallet.balance || "0") < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const request = await storage.createWithdrawalRequest({
        userId: req.session.user!.id,
        amount,
        paymentMethod,
        paymentDetails,
      });
      
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/withdrawal-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getWithdrawalRequests(req.session.user!.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Withdrawal Management
  app.get("/api/admin/withdrawal-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getWithdrawalRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/withdrawal-requests/:id/process", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { approved, notes } = req.body;
      const request = await storage.processWithdrawalRequest(
        req.params.id, 
        req.session.user!.id, 
        approved, 
        notes
      );
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Referral Routes
  app.get("/api/user/referrals", requireAuth, async (req, res) => {
    try {
      const referrals = await storage.getReferralTree(req.session.user!.id);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Object Storage Routes for Task Files
  app.post("/api/tasks/upload-url", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getTaskFileUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/task-files/*", requireAuth, async (req, res) => {
    try {
      const filePath = req.path.replace("/api/task-files", "");
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.getTaskFile(filePath);
      await objectStorageService.downloadTaskFile(file, res);
    } catch (error: any) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Users (Admin access)
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getActiveCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Campaign Applications
  app.post("/api/campaigns/:id/apply", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const application = await storage.createCampaignApplication({
        campaignId: req.params.id,
        userId,
        status: "pending",
        completedAt: null,
        paymentStatus: "pending",
      });

      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/applications", async (req, res) => {
    try {
      const applications = await storage.getUserApplications(req.params.userId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getVisibleTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Blog Posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = insertNewsletterSchema.parse(req.body);
      
      const isAlreadySubscribed = await storage.isEmailSubscribed(email);
      if (isAlreadySubscribed) {
        return res.status(400).json({ message: "Email already subscribed" });
      }

      const subscription = await storage.subscribeToNewsletter(email);
      res.status(201).json(subscription);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const campaigns = await storage.getAllCampaigns();
      
      const stats = {
        successRate: 95,
        happyInfluencers: 89,
        brandsCount: 2000,
        totalUsers: users.length,
        activeCampaigns: campaigns.filter(c => c.status === "active").length,
        completedCampaigns: campaigns.filter(c => c.status === "completed").length,
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
