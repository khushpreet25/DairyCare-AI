const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    animalTagId: {
      type: String,
      required: true,
      trim: true
    },

    name: {
      type: String,
      trim: true
    },

    breed: {
      type: String,
      required: true
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    },

    dateOfBirth: {
      type: Date
    },

    weight: {
      type: Number
    },

    milkProduction: {
      type: Number
    },

    pregnancyStatus: {
      type: Boolean,
      default: false
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Animal", animalSchema);