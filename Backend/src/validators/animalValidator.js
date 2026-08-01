const {
  body,
  validationResult
} = require("express-validator");


const validateAnimal = [

  // Animal tag ID
  body("animalTagId")
    .trim()
    .notEmpty()
    .withMessage(
      "Animal tag ID is required"
    )
    .isLength({
      min: 2,
      max: 30
    })
    .withMessage(
      "Animal tag ID must be between 2 and 30 characters"
    ),


  // Animal name
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Animal name is required"
    )
    .isLength({
      min: 2,
      max: 50
    })
    .withMessage(
      "Animal name must be between 2 and 50 characters"
    ),


  // Breed
  body("breed")
    .trim()
    .notEmpty()
    .withMessage(
      "Breed is required"
    )
    .isLength({
      min: 2,
      max: 50
    })
    .withMessage(
      "Breed must be between 2 and 50 characters"
    ),


  // Gender
  body("gender")
    .notEmpty()
    .withMessage(
      "Gender is required"
    )
    .isIn([
      "male",
      "female"
    ])
    .withMessage(
      "Gender must be male or female"
    ),


  // Date of birth
  body("dateOfBirth")
    .notEmpty()
    .withMessage(
      "Date of birth is required"
    )
    .isISO8601()
    .withMessage(
      "Enter a valid date"
    ),


  // Weight
  body("weight")
    .notEmpty()
    .withMessage(
      "Weight is required"
    )
    .isFloat({
      min: 0
    })
    .withMessage(
      "Weight must be a positive number"
    ),


  // Milk production
  body("milkProduction")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Milk production cannot be negative"
    ),


  // Pregnancy status
  body("pregnancyStatus")
    .optional()
    .isBoolean()
    .withMessage(
      "Pregnancy status must be true or false"
    ),


  // Farm ID
  body("farmId")
    .notEmpty()
    .withMessage(
      "Farm ID is required"
    )
    .isMongoId()
    .withMessage(
      "Farm ID is invalid"
    ),


  // Return validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message:
          "Animal validation failed",

        errors:
          errors.array()
      });

    }

    next();

  }

];


module.exports = validateAnimal;