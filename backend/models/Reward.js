
const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["VE", "SVE", "GEMS", "TOKENS", "XP"],
      required: true
    },
    transactionType: {
      type: String,
      enum: ["EARNED", "REDEEMED", "BONUS", "WITHDRAWAL"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);
