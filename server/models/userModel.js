const { pool } = require("../config/db");

function formatUser(row) {
  return row || null;
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

async function createUser({ mobile, name }) {
  const result = await pool.query(
    `INSERT INTO users (mobile, name)
     VALUES ($1, $2)
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [mobile, name || null]
  );

  return formatUser(result.rows[0]);
}

async function updatePassword(mobile, password_hash) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
     WHERE mobile = $1
     RETURNING id, mobile, name, email, password_hash, subscription, stripe_customer_id, created_at, updated_at`,
    [mobile.toString().trim(), password_hash]
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

module.exports = { findUserByMobile, createUser, updatePassword, updateStripeCustomerId, updateSubscriptionStatus, findByStripeCustomerId,checkUserStatus };
