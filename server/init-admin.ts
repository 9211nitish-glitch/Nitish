import { DatabaseStorage } from "./database-storage";

// Initialize admin user
async function initAdminUser() {
  const storage = new DatabaseStorage();
  
  try {
    // Check if admin already exists
    const existing = await storage.getUserByEmail("admin@starsflock.in");
    if (existing) {
      console.log("✓ Admin user exists, forcing password update...");
      // Force password update by using the createUser method with correct bcrypt hashing
      await storage.registerUser({
        email: "admin@starsflock.in",
        password: "admin123", // This will be properly hashed by registerUser
        firstName: "Admin",
        lastName: "User", 
        isAdmin: true,
        referralCode: "ADMIN001",
        isActive: true,
      });
      console.log("✅ Admin password updated successfully");
      return;
    }
    
    // Create admin user
    const admin = await storage.createUser({
      email: "admin@starsflock.in",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      referralCode: "ADMIN001",
      isActive: true,
    });
    
    console.log("✓ Admin user created successfully:", admin.email);
    
  } catch (error) {
    console.error("✗ Error creating admin user:", error);
  }
}

// Run initialization
initAdminUser().catch(console.error);

export { initAdminUser };