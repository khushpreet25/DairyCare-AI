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
    required: true,
    min: 1
  },

  feedingTime: {
    type: String,
    required: true,
    enum: [
      "Morning",
      "Afternoon",
      "Evening",
      "Night"
    ]
  },

  nutritionalNotes: {
    type: String,
    trim: true,
    default: ""
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: [
      "Active",
      "Completed"
    ],
    default: "Active"
  }

},
{
  timestamps: true
});

module.exports = mongoose.model(
  "DietPlan",
  dietPlanSchema
);