require("dotenv").config();

const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing in server/.env");
}

function buildRedisOptions(extraOptions = {}) {
  return {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times >= 5 ? null : Math.min(times * 200, 1000)),
    enableReadyCheck: true,
    ...(redisUrl.startsWith("rediss://")
      ? { tls: { rejectUnauthorized: false } }
      : {}),
    ...extraOptions,
  };
}

let sharedRedisClient;

function getRedisClient() {
  if (!sharedRedisClient) {
    sharedRedisClient = new Redis(redisUrl, buildRedisOptions());

    sharedRedisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    sharedRedisClient.on("error", (error) => {
      console.error("Redis error:", error.message);
    });
  }

  return sharedRedisClient;
}

async function ensureRedisReady(client = getRedisClient()) {
  if (client.status === "ready") {
    return client;
  }

  if (client.status === "wait") {
    await client.connect();
    return client;
  }

  if (client.status === "connecting") {
    await new Promise((resolve, reject) => {
      client.once("ready", resolve);
      client.once("error", reject);
    });
  }

  return client;
}

function createRedisConnection(extraOptions = {}) {
  const client = new Redis(redisUrl, buildRedisOptions(extraOptions));

  client.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });

  return client;
}

module.exports = {
  redisUrl,
  getRedisClient,
  ensureRedisReady,
  createRedisConnection,
};
