require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Worker } = require("bullmq");
const { MESSAGE_QUEUE_NAME, createBullConnection } = require("../config/bullMQ.js");
const messageModel = require("../models/messageModel.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGeminiAPI(userText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(userText);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, something went wrong with Gemini.";
  }
}

function startWorker() {
  const worker = new Worker(
    MESSAGE_QUEUE_NAME,
    async (job) => {
      const { chatroom_id, text } = job.data;

      const geminiReply = await callGeminiAPI(text);
      await messageModel.addGeminiMessage(chatroom_id, geminiReply);

      return { reply: geminiReply };
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
