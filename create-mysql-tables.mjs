import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'swift.herosite.pro',
  port: 3306,
  user: 'instarsflock_app',
  password: 'Nitish@123',
  database: 'instarsflock_app',
  ssl: false
});

console.log('Connected to MySQL database');

// Create all necessary tables
const tables = [
  // Packages table
  `CREATE TABLE IF NOT EXISTS packages (
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
  )`,
  
  // User packages table
  `CREATE TABLE IF NOT EXISTS user_packages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    package_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    tasks_used INT DEFAULT 0,
    skips_used INT DEFAULT 0,
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Payment submissions table
  `CREATE TABLE IF NOT EXISTS payment_submissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    package_id VARCHAR(36) NOT NULL,
    screenshot_url TEXT NOT NULL,
    utr_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Add missing columns to users table
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS current_package_id VARCHAR(36)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE`
];

for (const sql of tables) {
  try {
    await connection.execute(sql);
    console.log('✓ Executed:', sql.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error executing:', sql.substring(0, 50) + '...', error.message);
  }
}

await connection.end();
console.log('Database setup complete');