const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true
    },

    temperature: {
      type: Number
    },

    appetite: {
      type: String,
      enum: ["good", "normal", "poor"]
    },

    activityLevel: {
      type: String,
      enum: ["active", "normal", "low"]
    },

    milkProduction: {
      type: Number
    },

    symptoms: {
      type: String,
      trim: true
    },

    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);