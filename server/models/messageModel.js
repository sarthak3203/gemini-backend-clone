const { pool } = require("../config/db");

function formatMessage(row) {
  return row || null;
}

async function getChatroomOwnerId(chatroomId) {
  const result = await pool.query(
    `SELECT user_id
     FROM chatrooms
     WHERE id = $1`,
    [Number(chatroomId)]
  );

  return result.rows[0]?.user_id || null;
}

async function addUserMessage(chatroom_id, text) {
  const userId = await getChatroomOwnerId(chatroom_id);
  if (!userId) {
    throw new Error("Chatroom not found");
  }

  const result = await pool.query(
    `INSERT INTO messages (chatroom_id, user_id, sender, message_text, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, chatroom_id, sender, message_text, status, created_at`,
    [Number(chatroom_id), userId, "USER", text, "pending"]
  );

  return formatMessage(result.rows[0]);
}

async function updateMessageStatus(messageId, status) {
  const result = await pool.query(
    `UPDATE messages
     SET status = $2
     WHERE id = $1
     RETURNING id, chatroom_id, sender, message_text, status, created_at`,
    [Number(messageId), status]
  );

  return formatMessage(result.rows[0]);
}

async function addGeminiMessage(chatroom_id, text) {
  const userId = await getChatroomOwnerId(chatroom_id);
  if (!userId) {
    throw new Error("Chatroom not found");
  }

  const result = await pool.query(
    `INSERT INTO messages (chatroom_id, user_id, sender, message_text, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, chatroom_id, sender, message_text, status, created_at`,
    [Number(chatroom_id), userId, "GEMINI", text, "completed"]
  );

  return formatMessage(result.rows[0]);
}

module.exports = {
  addUserMessage,
  addGeminiMessage,
  updateMessageStatus,
};
