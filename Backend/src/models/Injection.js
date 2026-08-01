const mongoose = require("mongoose");

const injectionSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true
    },

    injectionName: {
      type: String,
      required: true,
      trim: true
    },

    dateGiven: {
      type: Date,
      required: true
    },

    nextDueDate: {
      type: Date,
      required: true
    },

    veterinarianName: {
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

module.exports = mongoose.model("Injection", injectionSchema);