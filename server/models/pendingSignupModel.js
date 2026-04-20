const { pool } = require("../config/db");

function formatPendingSignup(row) {
  return row || null;
}

function getDbClient(db = pool) {
  return db;
}

async function upsertPendingSignup({ email, name, passwordHash, otpCode, expiresAt }, db = pool) {
  const result = await getDbClient(db).query(
    `INSERT INTO pending_signups (email, name, password_hash, otp_code, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash,
       otp_code = EXCLUDED.otp_code,
       expires_at = EXCLUDED.expires_at,
       updated_at = CURRENT_TIMESTAMP
     RETURNING id, email, name, password_hash, otp_code, expires_at, created_at, updated_at`,
    [email.toString().trim().toLowerCase(), name, passwordHash, otpCode, expiresAt]
  );

  return formatPendingSignup(result.rows[0]);
}

async function findPendingSignupByEmail(email, db = pool) {
  const result = await getDbClient(db).query(
    `SELECT id, email, name, password_hash, otp_code, expires_at, created_at, updated_at
     FROM pending_signups
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return formatPendingSignup(result.rows[0]);
}

async function deletePendingSignupByEmail(email, db = pool) {
  await getDbClient(db).query(
    `DELETE FROM pending_signups
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
}

module.exports = {
  upsertPendingSignup,
  findPendingSignupByEmail,
  deletePendingSignupByEmail,
};
