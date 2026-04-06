const { pool } = require("../config/db");

function formatOtp(row) {
  return row || null;
}

async function createOtp(mobile, otp, purpose, expiresAt) {
  const userResult = await pool.query(
    `SELECT id
     FROM users
     WHERE mobile = $1`,
    [mobile]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new Error("User not found for OTP creation");
  }

  const result = await pool.query(
    `INSERT INTO otps (user_id, otp_code, purpose, expires_at, is_used)
     VALUES ($1, $2, $3, $4, false)
     ON CONFLICT (user_id)
     DO UPDATE SET
       otp_code = EXCLUDED.otp_code,
       purpose = EXCLUDED.purpose,
       expires_at = EXCLUDED.expires_at,
       is_used = false,
       created_at = CURRENT_TIMESTAMP
     RETURNING id, user_id, otp_code, purpose, expires_at, is_used, created_at`,
    [user.id, otp, purpose, expiresAt]
  );

  return formatOtp(result.rows[0]);
}

async function findLatestOtpByMobile(mobile) {
  const result = await pool.query(
    `SELECT o.id, o.user_id, o.otp_code, o.purpose, o.expires_at, o.is_used, o.created_at
     FROM otps o
     INNER JOIN users u ON u.id = o.user_id
     WHERE u.mobile = $1
     ORDER BY o.created_at DESC
     LIMIT 1`,
    [mobile]
  );

  const user = result.rows[0];
  if (!user) return null;

  return formatOtp(user);
}

async function markOtpAsUsed(id) {
  await pool.query(
    `UPDATE otps
     SET is_used = true
     WHERE id = $1`,
    [id]
  );
}

module.exports = {
  createOtp,
  findLatestOtpByMobile,
  markOtpAsUsed
};
