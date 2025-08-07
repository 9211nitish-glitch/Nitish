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

// Insert sample packages
const packages = [
  {
    name: 'Starter Package',
    description: 'Perfect for beginners - Get started with basic task limits',
    price: 99.00,
    task_limit: 10,
    skip_limit: 5,
    duration_days: 30,
    qr_code_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pay99Rs'
  },
  {
    name: 'Premium Package', 
    description: 'Most popular choice - Higher task limits with bonus features',
    price: 299.00,
    task_limit: 50,
    skip_limit: 25,
    duration_days: 30,
    qr_code_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pay299Rs'
  },
  {
    name: 'Professional Package',
    description: 'For power users - Maximum task capacity and extended duration',
    price: 599.00,
    task_limit: 100,
    skip_limit: 50,
    duration_days: 60,
    qr_code_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pay599Rs'
  }
];

for (const pkg of packages) {
  try {
    await connection.execute(
      `INSERT INTO packages (name, description, price, task_limit, skip_limit, duration_days, qr_code_image, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [pkg.name, pkg.description, pkg.price, pkg.task_limit, pkg.skip_limit, pkg.duration_days, pkg.qr_code_image]
    );
    console.log('✓ Added package:', pkg.name);
  } catch (error) {
    console.error('Error adding package:', pkg.name, error.message);
  }
}

await connection.end();
console.log('Sample packages added successfully!');