const { pool } = require("../config/db");

function formatChatroom(row) {
  return row || null;
}

async function createChatroom(title, user_name, user_id) {
  const result = await pool.query(
    `INSERT INTO chatrooms (title, user_id, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, title, user_id, created_by, created_at`,
    [title, user_id, user_name]
  );

  return formatChatroom(result.rows[0]);
}

async function getChatroomsByUser(user_id) {
  const result = await pool.query(
    `SELECT id, title, user_id, created_by, created_at
     FROM chatrooms
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );

  return result.rows.map(formatChatroom);
}

async function findChatroomById(id) {
  const result = await pool.query(
    `SELECT id, title, user_id, created_by, created_at
     FROM chatrooms
     WHERE id = $1`,
    [Number(id)]
  );

  return formatChatroom(result.rows[0]);
}

async function findMessagesByChatroomId(chatroomId) {
  const result = await pool.query(
    `SELECT id, sender, message_text
     FROM messages
     WHERE chatroom_id = $1
     ORDER BY created_at ASC`,
    [Number(chatroomId)]
  );

  return result.rows;
}

module.exports = {
  createChatroom,
  getChatroomsByUser,
  findChatroomById,
  findMessagesByChatroomId,
};
