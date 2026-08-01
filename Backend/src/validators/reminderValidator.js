const {
  body,
  validationResult
} = require("express-validator");


const validateReminder = [

  // =========================
  // Validate Animal ID
  // =========================

  body("animalId")
    .notEmpty()
    .withMessage(
      "Animal ID is required"
    )
    .isMongoId()
    .withMessage(
      "Animal ID is invalid"
    ),


  // =========================
  // Validate Reminder Type
  // =========================

  body("reminderType")
    .notEmpty()
    .withMessage(
      "Reminder type is required"
    )
    .isIn([
      "injection",
      "diet",
      "health"
    ])
    .withMessage(
      "Reminder type must be injection, diet, or health"
    ),


  // =========================
  // Validate Title
  // =========================

  body("title")
    .trim()
    .notEmpty()
    .withMessage(
      "Reminder title is required"
    )
    .isLength({
      min: 2,
      max: 100
    })
    .withMessage(
      "Reminder title must be between 2 and 100 characters"
    ),


  // =========================
  // Validate Due Date
  // =========================

  body("dueDate")
    .notEmpty()
    .withMessage(
      "Due date is required"
    )
    .isISO8601()
    .withMessage(
      "Due date must be a valid date"
    ),


  // =========================
  // Validate Status
  // =========================

  body("status")
    .optional()
    .isIn([
      "pending",
      "completed"
    ])
    .withMessage(
      "Status must be pending or completed"
    ),


  // =========================
  // Send Validation Errors
  // =========================

  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Reminder validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = validateReminder;