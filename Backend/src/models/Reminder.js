const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    // Animal for which the reminder is created
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: [true, "Animal ID is required"]
    },

    // Type of reminder
    reminderType: {
      type: String,
      required: [true, "Reminder type is required"],
      enum: {
        values: [
          "injection",
          "diet",
          "health"
        ],
        message:
          "Reminder type must be injection, diet, or health"
      },
      lowercase: true,
      trim: true
    },

    // Reminder title
    title: {
      type: String,
      required: [true, "Reminder title is required"],
      trim: true,
      minlength: [
        2,
        "Reminder title must contain at least 2 characters"
      ],
      maxlength: [
        100,
        "Reminder title cannot exceed 100 characters"
      ]
    },

    // Date of the reminder
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },

    // Reminder status
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "completed"
        ],
        message:
          "Status must be pending or completed"
      },
      default: "pending",
      lowercase: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Reminder",
  reminderSchema
);