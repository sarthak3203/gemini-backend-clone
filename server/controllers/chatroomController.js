const { getRedisClient, ensureRedisReady } = require("../config/redis.js");
const chatroomModel = require("../models/chatroomModel.js")

function getChatroomsCacheKey(userId) {
    return `app:chatrooms:${userId}`;
}

async function postChatroom(req,res){
    try {
        const {title} = req.body;
        if(!title){
            return res.status(400).json({success:false, message:"title is required"})
        }
        const user = req.user;
        if(!user){
            return res.status(404).json({success:false, message:"user not found or user not authenticated"})
        }
        const user_name = user.name;
        const user_id=user.id;
        const redis = await ensureRedisReady(getRedisClient());

        const chatroom = await chatroomModel.createChatroom(title,user_name,user_id)

        const cacheKey = getChatroomsCacheKey(user_id);
        await redis.del(cacheKey);

        return res.status(200).json({success:true, message:`Chatroom created successfully with id for user id ${user_id}`, chatroom})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
        
    }
}

async function getChatrooms(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user_id = user.id;
    const redis = await ensureRedisReady(getRedisClient());

    const cacheKey = getChatroomsCacheKey(user_id);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        chatrooms: JSON.parse(cachedData),
      });
    }

    const chatrooms = await chatroomModel.getChatroomsByUser(user_id);

    await redis.set(cacheKey, JSON.stringify(chatrooms), "EX", 600);

    return res.status(200).json({
      success: true,
      source: "db",
      chatrooms,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getChatroomById(req, res) {
  try {
    const id = req.params.id;
    const user = req.user;

    if (!id) {
      return res.status(404).json({ success: false, message: "Chatroom ID not found" });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const chatroom = await chatroomModel.findChatroomByIdForUser(id, user.id);
    if (!chatroom) {
      return res.status(404).json({ success: false, message: "Chatroom not found" });
    }

    const messages = await chatroomModel.findMessagesByChatroomId(id);

    return res.status(200).json({
      success: true,
      message: "Chatroom details with messages",
      data: {
        chatroom,
        messages,
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}



module.exports = {
    postChatroom,
    getChatrooms,
    getChatroomById
}
