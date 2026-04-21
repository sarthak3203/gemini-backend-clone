require("dotenv").config();
const { Pool } = require("pg");

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:5000";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  return {
    status: res.status,
    body: payload,
  };
}

async function getPendingSignupOtp(email) {
  const result = await pool.query(
    `SELECT otp_code
     FROM pending_signups
     WHERE email = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [email]
  );

  return result.rows[0]?.otp_code || null;
}

async function getOtpForPurpose(email, purpose) {
  const result = await pool.query(
    `SELECT o.otp_code
     FROM otps o
     INNER JOIN users u ON u.id = o.user_id
     WHERE LOWER(u.email) = LOWER($1)
       AND o.purpose = $2
     ORDER BY o.created_at DESC
     LIMIT 1`,
    [email, purpose]
  );

  return result.rows[0]?.otp_code || null;
}

async function main() {
  const email = `codex.smoke.${Date.now()}@example.com`;
  const password = "secret123";
  const nextPassword = "secret456";
  const results = { email };

  try {
    results.signup = await request("/auth/signup", {
      method: "POST",
      body: { email, name: "Codex Smoke", password },
    });

    const signupOtp = await getPendingSignupOtp(email);
    results.signupOtpPresent = Boolean(signupOtp);

    results.verifySignup = await request("/auth/signup/verify", {
      method: "POST",
      body: { email, otp: signupOtp },
    });

    const token = results.verifySignup.body?.token;

    results.me = await request("/user/me", { token });
    results.subscriptionStatus = await request("/subscription/status", { token });
    results.createChatroom = await request("/chatroom", {
      method: "POST",
      token,
      body: { title: "Smoke Room" },
    });
    results.listChatrooms = await request("/chatroom", { token });

    results.sendLoginOtp = await request("/auth/send-otp", {
      method: "POST",
      body: { email },
    });

    const loginOtp = await getOtpForPurpose(email, "LOGIN");
    results.loginOtpPresent = Boolean(loginOtp);

    results.verifyLoginOtp = await request("/auth/verify-otp", {
      method: "POST",
      body: { email, otp: loginOtp },
    });

    results.sendForgotPasswordOtp = await request("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });

    const resetOtp = await getOtpForPurpose(email, "PASSWORD_RESET");
    results.resetOtpPresent = Boolean(resetOtp);

    results.resetPassword = await request("/auth/reset-password", {
      method: "POST",
      body: { email, otp: resetOtp, password: nextPassword },
    });

    results.passwordLogin = await request("/auth/login", {
      method: "POST",
      body: { email, password: nextPassword },
    });

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        message: error.message,
        stack: error.stack,
      },
      null,
      2
    )
  );
  process.exit(1);
});
