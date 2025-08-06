import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MySQL connection configuration
const connectionConfig = {
  host: 'swift.herosite.pro',
  port: 3306,
  user: 'instarsflock_app',
  password: 'Nitish@123',
  database: 'instarsflock_app',
  connectionLimit: 10,
  ssl: false // Disable SSL as server doesn't support it
};

// Create connection pool
const connection = mysql.createPool(connectionConfig);

// Test connection
connection.getConnection().then((conn) => {
  console.log('✅ Successfully connected to MySQL database');
  conn.release();
}).catch((err) => {
  console.error('❌ Failed to connect to MySQL database:', err);
});

export const db = drizzle(connection, { schema, mode: 'default' });

// Set DATABASE_URL for Drizzle Kit compatibility
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `mysql://instarsflock_app:Nitish%40123@swift.herosite.pro:3306/instarsflock_app`;
}