const userModel = require('../models/userModel'); 
const FREE_DAILY_LIMIT = 20;

async function createProSubscription(req, res){
  try {
    const user = req.user; 
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.status(503).json({
      success: false,
      code: "PRO_SUBSCRIPTION_COMING_SOON",
      message: "Pro subscriptions are under development. Free users can currently send up to 20 messages per day.",
    });
  } catch (error) {
    console.error("Create pro subscription error:", error);
    res.status(500).json({ success: false, error: "Failed to load subscription info" });
  }
};


async function checkSubscriptionStatus(req, res) {
    try {
        const user = req.user
        if(!user){
            return res.status(400).json({success:false,message:"user not found or unauthorized"})
        }

        const id = user.id;
        const status = await userModel.checkUserStatus(id);
        const subscription_status = status?.subscription || "BASIC";

        return res.status(200).json({
          success:true,
          message:`User subscription is ${subscription_status}`,
          subscription: subscription_status,
          limits: {
            free_daily_messages: FREE_DAILY_LIMIT,
          },
          pro: {
            available: false,
            message: "We are working on this feature.",
          },
        })
        
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
        
    }
    
}



module.exports = {
    createProSubscription,
    checkSubscriptionStatus
}
