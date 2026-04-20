const express = require("express");
const {
  signup,
  verifySignup,
  loginWithPassword,
  sendOtp,
  verifyOtp,
  sendForgotPasswordOtp,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signup/verify", verifySignup);
router.post("/login", loginWithPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login/send-otp", sendOtp);
router.post("/login/verify-otp", verifyOtp);
router.post("/forgot-password", sendForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);


module.exports = router;
