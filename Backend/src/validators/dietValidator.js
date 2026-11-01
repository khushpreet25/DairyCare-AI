const {
  body,
  validationResult,
} = require("express-validator");

// =====================================================
// DIET PLAN VALIDATOR
// =====================================================

const validateDietPlan = [

  // ===================================================
  // ANIMAL ID
  // ===================================================

  body("animalId")
    .trim()
    .notEmpty()
    .withMessage("Animal ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid Animal ID"),

  // ===================================================
  // FEED NAME
  // ===================================================

  body("feedName")
    .trim()
    .notEmpty()
    .withMessage("Feed name is required")
    .bail()
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Feed name must be between 2 and 100 characters"
    ),

  // ===================================================
  // QUANTITY
  // ===================================================

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isFloat({
      gt: 0,
    })
    .withMessage(
      "Quantity must be greater than 0"
    )
    .toFloat(),

  // ===================================================
  // FEEDING TIME
  // ===================================================

  body("feedingTime")
    .trim()
    .notEmpty()
    .withMessage("Feeding time is required")
    .bail()
    .isIn([
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
    ])
    .withMessage(
      "Feeding time must be Morning, Afternoon, Evening or Night"
    ),

  // ===================================================
  // NUTRITIONAL NOTES
  // ===================================================

  body("nutritionalNotes")
    .optional({
      values: "falsy",
    })
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Nutritional notes cannot exceed 500 characters"
    ),

  // ===================================================
  // START DATE
  // ===================================================

  body("startDate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required")
    .bail()
    .isISO8601({
      strict: true,
      strictSeparator: true,
    })
    .withMessage(
      "Start date must be in YYYY-MM-DD format"
    ),

  // ===================================================
  // END DATE
  // ===================================================

  body("endDate")
    .trim()
    .notEmpty()
    .withMessage("End date is required")
    .bail()
    .isISO8601({
      strict: true,
      strictSeparator: true,
    })
    .withMessage(
      "End date must be in YYYY-MM-DD format"
    )
    .bail()
    .custom((endDate, { req }) => {

      const start = new Date(
        `${req.body.startDate}T00:00:00`
      );

      const end = new Date(
        `${endDate}T00:00:00`
      );

      if (Number.isNaN(start.getTime())) {
        throw new Error(
          "Invalid start date"
        );
      }

      if (Number.isNaN(end.getTime())) {
        throw new Error(
          "Invalid end date"
        );
      }

      if (end < start) {
        throw new Error(
          "End date cannot be earlier than start date"
        );
      }

      return true;
    }),

  // ===================================================
  // VALIDATION RESULT
  // ===================================================

  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      console.log(
        "DIET VALIDATION ERRORS:",
        errors.array()
      );

      return res.status(400).json({
        message:
          "Diet plan validation failed",

        errors:
          errors.array(),
      });
    }

    next();
  },
];

module.exports = validateDietPlan;