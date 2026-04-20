const messageModel = require("../models/messageModel.js");
const { getMessageQueue, getQueueEvents } = require("../config/bullMQ.js");
const { incrementUserResponseCount } = require("../utils/redisHelper.js");
const chatroomModel = require("../models/chatroomModel.js");

async function postMessage(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: chatroom_id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Message text required" });
    }

    const chatroom = await chatroomModel.findChatroomByIdForUser(chatroom_id, user.id);
    if (!chatroom) {
      return res.status(404).json({ success: false, message: "Chatroom not found" });
    }

    const userMessage = await messageModel.addUserMessage(chatroom_id, text);

    await incrementUserResponseCount(user.id);

    const messageQueue = getMessageQueue();
    const job = await messageQueue.add("process-message", {
      chatroom_id,
      text,
      user_message_id: userMessage.id,
    });

    const qe = getQueueEvents();
    await qe.waitUntilReady();

    try {
      const result = await job.waitUntilFinished(qe, 20000); // 20s timeout
      return res.status(200).json({
        success: true,
        message: text,
        gemini_reply: result.reply,
      });
    } catch (err) {
      if (err?.message && !err.message.toLowerCase().includes("timed out")) {
        return res.status(503).json({
          success: false,
          message: "Gemini is currently unavailable. Please try again later.",
          error: err.message,
        });
      }

      return res.status(202).json({
        success: true,
        message: text,
        status: "processing",
        info: "Gemini response will be available soon. Fetch messages later.",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { postMessage };
