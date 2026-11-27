
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Achievement = require("./models/Achievement");
const Reward = require("./models/Reward");

async function seedRewards() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email: "testuser@example.com"
    });

    if (!user) {
      console.log("Test user not found. Please register first.");
      return;
    }

    // Avoid duplicate sample records
    await Achievement.deleteMany({ user: user._id });
    await Reward.deleteMany({ user: user._id });

    await Achievement.insertMany([
      {
        user: user._id,
        title: "Welcome to VELOop",
        description: "Successfully created your VELOop account.",
        icon: "🎉",
        target: 1,
        progress: 1,
        xpReward: 100,
        isCompleted: true,
        completedAt: new Date()
      },
      {
        user: user._id,
        title: "First Steps",
        description: "Complete your first rewards activity.",
        icon: "🚀",
        target: 5,
        progress: 2,
        xpReward: 200,
        isCompleted: false
      },
      {
        user: user._id,
        title: "Reward Explorer",
        description: "Explore the VELOop rewards system.",
        icon: "🏆",
        target: 3,
        progress: 1,
        xpReward: 150,
        isCompleted: false
      }
    ]);

    await Reward.insertMany([
      {
        user: user._id,
        type: "VE",
        transactionType: "EARNED",
        amount: 50,
        description: "Welcome bonus",
        status: "COMPLETED"
      },
      {
        user: user._id,
        type: "GEMS",
        transactionType: "BONUS",
        amount: 10,
        description: "Registration reward",
        status: "COMPLETED"
      },
      {
        user: user._id,
        type: "XP",
        transactionType: "EARNED",
        amount: 100,
        description: "Welcome achievement",
        status: "COMPLETED"
      }
    ]);

    console.log("Sample achievements and rewards added successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedRewards();
