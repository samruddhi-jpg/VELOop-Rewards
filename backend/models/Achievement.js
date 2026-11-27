
const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: "🏆"
    },
    target: {
      type: Number,
      default: 1,
      min: 1
    },
    progress: {
      type: Number,
      default: 0,
      min: 0
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", achievementSchema);
