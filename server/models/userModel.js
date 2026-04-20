const { pool } = require("../config/db");

function formatUser(row) {
  return row || null;
}

function toPublicUser(row) {
  if (!row) {
    return null;
  }

  const { password_hash, ...user } = row;
  return user;
}

function getDbClient(db = pool) {
  return db;
}

async function findUserByMobile(mobile) {
  const result = await pool.query(
    `SELECT id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at
     FROM users
     WHERE mobile = $1`,
    [mobile]
  );

  return formatUser(result.rows[0]);
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return formatUser(result.rows[0]);
}

async function createUser({ email, name, passwordHash = null }, db = pool) {
  const result = await getDbClient(db).query(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [email.toString().trim().toLowerCase(), name || null, passwordHash]
  );

  return formatUser(result.rows[0]);
}

async function updatePasswordByEmail(email, password_hash) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER($1)
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [email.toString().trim(), password_hash]
  );

  return formatUser(result.rows[0]);
}

async function updateStripeCustomerId(userId, stripeCustomerId) {
  const result = await pool.query(
    `UPDATE users
     SET stripe_customer_id = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [userId, stripeCustomerId]
  );

  return formatUser(result.rows[0]);
}

async function updateSubscriptionStatus(userId, status) {
  const result = await pool.query(
    `UPDATE users
     SET subscription = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [userId, status]
  );

  return formatUser(result.rows[0]);
}

async function findByStripeCustomerId(stripeCustomerId) {
  const result = await pool.query(
    `SELECT id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at
     FROM users
     WHERE stripe_customer_id = $1`,
    [stripeCustomerId]
  );

  return formatUser(result.rows[0]);
}

async function checkUserStatus(id) {
  const result = await pool.query(
    `SELECT subscription
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  findUserByMobile,
  findUserByEmail,
  createUser,
  updatePasswordByEmail,
  updateStripeCustomerId,
  updateSubscriptionStatus,
  findByStripeCustomerId,
  checkUserStatus,
  toPublicUser,
};
