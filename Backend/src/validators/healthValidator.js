const {
  body,
  validationResult
} = require("express-validator");


const validateHealthRecord = [

  // Validate Animal ID
  body("animalId")
    .notEmpty()
    .withMessage("Animal ID is required")
    .isMongoId()
    .withMessage("Animal ID is invalid"),


  // Validate Temperature
  body("temperature")
    .optional()
    .isFloat({
      min: 30,
      max: 45
    })
    .withMessage(
      "Temperature must be between 30 and 45°C"
    ),


  // Validate Appetite
  body("appetite")
    .optional()
    .isIn([
      "good",
      "normal",
      "poor"
    ])
    .withMessage(
      "Appetite must be good, normal, or poor"
    ),


  // Validate Activity Level
  body("activityLevel")
    .optional()
    .isIn([
      "active",
      "normal",
      "low"
    ])
    .withMessage(
      "Activity level must be active, normal, or low"
    ),


  // Validate Milk Production
  body("milkProduction")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Milk production cannot be negative"
    ),


  // Validate Symptoms
  body("symptoms")
    .optional()
    .trim()
    .isLength({
      max: 500
    })
    .withMessage(
      "Symptoms cannot exceed 500 characters"
    ),


  // Validate Notes
  body("notes")
    .optional()
    .trim()
    .isLength({
      max: 1000
    })
    .withMessage(
      "Notes cannot exceed 1000 characters"
    ),


  // Return validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Health record validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = validateHealthRecord;