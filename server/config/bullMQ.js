require("dotenv").config();

const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connectionOptions = {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith("rediss://") ? { tls: { rejectUnauthorized: false } } : {}),
};
let connection;
let messageQueue;

function getBullConnection() {
  if (!connection) {
    connection = new Redis(redisUrl, connectionOptions);
  }
  return connection;
}

function getMessageQueue() {
  if (!messageQueue) {
    messageQueue = new Queue("gemini-messages", { connection: getBullConnection() });
  }
  return messageQueue;
}

module.exports = { getMessageQueue, getBullConnection };
