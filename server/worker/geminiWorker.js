require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Worker } = require("bullmq");
const { MESSAGE_QUEUE_NAME, createBullConnection } = require("../config/bullMQ.js");
const messageModel = require("../models/messageModel.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
let activeWorker;

function getGeminiModel() {
  return genAI.getGenerativeModel({ model: geminiModel });
}

async function callGeminiAPI(userText) {
  const model = getGeminiModel();
  const result = await model.generateContent(userText);
  return result.response.text();
}

function startWorker() {
  if (activeWorker) {
    return activeWorker;
  }

  const worker = new Worker(
    MESSAGE_QUEUE_NAME,
    async (job) => {
      const { chatroom_id, text, user_message_id } = job.data;

      try {
        const geminiReply = await callGeminiAPI(text);
        await messageModel.addGeminiMessage(chatroom_id, geminiReply);
        await messageModel.updateMessageStatus(user_message_id, "completed");

        return { reply: geminiReply };
      } catch (error) {
        await messageModel.updateMessageStatus(user_message_id, "failed");
        console.error("Gemini API error:", error);
        throw new Error(
          error?.message || "Gemini request failed"
        );
      }
    },
    {
      connection: createBullConnection(),
    }
  );

  worker.on("ready", () => {
    console.log("BullMQ worker is ready");
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
  });

  activeWorker = worker;

  return activeWorker;
}

module.exports = { startWorker };

if (require.main === module) {
  startWorker();
}
