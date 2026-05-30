import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load env variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  console.log("Connecting to the database for migration...");
  const client = await pool.connect();
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    console.log("Reading schema.sql...");
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing DDL queries...");
    await client.query(sql);
    console.log("Tables, indexes, and RLS policies created successfully!");

    console.log("Checking for initial admin user...");
    const adminEmail = 'kevinbarra2001@gmail.com';
    const adminPassword = 'villarica2080';
    
    const checkRes = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (checkRes.rows.length === 0) {
      console.log("Hashing password for initial admin...");
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        [adminEmail, passwordHash, 'admin']
      );
      console.log(`Initial admin user successfully registered: ${adminEmail}`);
    } else {
      console.log("Admin user already exists. Skipping seed.");
    }
  } catch (err) {
    console.error("Migration execution failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

run()
  .then(async () => {
    console.log("Migration and seeding process completed!");
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Fatal: Migration script failed.", err);
    await pool.end();
    process.exit(1);
  });
