const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client without connecting on import
const redisClient = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => (times >= 5 ? null : Math.min(times * 200, 1000)),
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// No need to call redisClient.connect() here

function getMidnightTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(now.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.floor(midnight.getTime() / 1000);
}

async function ensureRedisConnected() {
  if (redisClient.status === "ready") return;
  if (redisClient.status === "connecting") return;
  await redisClient.connect();
}

async function getUserResponseCount(userId) {
  await ensureRedisConnected();
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;
  const count = await redisClient.get(key);
  return count ? parseInt(count, 10) : 0;
}

async function incrementUserResponseCount(userId) {
  await ensureRedisConnected();
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;

  let count = await redisClient.get(key);
  if (count === null) {
    await redisClient.set(key, 1);
    await redisClient.expireat(key, getMidnightTimestamp());
    count = 1;
  } else {
    count = await redisClient.incr(key);
  }
  return parseInt(count, 10);
}

module.exports = {
  getUserResponseCount,
  incrementUserResponseCount,
};
