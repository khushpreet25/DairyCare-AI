const {
  body,
  validationResult
} = require("express-validator");


const validateDietPlan = [

  // Validate Animal ID
  body("animalId")
    .notEmpty()
    .withMessage("Animal ID is required")
    .isMongoId()
    .withMessage("Animal ID is invalid"),


  // Validate Feed Name
  body("feedName")
    .trim()
    .notEmpty()
    .withMessage("Feed name is required")
    .isLength({
      min: 2,
      max: 100
    })
    .withMessage(
      "Feed name must be between 2 and 100 characters"
    ),


  // Validate Quantity
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isFloat({
      gt: 0
    })
    .withMessage(
      "Quantity must be greater than 0"
    ),


  // Validate Feeding Time
  body("feedingTime")
    .trim()
    .notEmpty()
    .withMessage(
      "Feeding time is required"
    )
    .isLength({
      min: 2,
      max: 50
    })
    .withMessage(
      "Feeding time must be between 2 and 50 characters"
    ),


  // Validate Start Date
  body("startDate")
    .notEmpty()
    .withMessage(
      "Start date is required"
    )
    .isISO8601()
    .withMessage(
      "Start date must be valid"
    ),


  // Validate End Date
  body("endDate")
    .notEmpty()
    .withMessage(
      "End date is required"
    )
    .isISO8601()
    .withMessage(
      "End date must be valid"
    )
    .custom((value, { req }) => {

      const startDate =
        new Date(req.body.startDate);

      const endDate =
        new Date(value);

      if (endDate < startDate) {
        throw new Error(
          "End date cannot be earlier than start date"
        );
      }

      return true;
    }),


  // Validate Nutritional Notes
  body("nutritionalNotes")
    .optional()
    .trim()
    .isLength({
      max: 500
    })
    .withMessage(
      "Nutritional notes cannot exceed 500 characters"
    ),


  // Return validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Diet plan validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = validateDietPlan;