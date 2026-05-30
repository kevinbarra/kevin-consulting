const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("=== Updating Administrator Credentials in Neon DB ===");
  const client = await pool.connect();

  const targetEmail = 'kevinbarra2001@gmail.com';
  const targetPassword = 'villarica2080';
  const oldEmail = 'admin@kevinconsulting.services';

  try {
    console.log("Hashing new administrator password...");
    const passwordHash = await bcrypt.hash(targetPassword, 10);

    // Check if the old admin user exists
    const checkOld = await client.query("SELECT id FROM users WHERE email = $1", [oldEmail]);
    
    // Check if the new admin user already exists
    const checkNew = await client.query("SELECT id FROM users WHERE email = $1", [targetEmail]);

    if (checkOld.rows.length > 0) {
      console.log(`Updating existing admin '${oldEmail}' to '${targetEmail}'...`);
      await client.query(
        "UPDATE users SET email = $1, password_hash = $2 WHERE email = $3",
        [targetEmail, passwordHash, oldEmail]
      );
      console.log("Admin credentials updated successfully!");
    } else if (checkNew.rows.length > 0) {
      console.log(`Admin user '${targetEmail}' already exists. Updating their password...`);
      await client.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [passwordHash, targetEmail]
      );
      console.log("Admin password updated successfully!");
    } else {
      console.log(`Neither '${oldEmail}' nor '${targetEmail}' found. Creating a new admin user...`);
      await client.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')",
        [targetEmail, passwordHash]
      );
      console.log("Admin user created successfully!");
    }

  } catch (err) {
    console.error("Failed to update credentials:", err);
    throw err;
  } finally {
    client.release();
  }
}

run()
  .then(async () => {
    console.log("Operation finished successfully.");
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Fatal error:", err);
    await pool.end();
    process.exit(1);
  });
