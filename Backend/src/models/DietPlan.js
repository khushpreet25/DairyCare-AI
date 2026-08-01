const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true
    },

    feedName: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true
    },

    feedingTime: {
      type: String,
      required: true
    },

    nutritionalNotes: {
      type: String,
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);