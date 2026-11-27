
const express = require("express");
const router = express.Router();

const {
  getAchievements,
  getRewardHistory
} = require("../controllers/rewardController");

const { protect } = require("../middleware/authMiddleware");

// Protected achievement API
router.get("/achievements", protect, getAchievements);

// Protected reward history API
router.get("/history", protect, getRewardHistory);

module.exports = router;
