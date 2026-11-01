const {
  body,
  validationResult
} = require("express-validator");


const validateReminder = [

  // =====================================================
  // ANIMAL ID
  // =====================================================

  body("animalId")
    .notEmpty()
    .withMessage("Animal ID is required")
    .isMongoId()
    .withMessage("Invalid Animal ID"),


  // =====================================================
  // REMINDER TYPE
  // =====================================================

  body("reminderType")
    .notEmpty()
    .withMessage("Reminder type is required")
    .isIn([
      "injection",
      "diet",
      "health"
    ])
    .withMessage(
      "Reminder type must be injection, diet or health"
    ),


  // =====================================================
  // TITLE
  // =====================================================

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Reminder title is required")
    .isLength({
      min: 2,
      max: 100
    })
    .withMessage(
      "Reminder title must be between 2 and 100 characters"
    ),


  // =====================================================
  // DUE DATE
  // =====================================================

  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage(
      "Due date must be a valid date"
    ),


  // =====================================================
  // VALIDATION RESULT
  // =====================================================

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


module.exports =
  validateReminder;