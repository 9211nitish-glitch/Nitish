import mysql from 'mysql2/promise';

async function createTables() {
  const connection = await mysql.createConnection({
    host: 'swift.herosite.pro',
    port: 3306,
    user: 'instarsflock_app',
    password: 'Nitish@123',
    database: 'instarsflock_app',
    ssl: false
  });

  console.log('✅ Connected to MySQL database');

  try {
    // Drop existing tables if they exist (in proper order due to foreign keys)
    const dropTables = [
      'campaign_applications',
      'testimonials', 
      'blog_posts',
      'newsletters',
      'referrals',
      'withdrawal_requests',
      'wallet_transactions',
      'wallets',
      'task_assignments',
      'tasks',
      'campaigns',
      'sessions',
      'users'
    ];

    for (const table of dropTables) {
      await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`✅ Dropped table: ${table}`);
    }

    // Create users table
    await connection.execute(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`username\` varchar(255) NOT NULL UNIQUE,
        \`email\` varchar(255) NOT NULL UNIQUE,
        \`password\` varchar(255) NOT NULL,
        \`first_name\` varchar(255) NOT NULL,
        \`last_name\` varchar(255) NOT NULL,
        \`phone\` varchar(20),
        \`platform\` varchar(100),
        \`follower_count\` int DEFAULT 0,
        \`bio\` text,
        \`profile_image\` text,
        \`tier\` varchar(50) DEFAULT 'rising',
        \`total_earnings\` decimal(10, 2) DEFAULT '0.00',
        \`completed_campaigns\` int DEFAULT 0,
        \`referral_code\` varchar(20) UNIQUE,
        \`referred_by\` varchar(20),
        \`is_active\` boolean DEFAULT true,
        \`role\` varchar(50) DEFAULT 'user',
        \`is_admin\` boolean DEFAULT false,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create sessions table
    await connection.execute(`
      CREATE TABLE \`sessions\` (
        \`sid\` varchar(128) PRIMARY KEY,
        \`sess\` json NOT NULL,
        \`expire\` timestamp NOT NULL,
        INDEX \`IDX_session_expire\` (\`expire\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create tasks table
    await connection.execute(`
      CREATE TABLE \`tasks\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`title\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`task_image\` text,
        \`compensation\` decimal(10, 2) NOT NULL,
        \`time_limit\` timestamp NOT NULL,
        \`submission_deadline\` timestamp NOT NULL,
        \`max_assignees\` int DEFAULT 1,
        \`current_assignees\` int DEFAULT 0,
        \`status\` varchar(50) DEFAULT 'active',
        \`requirements\` json,
        \`created_by\` varchar(36) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create task_assignments table
    await connection.execute(`
      CREATE TABLE \`task_assignments\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`task_id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`status\` varchar(50) DEFAULT 'assigned',
        \`accepted_at\` timestamp NULL,
        \`submitted_at\` timestamp NULL,
        \`submission_files\` json,
        \`submission_notes\` text,
        \`admin_comments\` text,
        \`reviewed_at\` timestamp NULL,
        \`reviewed_by\` varchar(36),
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
        FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create wallets table
    await connection.execute(`
      CREATE TABLE \`wallets\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`user_id\` varchar(36) NOT NULL UNIQUE,
        \`balance\` decimal(10, 2) DEFAULT '0.00',
        \`total_earned\` decimal(10, 2) DEFAULT '0.00',
        \`total_withdrawn\` decimal(10, 2) DEFAULT '0.00',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create wallet_transactions table
    await connection.execute(`
      CREATE TABLE \`wallet_transactions\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`user_id\` varchar(36) NOT NULL,
        \`wallet_id\` varchar(36) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`amount\` decimal(10, 2) NOT NULL,
        \`description\` text NOT NULL,
        \`reference_type\` varchar(50),
        \`reference_id\` varchar(36),
        \`status\` varchar(50) DEFAULT 'completed',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
        FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create withdrawal_requests table
    await connection.execute(`
      CREATE TABLE \`withdrawal_requests\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`user_id\` varchar(36) NOT NULL,
        \`amount\` decimal(10, 2) NOT NULL,
        \`payment_method\` varchar(50) NOT NULL,
        \`payment_details\` text NOT NULL,
        \`status\` varchar(50) DEFAULT 'pending',
        \`admin_notes\` text,
        \`processed_by\` varchar(36),
        \`processed_at\` timestamp NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
        FOREIGN KEY (\`processed_by\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create referrals table
    await connection.execute(`
      CREATE TABLE \`referrals\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`referrer_id\` varchar(36) NOT NULL,
        \`referred_id\` varchar(36) NOT NULL,
        \`level\` int NOT NULL,
        \`commission_rate\` decimal(5, 2) NOT NULL,
        \`total_earned\` decimal(10, 2) DEFAULT '0.00',
        \`is_active\` boolean DEFAULT true,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`referrer_id\`) REFERENCES \`users\`(\`id\`),
        FOREIGN KEY (\`referred_id\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create campaigns table
    await connection.execute(`
      CREATE TABLE \`campaigns\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`title\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`brand_name\` varchar(255) NOT NULL,
        \`brand_logo\` text,
        \`category\` varchar(100) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`compensation\` int NOT NULL,
        \`requirements\` json,
        \`deadline\` timestamp NULL,
        \`status\` varchar(50) DEFAULT 'active',
        \`max_participants\` int DEFAULT 10,
        \`current_participants\` int DEFAULT 0,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create campaign_applications table
    await connection.execute(`
      CREATE TABLE \`campaign_applications\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`campaign_id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`status\` varchar(50) DEFAULT 'pending',
        \`applied_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`completed_at\` timestamp NULL,
        \`payment_status\` varchar(50) DEFAULT 'pending',
        FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create testimonials table
    await connection.execute(`
      CREATE TABLE \`testimonials\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`user_id\` varchar(36) NOT NULL,
        \`content\` text NOT NULL,
        \`rating\` int NOT NULL,
        \`is_visible\` boolean DEFAULT true,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create blog_posts table
    await connection.execute(`
      CREATE TABLE \`blog_posts\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(255) NOT NULL UNIQUE,
        \`excerpt\` text NOT NULL,
        \`content\` text NOT NULL,
        \`featured_image\` text,
        \`category\` varchar(100) NOT NULL,
        \`is_published\` boolean DEFAULT false,
        \`published_at\` timestamp NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create newsletters table
    await connection.execute(`
      CREATE TABLE \`newsletters\` (
        \`id\` varchar(36) PRIMARY KEY DEFAULT (UUID()),
        \`email\` varchar(255) NOT NULL UNIQUE,
        \`is_active\` boolean DEFAULT true,
        \`subscribed_at\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ All MySQL tables created successfully!');

    // Create a default admin user
    const adminPassword = '$2a$10$w.xJ.hd2Oa1z34hcLb6sKeYWlRv3TjCPRNiNAqhMhq5i2Z8Z1P2yC'; // password: admin123
    await connection.execute(`
      INSERT INTO \`users\` (\`username\`, \`email\`, \`password\`, \`first_name\`, \`last_name\`, \`role\`, \`is_admin\`, \`referral_code\`) 
      VALUES ('admin', 'admin@starsflock.in', ?, 'Admin', 'User', 'admin', true, 'ADMIN001')
    `, [adminPassword]);

    console.log('✅ Default admin user created (username: admin, password: admin123)');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await connection.end();
    console.log('✅ Database connection closed');
  }
}

createTables().catch(console.error);