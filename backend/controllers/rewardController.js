
const Achievement = require("../models/Achievement");
const Reward = require("../models/Reward");

// Get achievements belonging to the logged-in user
const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    console.error("Achievement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch achievements."
    });
  }
};

// Get reward transaction history of the logged-in user
const getRewardHistory = async (req, res) => {
  try {
    const rewards = await Reward.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rewards.length,
      rewards
    });
  } catch (error) {
    console.error("Reward history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reward history."
    });
  }
};

module.exports = {
  getAchievements,
  getRewardHistory
};
