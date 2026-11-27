
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          fullName: ADMIN_NAME.trim(),
          password: hashedPassword,
          role: "admin",
          isActive: true
        },
        $setOnInsert: { email }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log("Admin account created/updated successfully.");
    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
