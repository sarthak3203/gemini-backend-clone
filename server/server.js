require("dotenv").config();
const express = require("express");
const { pool, ensureDatabaseSchema } = require("./config/db.js");

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatroomRoutes = require("./routes/chatroomRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const subscriptionRoutes = require("./routes/subscriptionRoutes.js");
const webhookRoute = require("./routes/webhookRoute.js");

const authMiddleware = require("./middlewares/authMiddleware.js");
const errorMiddleware = require("./middlewares/errorMiddleware.js");
const { startWorker } = require("./worker/geminiWorker.js");

const PORT = process.env.PORT || 5000;
const app = express();

async function initializeDatabase() {
  await pool.query("SELECT 1");
  await ensureDatabaseSchema();
  console.log("Connected to PostgreSQL");
}

app.use("/webhook/stripe", express.raw({ type: "application/json" }), webhookRoute);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/chatroom", authMiddleware, chatroomRoutes);
app.use("/chatroom", authMiddleware, messageRoutes);
app.use("/", subscriptionRoutes);

app.use(errorMiddleware);

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
      startWorker();
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
}

startServer();
