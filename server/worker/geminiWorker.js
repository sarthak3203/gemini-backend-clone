require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Worker } = require("bullmq");
const { MESSAGE_QUEUE_NAME, createBullConnection } = require("../config/bullMQ.js");
const messageModel = require("../models/messageModel.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function callGeminiAPI(userText) {
  const model = genAI.getGenerativeModel({ model: geminiModel });
  const result = await model.generateContent(userText);
  return result.response.text();
}

function startWorker() {
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

  return worker;
}

module.exports = { startWorker };

if (require.main === module) {
  startWorker();
}
