const {
  body,
  validationResult
} = require("express-validator");


const validateInjection = [

  // Validate Animal ID
  body("animalId")
    .notEmpty()
    .withMessage("Animal ID is required")
    .isMongoId()
    .withMessage("Animal ID is invalid"),


  // Validate Injection Name
  body("injectionName")
    .trim()
    .notEmpty()
    .withMessage("Injection name is required")
    .isLength({
      min: 2,
      max: 100
    })
    .withMessage(
      "Injection name must be between 2 and 100 characters"
    ),


  // Validate Date Given
  body("dateGiven")
    .notEmpty()
    .withMessage("Date given is required")
    .isISO8601()
    .withMessage(
      "Date given must be a valid date"
    ),


  // Validate Next Due Date
  body("nextDueDate")
    .notEmpty()
    .withMessage(
      "Next due date is required"
    )
    .isISO8601()
    .withMessage(
      "Next due date must be a valid date"
    )
    .custom((value, { req }) => {

      const dateGiven =
        new Date(req.body.dateGiven);

      const nextDueDate =
        new Date(value);

      if (nextDueDate < dateGiven) {
        throw new Error(
          "Next due date cannot be earlier than date given"
        );
      }

      return true;
    }),


  // Validate Veterinarian Name
  body("veterinarianName")
    .optional()
    .trim()
    .isLength({
      min: 2,
      max: 60
    })
    .withMessage(
      "Veterinarian name must be between 2 and 60 characters"
    ),


  // Validate Notes
  body("notes")
    .optional()
    .trim()
    .isLength({
      max: 500
    })
    .withMessage(
      "Notes cannot exceed 500 characters"
    ),


  // Send validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Injection validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = validateInjection;