require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in server/.env");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      mobile VARCHAR(20),
      password_hash TEXT,
      name VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      subscription VARCHAR(20) DEFAULT 'BASIC',
      stripe_customer_id TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    UPDATE users
    SET email = CONCAT('user', id::text, '@placeholder.local')
    WHERE email IS NULL;
  `);

  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN mobile DROP NOT NULL;
  `);

  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN email SET NOT NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      otp_code VARCHAR(10) NOT NULL,
      purpose VARCHAR(50),
      expires_at TIMESTAMPTZ NOT NULL,
      is_used BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_signups (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      password_hash TEXT NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chatrooms (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_by VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      chatroom_id INTEGER NOT NULL REFERENCES chatrooms(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender VARCHAR(50) NOT NULL,
      message_text TEXT NOT NULL,
      status VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = {
  pool,
  ensureDatabaseSchema,
};
