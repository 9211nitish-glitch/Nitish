import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connection = await mysql.createConnection({
  host: 'swift.herosite.pro',
  port: 3306,
  user: 'instarsflock_app',
  password: 'Nitish@123',
  database: 'instarsflock_app',
  ssl: false
});

console.log('Creating admin user...');

const adminData = {
  username: 'admin',
  email: 'admin@starsflock.in',
  password: 'admin123', // Default password - should be changed after first login
  firstName: 'Super',
  lastName: 'Admin'
};

try {
  // Check if admin user already exists
  const [existing] = await connection.execute(
    'SELECT id, username FROM users WHERE username = ? OR email = ?',
    [adminData.username, adminData.email]
  );

  if (existing.length > 0) {
    console.log('Admin user already exists:', existing[0].username);
    console.log('Username: admin');
    console.log('Email: admin@starsflock.in');
    console.log('Default Password: admin123 (change after first login)');
  } else {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, first_name, last_name, is_admin, role, created_at) 
       VALUES (?, ?, ?, ?, ?, TRUE, 'admin', NOW())`,
      [adminData.username, adminData.email, hashedPassword, adminData.firstName, adminData.lastName]
    );

    console.log('✓ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@starsflock.in');
    console.log('Password: admin123 (change after first login)');
    console.log('User ID:', result.insertId);
  }
} catch (error) {
  console.error('Error creating admin user:', error.message);
}

await connection.end();