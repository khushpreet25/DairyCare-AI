const {
  body,
  validationResult
} = require("express-validator");


// ==============================
// Register Validation Rules
// ==============================

const validateRegister = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({
      min: 2,
      max: 50
    })
    .withMessage(
      "Name must be between 2 and 50 characters"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8
    })
    .withMessage(
      "Password must contain at least 8 characters"
    ),

  body("role")
    .optional()
    .isIn([
      "farmer",
      "veterinarian",
      "admin"
    ])
    .withMessage(
      "Role must be farmer, veterinarian, or admin"
    ),


  // Send validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


// ==============================
// Login Validation Rules
// ==============================

const validateLogin = [

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    ),

  // Send validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = {
  validateRegister,
  validateLogin
};