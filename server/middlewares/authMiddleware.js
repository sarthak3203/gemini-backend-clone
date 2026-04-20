const jwt = require("../utils/jwt");
const { findUserByEmail, toPublicUser } = require("../models/userModel.js");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.validateToken(token);

    const email = decoded.email;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = toPublicUser(user);
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: error.message || "Unauthorized" });
  }
}

module.exports = authMiddleware;
