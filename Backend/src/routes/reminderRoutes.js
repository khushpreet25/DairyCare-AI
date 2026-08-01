const express = require("express");
const Reminder = require("../models/Reminder");
const protect = require("../middleware/authMiddleware");
const createAuditLog = require(
  "../services/auditLogService"
);

const validateReminder = require(
  "../validators/reminderValidator"
);
const router = express.Router();


// Create a reminder
router.post("/", protect,validateReminder, async (req, res) => {
  try {
    const {
      animalId,
      reminderType,
      title,
      dueDate
    } = req.body;

    // Validate required fields
    if (!animalId || !reminderType || !title || !dueDate) {
      return res.status(400).json({
        message:
          "Animal ID, reminder type, title, and due date are required"
      });
    }

    // Create reminder
    const reminder = await Reminder.create({
      animalId,
      reminderType,
      title,
      dueDate
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder
    });

  } catch (error) {
    res.status(500).json({
      message: "Reminder creation failed",
      error: error.message
    });
  }
});


// Get all reminders for an animal
router.get("/:animalId", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      animalId: req.params.animalId
    });

    res.status(200).json({
      message: "Reminders fetched successfully",
      reminders
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reminders",
      error: error.message
    });
  }
});


// Mark reminder as completed
router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    // Mark reminder as completed
    router.patch(
      "/:id/complete",
      protect,
      async (req, res) => {
        try {

          const reminder =
            await Reminder.findByIdAndUpdate(
              req.params.id,
              {
                status: "completed"
              },
              {
                new: true
              }
            );

          // Check whether reminder exists
          if (!reminder) {
            return res.status(404).json({
              message: "Reminder not found"
            });
          }

          // Create audit log
          await createAuditLog({
            userId: req.user.userId,
            action: "UPDATE",
            module: "REMINDER",
            description:
              `Marked reminder "${reminder.title}" ` +
              `as completed`,
            ipAddress: req.ip
          });

          res.status(200).json({
            message:
              "Reminder marked as completed",
            reminder
          });

        } catch (error) {

          console.error(
            "Reminder completion error:",
            error
          );

          res.status(500).json({
            message:
              "Failed to update reminder",
            error: error.message
          });

        }
      }
    );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      message: "Reminder marked as completed",
      reminder
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update reminder",
      error: error.message
    });
  }
});


module.exports = router;