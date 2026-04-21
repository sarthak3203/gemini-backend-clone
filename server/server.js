require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, ensureDatabaseSchema } = require("./config/db.js");

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatroomRoutes = require("./routes/chatroomRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const subscriptionRoutes = require("./routes/subscriptionRoutes.js");

const authMiddleware = require("./middlewares/authMiddleware.js");
const errorMiddleware = require("./middlewares/errorMiddleware.js");

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
].filter(Boolean);

async function initializeDatabase() {
  await pool.query("SELECT 1");
  await ensureDatabaseSchema();
  console.log("Connected to PostgreSQL");
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server and same-origin requests that do not send Origin.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/chatroom", authMiddleware, chatroomRoutes);
app.use("/chatroom", authMiddleware, messageRoutes);
app.use("/", subscriptionRoutes);

app.use(errorMiddleware);

async function startServer() {
  await initializeDatabase();

  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("DB connection error:", error);
    process.exit(1);
  });
}

module.exports = {
  app,
  initializeDatabase,
  startServer,
};
