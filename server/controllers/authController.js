const userModel = require("../models/userModel.js");
const { generateOtp } = require("../utils/otp.js");
const otpModel = require("../models/otpModel.js");
const pendingSignupModel = require("../models/pendingSignupModel.js");
const { pool } = require("../config/db.js");
const {
  findUserByEmail,
  updatePasswordByEmail,
  toPublicUser,
} = require("../models/userModel.js");
const { createTokenForTheUser } = require("../utils/jwt.js");
const { sendOtpEmail } = require("../utils/email.js");
const bcrypt = require("bcryptjs");

const OTP_EXPIRY_MS = 3 * 60 * 1000;
const PASSWORD_SALT_ROUNDS = 8;

function normalizeEmail(email) {
  return email.toString().trim().toLowerCase();
}

function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MS);
}

function getEmailDeliveryError(error) {
  const message = error?.message || "";

  if (message.toLowerCase().includes("domain is not verified")) {
    return {
      status: 503,
      payload: {
        success: false,
        error: "Email delivery is not configured correctly. Verify the RESEND_FROM_EMAIL domain in Resend.",
      },
    };
  }

  return {
    status: 500,
    payload: {
      success: false,
      error: "Server error",
    },
  };
}

function ensureOtpIsValid(otpRecord, otp) {
  if (!otpRecord) {
    throw new Error("No OTP found. Please request again.");
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    throw new Error("OTP has expired");
  }

  if (otpRecord.is_used) {
    throw new Error("OTP already used");
  }

  if (otpRecord.otp_code !== otp) {
    throw new Error("Invalid OTP");
  }
}

async function signup(req, res) {
  try {
    const { email, name, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await userModel.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });
    }

    const otpCode = generateOtp();
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    await pendingSignupModel.upsertPendingSignup({
      email: normalizedEmail,
      name: name.toString().trim(),
      passwordHash,
      otpCode,
      expiresAt: getOtpExpiryDate(),
    });
    await sendOtpEmail(normalizedEmail, otpCode, "SIGNUP");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email. Verify it to complete signup.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    const emailError = getEmailDeliveryError(err);
    return res.status(emailError.status).json(emailError.payload);
  }
}

async function verifySignup(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const pendingSignup = await pendingSignupModel.findPendingSignupByEmail(normalizedEmail);

    if (!pendingSignup) {
      return res
        .status(404)
        .json({ success: false, error: "No pending signup found. Please start signup again." });
    }

    try {
      ensureOtpIsValid(
        {
          expires_at: pendingSignup.expires_at,
          is_used: false,
          otp_code: pendingSignup.otp_code,
        },
        otp
      );
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      await pendingSignupModel.deletePendingSignupByEmail(normalizedEmail);
      return res.status(409).json({ success: false, error: "User already exists" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const user = await userModel.createUser(
        {
          email: normalizedEmail,
          name: pendingSignup.name,
          passwordHash: pendingSignup.password_hash,
        },
        client
      );
      await pendingSignupModel.deletePendingSignupByEmail(normalizedEmail, client);

      await client.query("COMMIT");

      const token = createTokenForTheUser(user);

      return res.status(201).json({
        success: true,
        message: "Signup completed successfully",
        token,
        user: toPublicUser(user),
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Verify signup error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function loginWithPassword(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: "Password login is not available for this account yet",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = createTokenForTheUser(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error("Password login error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User/Email not found. Please sign up first." });
    }

    const otpCode = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await otpModel.createOtpByEmail(normalizedEmail, otpCode, "LOGIN", expiresAt);
    await sendOtpEmail(normalizedEmail, otpCode, "LOGIN");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (err) {
    console.error("Send login OTP error:", err);
    const emailError = getEmailDeliveryError(err);
    return res.status(emailError.status).json(emailError.payload);
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await otpModel.findLatestOtpByEmailAndPurpose(normalizedEmail, "LOGIN");

    try {
      ensureOtpIsValid(otpRecord, otp);
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    await otpModel.markOtpAsUsed(otpRecord.id);

    const user = await userModel.findUserByEmail(normalizedEmail);
    const token = createTokenForTheUser(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error("Verify login OTP error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function sendForgotPasswordOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User/Email not found. Please sign up first." });
    }

    const otpCode = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await otpModel.createOtpByEmail(
      normalizedEmail,
      otpCode,
      "PASSWORD_RESET",
      expiresAt
    );
    await sendOtpEmail(normalizedEmail, otpCode, "PASSWORD_RESET");

    return res.status(200).json({
      message: "OTP sent successfully to your email for password reset",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    const emailError = getEmailDeliveryError(err);
    return res.status(emailError.status).json(emailError.payload);
  }
}

async function resetPassword(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        error: "Email, OTP, and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await otpModel.findLatestOtpByEmailAndPurpose(
      normalizedEmail,
      "PASSWORD_RESET"
    );

    try {
      ensureOtpIsValid(otpRecord, otp);
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const password_hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    await updatePasswordByEmail(normalizedEmail, password_hash);
    await otpModel.markOtpAsUsed(otpRecord.id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function changePassword(req, res) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "User email not found" });
    }
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: "New password is required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: "Password must be at least 6 characters long" });
    }

    const password_hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    await updatePasswordByEmail(email, password_hash);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// TO IMPLEMENT PASSWORD MATCHING OR LOGIN USING PASSWORD IN FUTURE, WE CAN USE THIS METHOD

{
  /* const bcrypt = require("bcryptjs");

async function verifyPassword(passwordRecievedFromUser, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(passwordRecievedFromUser, hashedPassword);
    return isMatch; 
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error; 
  }
}

module.exports = verifyPassword;
*/
}

module.exports = {
  signup,
  verifySignup,
  loginWithPassword,
  sendOtp,
  verifyOtp,
  sendForgotPasswordOtp,
  resetPassword,
  changePassword,
};
