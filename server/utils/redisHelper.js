const { getRedisClient, ensureRedisReady } = require("../config/redis");

function getUsageKey(userId) {
  const today = new Date().toISOString().split("T")[0];
  return `app:usage:${userId}:${today}`;
}

function getTomorrowMidnightTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(now.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.floor(midnight.getTime() / 1000);
}

async function getUserResponseCount(userId) {
  const redis = await ensureRedisReady(getRedisClient());
  const count = await redis.get(getUsageKey(userId));
  return count ? parseInt(count, 10) : 0;
}

async function incrementUserResponseCount(userId) {
  const redis = await ensureRedisReady(getRedisClient());
  const key = getUsageKey(userId);

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expireat(key, getTomorrowMidnightTimestamp());
  }

  return count;
}

module.exports = {
  getUserResponseCount,
  incrementUserResponseCount,
  getUsageKey,
};
