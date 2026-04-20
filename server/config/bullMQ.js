require("dotenv").config();

const { Queue, QueueEvents } = require("bullmq");
const { createRedisConnection } = require("./redis");

const MESSAGE_QUEUE_NAME = process.env.MESSAGE_QUEUE_NAME || "gemini-messages";

let messageQueue;
let queueEvents;

function createBullConnection() {
  return createRedisConnection({
    maxRetriesPerRequest: null,
  });
}

function getMessageQueue() {
  if (!messageQueue) {
    messageQueue = new Queue(MESSAGE_QUEUE_NAME, {
      connection: createBullConnection(),
    });
  }

  return messageQueue;
}

function getQueueEvents() {
  if (!queueEvents) {
    queueEvents = new QueueEvents(MESSAGE_QUEUE_NAME, {
      connection: createBullConnection(),
    });
  }

  return queueEvents;
}

module.exports = {
  MESSAGE_QUEUE_NAME,
  createBullConnection,
  getMessageQueue,
  getQueueEvents,
};
