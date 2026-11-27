
const User = require("../models/User");
const Achievement = require("../models/Achievement");
const Reward = require("../models/Reward");

// Get dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAchievements = await Achievement.countDocuments();
    const totalTransactions = await Reward.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalAchievements,
        totalTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin statistics."
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch users."
    });
  }
};

// Activate or deactivate a user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false."
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role === "admin" && !isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deactivated here."
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update user status."
    });
  }
};

// Get all reward transactions
const getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch reward transactions."
    });
  }
};

// Create achievement for a user
const createAchievement = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      icon,
      target,
      xpReward
    } = req.body;

    if (!userId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "User ID, title and description are required."
      });
    }

    if (
      (target !== undefined &&
        (!Number.isInteger(target) || target < 1)) ||
      (xpReward !== undefined &&
        (!Number.isInteger(xpReward) || xpReward < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Target must be a positive integer and XP reward a non-negative integer."
      });
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const achievement = await Achievement.create({
      user: userId,
      title,
      description,
      icon,
      target,
      xpReward
    });

    res.status(201).json({
      success: true,
      message: "Achievement created successfully.",
      achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create achievement."
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAllRewards,
  createAchievement
};
