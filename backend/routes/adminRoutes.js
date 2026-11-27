
const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAllRewards,
  createAchievement
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/rewards", getAllRewards);
router.post("/achievements", createAchievement);

module.exports = router;
