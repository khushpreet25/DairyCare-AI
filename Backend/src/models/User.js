const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "farmer",
        "veterinarian",
        "admin"
      ],
      default: "farmer"
    },

    // Number of consecutive failed login attempts
    loginAttempts: {
      type: Number,
      default: 0
    },

    // Time until which the account is locked
    lockUntil: {
      type: Date,
      default: null
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);