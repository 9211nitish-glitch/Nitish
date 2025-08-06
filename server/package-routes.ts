import { Router } from "express";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  packages, 
  userPackages, 
  paymentSubmissions, 
  users, 
  wallets,
  walletTransactions 
} from "@shared/schema";
import { requireAuth, requireAdmin } from "./auth-middleware";
import multer from "multer";
import path from "path";

const router = Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Public routes - Get available packages
router.get("/api/packages", async (req, res) => {
  try {
    const activePackages = await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true));
    
    res.json(activePackages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// User routes - require authentication
router.get("/api/user/current-package", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userCurrentPackage = await db
      .select({
        id: userPackages.id,
        packageId: userPackages.packageId,
        status: userPackages.status,
        tasksUsed: userPackages.tasksUsed,
        skipsUsed: userPackages.skipsUsed,
        activatedAt: userPackages.activatedAt,
        expiresAt: userPackages.expiresAt,
        package: {
          id: packages.id,
          name: packages.name,
          taskLimit: packages.taskLimit,
          skipLimit: packages.skipLimit,
          durationDays: packages.durationDays,
        }
      })
      .from(userPackages)
      .leftJoin(packages, eq(userPackages.packageId, packages.id))
      .where(and(
        eq(userPackages.userId, userId),
        eq(userPackages.status, 'active')
      ))
      .limit(1);

    res.json(userCurrentPackage[0] || null);
  } catch (error) {
    console.error("Error fetching user package:", error);
    res.status(500).json({ error: "Failed to fetch user package" });
  }
});

router.get("/api/user/payment-submissions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const submissions = await db
      .select({
        id: paymentSubmissions.id,
        packageId: paymentSubmissions.packageId,
        screenshotUrl: paymentSubmissions.screenshotUrl,
        utrNumber: paymentSubmissions.utrNumber,
        status: paymentSubmissions.status,
        rejectionReason: paymentSubmissions.rejectionReason,
        createdAt: paymentSubmissions.createdAt,
        package: {
          id: packages.id,
          name: packages.name,
          price: packages.price,
        }
      })
      .from(paymentSubmissions)
      .leftJoin(packages, eq(paymentSubmissions.packageId, packages.id))
      .where(eq(paymentSubmissions.userId, userId))
      .orderBy(desc(paymentSubmissions.createdAt));

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching payment submissions:", error);
    res.status(500).json({ error: "Failed to fetch payment submissions" });
  }
});

// File upload endpoint
router.post("/api/upload", requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Return the file URL (adjust based on your server setup)
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.post("/api/user/submit-payment", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId, screenshotUrl, utrNumber } = req.body;

    if (!packageId || !screenshotUrl || !utrNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already has an active package
    const existingActivePackage = await db
      .select()
      .from(userPackages)
      .where(and(
        eq(userPackages.userId, userId),
        eq(userPackages.status, 'active')
      ))
      .limit(1);

    if (existingActivePackage.length > 0) {
      return res.status(400).json({ error: "You already have an active package" });
    }

    // Check if package exists and is active
    const packageInfo = await db
      .select()
      .from(packages)
      .where(and(
        eq(packages.id, packageId),
        eq(packages.isActive, true)
      ))
      .limit(1);

    if (packageInfo.length === 0) {
      return res.status(400).json({ error: "Package not found or inactive" });
    }

    // Create payment submission
    const [submission] = await db
      .insert(paymentSubmissions)
      .values({
        userId,
        packageId,
        screenshotUrl,
        utrNumber,
        status: 'pending',
      })
      .returning();

    res.json(submission);
  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({ error: "Failed to submit payment" });
  }
});

// Admin routes - require admin authentication
router.get("/api/admin/packages", requireAdmin, async (req, res) => {
  try {
    const allPackages = await db
      .select()
      .from(packages)
      .orderBy(desc(packages.createdAt));
    
    res.json(allPackages);
  } catch (error) {
    console.error("Error fetching admin packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

router.post("/api/admin/packages", requireAdmin, async (req, res) => {
  try {
    const { name, description, price, taskLimit, skipLimit, durationDays, qrCodeImage } = req.body;

    if (!name || !description || !price || !taskLimit || !skipLimit || !durationDays) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newPackage] = await db
      .insert(packages)
      .values({
        name,
        description,
        price: price.toString(),
        taskLimit,
        skipLimit,
        durationDays,
        qrCodeImage: qrCodeImage || null,
        isActive: true,
      })
      .returning();

    res.json(newPackage);
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({ error: "Failed to create package" });
  }
});

router.put("/api/admin/packages/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, taskLimit, skipLimit, durationDays, qrCodeImage } = req.body;

    const [updatedPackage] = await db
      .update(packages)
      .set({
        name,
        description,
        price: price.toString(),
        taskLimit,
        skipLimit,
        durationDays,
        qrCodeImage: qrCodeImage || null,
      })
      .where(eq(packages.id, id))
      .returning();

    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(updatedPackage);
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ error: "Failed to update package" });
  }
});

router.get("/api/admin/payment-submissions", requireAdmin, async (req, res) => {
  try {
    const submissions = await db
      .select({
        id: paymentSubmissions.id,
        userId: paymentSubmissions.userId,
        packageId: paymentSubmissions.packageId,
        screenshotUrl: paymentSubmissions.screenshotUrl,
        utrNumber: paymentSubmissions.utrNumber,
        status: paymentSubmissions.status,
        reviewedBy: paymentSubmissions.reviewedBy,
        reviewedAt: paymentSubmissions.reviewedAt,
        rejectionReason: paymentSubmissions.rejectionReason,
        createdAt: paymentSubmissions.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        package: {
          id: packages.id,
          name: packages.name,
          price: packages.price,
        }
      })
      .from(paymentSubmissions)
      .leftJoin(users, eq(paymentSubmissions.userId, users.id))
      .leftJoin(packages, eq(paymentSubmissions.packageId, packages.id))
      .orderBy(desc(paymentSubmissions.createdAt));

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching payment submissions:", error);
    res.status(500).json({ error: "Failed to fetch payment submissions" });
  }
});

router.post("/api/admin/payment-submissions/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Get the submission details
    const submission = await db
      .select()
      .from(paymentSubmissions)
      .where(eq(paymentSubmissions.id, id))
      .limit(1);

    if (submission.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const submissionData = submission[0];

    if (submissionData.status !== 'pending') {
      return res.status(400).json({ error: "Submission already reviewed" });
    }

    // Update submission status
    await db
      .update(paymentSubmissions)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? reason : null,
      })
      .where(eq(paymentSubmissions.id, id));

    // If approved, activate the package for user
    if (action === 'approve') {
      const packageInfo = await db
        .select()
        .from(packages)
        .where(eq(packages.id, submissionData.packageId))
        .limit(1);

      if (packageInfo.length > 0) {
        const pkg = packageInfo[0];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

        // Deactivate any existing packages
        await db
          .update(userPackages)
          .set({ status: 'expired' })
          .where(and(
            eq(userPackages.userId, submissionData.userId),
            eq(userPackages.status, 'active')
          ));

        // Create new active package
        await db
          .insert(userPackages)
          .values({
            userId: submissionData.userId,
            packageId: submissionData.packageId,
            status: 'active',
            tasksUsed: 0,
            skipsUsed: 0,
            activatedAt: new Date(),
            expiresAt,
          });

        // Update user's current package reference
        await db
          .update(users)
          .set({ currentPackageId: submissionData.packageId })
          .where(eq(users.id, submissionData.userId));
      }
    }

    res.json({ message: `Payment ${action}d successfully` });
  } catch (error) {
    console.error("Error reviewing payment:", error);
    res.status(500).json({ error: "Failed to review payment" });
  }
});

router.get("/api/admin/user-packages", requireAdmin, async (req, res) => {
  try {
    const userPackagesList = await db
      .select({
        id: userPackages.id,
        userId: userPackages.userId,
        packageId: userPackages.packageId,
        status: userPackages.status,
        tasksUsed: userPackages.tasksUsed,
        skipsUsed: userPackages.skipsUsed,
        activatedAt: userPackages.activatedAt,
        expiresAt: userPackages.expiresAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        package: {
          id: packages.id,
          name: packages.name,
          taskLimit: packages.taskLimit,
          skipLimit: packages.skipLimit,
        }
      })
      .from(userPackages)
      .leftJoin(users, eq(userPackages.userId, users.id))
      .leftJoin(packages, eq(userPackages.packageId, packages.id))
      .orderBy(desc(userPackages.createdAt));

    res.json(userPackagesList);
  } catch (error) {
    console.error("Error fetching user packages:", error);
    res.status(500).json({ error: "Failed to fetch user packages" });
  }
});

router.post("/api/admin/assign-package", requireAdmin, async (req, res) => {
  try {
    const { userId, packageId } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify user and package exist
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const packageInfo = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);

    if (user.length === 0 || packageInfo.length === 0) {
      return res.status(400).json({ error: "User or package not found" });
    }

    const pkg = packageInfo[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

    // Deactivate any existing packages
    await db
      .update(userPackages)
      .set({ status: 'expired' })
      .where(and(
        eq(userPackages.userId, userId),
        eq(userPackages.status, 'active')
      ));

    // Create new active package
    const [newUserPackage] = await db
      .insert(userPackages)
      .values({
        userId,
        packageId,
        status: 'active',
        tasksUsed: 0,
        skipsUsed: 0,
        activatedAt: new Date(),
        expiresAt,
      })
      .returning();

    // Update user's current package reference
    await db
      .update(users)
      .set({ currentPackageId: packageId })
      .where(eq(users.id, userId));

    res.json(newUserPackage);
  } catch (error) {
    console.error("Error assigning package:", error);
    res.status(500).json({ error: "Failed to assign package" });
  }
});

export default router;