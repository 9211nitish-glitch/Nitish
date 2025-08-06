# Plesk Server Deployment Guide for TaskFlow

This guide will help you deploy both frontend and backend to your Plesk server at starsflock.in

## Prerequisites

- Domain: starsflock.in
- Plesk Server Access
- MySQL Database: instarsflock_app
- Database Password: Nitish@123

## Step 1: Prepare Your Project for Production

### 1.1 Update Environment Variables

Create a `.env.production` file in your project root:

```bash
# Database Configuration
DATABASE_URL=mysql://instarsflock_app:Nitish@123@localhost:3306/instarsflock_app
DB_HOST=localhost
DB_PORT=3306
DB_USER=instarsflock_app
DB_PASSWORD=Nitish@123
DB_NAME=instarsflock_app

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://starsflock.in
BACKEND_URL=https://starsflock.in/api

# Session Secret (generate a secure one)
SESSION_SECRET=your-super-secure-session-secret-change-this

# File Upload Configuration
MAX_FILE_SIZE=1073741824
UPLOAD_DIR=/var/www/vhosts/starsflock.in/httpdocs/uploads
```

### 1.2 Build Scripts Configuration

Update your `package.json` with production scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "build:server": "tsc server/index.ts --outDir dist --target es2020 --module commonjs",
    "start": "node dist/index.js",
    "production": "npm run build && npm run build:server && npm run start"
  }
}
```

## Step 2: Database Setup

### 2.1 Create Database Tables

Upload the following SQL script to your MySQL database via Plesk phpMyAdmin:

```sql
-- Run this script in your instarsflock_app database

-- Users table with package support
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  platform VARCHAR(100),
  follower_count INT DEFAULT 0,
  bio TEXT,
  profile_image TEXT,
  tier VARCHAR(50) DEFAULT 'rising',
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  completed_campaigns INT DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(50) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  current_package_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  task_limit INT NOT NULL,
  skip_limit INT NOT NULL,
  duration_days INT NOT NULL,
  qr_code_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User packages table
CREATE TABLE IF NOT EXISTS user_packages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  package_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  tasks_used INT DEFAULT 0,
  skips_used INT DEFAULT 0,
  activated_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Payment submissions table
CREATE TABLE IF NOT EXISTS payment_submissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  package_id VARCHAR(36) NOT NULL,
  screenshot_url TEXT NOT NULL,
  utr_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  is_admin_message BOOLEAN DEFAULT FALSE,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  task_image TEXT,
  compensation DECIMAL(10,2) NOT NULL,
  time_limit TIMESTAMP NOT NULL,
  submission_deadline TIMESTAMP NOT NULL,
  max_assignees INT DEFAULT 1,
  current_assignees INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  requirements JSON,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  task_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'assigned',
  accepted_at TIMESTAMP NULL,
  submitted_at TIMESTAMP NULL,
  submission_files JSON,
  submission_notes TEXT,
  admin_comments TEXT,
  reviewed_at TIMESTAMP NULL,
  reviewed_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  wallet_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  related_task_id VARCHAR(36),
  related_withdrawal_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (related_task_id) REFERENCES tasks(id)
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  payment_details TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  processed_by VARCHAR(36),
  processed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  referrer_id VARCHAR(36) NOT NULL,
  referred_id VARCHAR(36) NOT NULL,
  level INT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (id, username, email, password, first_name, last_name, is_admin, role) 
VALUES (UUID(), 'admin', 'admin@starsflock.in', '$2b$10$hash_here', 'Admin', 'User', TRUE, 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample packages
INSERT INTO packages (id, name, description, price, task_limit, skip_limit, duration_days, is_active)
VALUES 
  (UUID(), 'Basic Package', 'Perfect for beginners - 10 tasks, 5 skips, 30 days', 99.00, 10, 5, 30, TRUE),
  (UUID(), 'Pro Package', 'For active users - 25 tasks, 10 skips, 30 days', 199.00, 25, 10, 30, TRUE),
  (UUID(), 'Premium Package', 'Unlimited potential - 50 tasks, 20 skips, 30 days', 299.00, 50, 20, 30, TRUE)
ON DUPLICATE KEY UPDATE name=name;
```

## Step 3: Backend Deployment

### 3.1 Create Production Backend Files

Create `server/production.js`:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'instarsflock_app',
  password: process.env.DB_PASSWORD || 'Nitish@123',
  database: process.env.DB_NAME || 'instarsflock_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Session store
const sessionStore = new MySQLStore({}, pool);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 1073741824 // 1GB
  }
});

// Serve static files (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes (add your routes here)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 4: Frontend Build for Production

### 4.1 Update Vite Config for Production

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-button', '@radix-ui/react-card', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

## Step 5: Plesk Server Upload Steps

### 5.1 Prepare Files for Upload

1. **Build the project locally:**
   ```bash
   npm run build
   npm run build:server
   ```

2. **Create deployment package:**
   ```bash
   # Create a zip file with these folders:
   - dist/ (built frontend)
   - server/ (backend code)
   - node_modules/ (production dependencies)
   - package.json
   - .env.production
   ```

### 5.2 Upload to Plesk

1. **Access Plesk File Manager:**
   - Login to your Plesk control panel
   - Go to Files > File Manager
   - Navigate to `/var/www/vhosts/starsflock.in/httpdocs/`

2. **Upload and Extract:**
   - Upload your deployment zip file
   - Extract it in the httpdocs directory
   - Ensure the main files are directly in httpdocs/

3. **Set File Permissions:**
   ```bash
   chmod 755 httpdocs/
   chmod -R 644 httpdocs/dist/
   chmod -R 755 httpdocs/server/
   chmod 755 httpdocs/uploads/
   ```

### 5.3 Configure Node.js in Plesk

1. **Enable Node.js:**
   - Go to Hosting & DNS > Hosting Settings
   - Enable "Node.js support"
   - Set Node.js version to 18.x or higher

2. **Configure Application:**
   - Go to Hosting & DNS > Node.js
   - Set Document Root: `/httpdocs`
   - Set Application Root: `/httpdocs`
   - Set Startup File: `server/production.js`

3. **Install Dependencies:**
   ```bash
   npm install --production
   ```

4. **Set Environment Variables:**
   - In Plesk Node.js settings, add your environment variables
   - Or create `.env` file in httpdocs directory

## Step 6: Configure Domain and SSL

### 6.1 Domain Configuration
- Point your domain starsflock.in to your server IP
- Ensure DNS A record is correctly configured

### 6.2 SSL Certificate
- In Plesk, go to Hosting & DNS > SSL/TLS Certificates
- Install Let's Encrypt certificate for starsflock.in
- Enable "Redirect from HTTP to HTTPS"

## Step 7: Test Deployment

### 7.1 Backend Test
```bash
curl https://starsflock.in/api/health
```

### 7.2 Frontend Test
- Visit https://starsflock.in
- Check that the React app loads correctly
- Test login/registration functionality

## Step 8: Production Monitoring

### 8.1 Enable Application Logging
- Check Plesk logs: Hosting & DNS > Logs
- Monitor error logs for issues

### 8.2 Database Monitoring
- Use Plesk phpMyAdmin to monitor database performance
- Set up regular backups

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify database credentials
   - Check if MySQL service is running
   - Ensure database exists and user has proper permissions

2. **File Upload Issues:**
   - Check upload directory permissions
   - Verify file size limits in Plesk
   - Ensure enough disk space

3. **Node.js Application Won't Start:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check application logs in Plesk

4. **Frontend Not Loading:**
   - Ensure all static files are properly uploaded
   - Check if build process completed successfully
   - Verify web server configuration

## Maintenance

### Regular Tasks:
1. **Database Backups:** Set up daily backups in Plesk
2. **Log Monitoring:** Check application and error logs weekly
3. **Updates:** Keep Node.js and dependencies updated
4. **Security:** Monitor for security vulnerabilities

Your TaskFlow application should now be live at https://starsflock.in with full package management, payment processing, and admin capabilities!