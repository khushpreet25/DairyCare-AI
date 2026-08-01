const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const createAuditLog = require(
  "../services/auditLogService"
);

const {
  body,
  validationResult
} = require("express-validator");

const {
  validateLogin
} = require(
  "../validators/authValidator"
);


// ========================================
// REGISTRATION VALIDATION
// ========================================

const validateRegistration = [

  // Validate name
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Name is required"
    )
    .isLength({
      min: 2,
      max: 50
    })
    .withMessage(
      "Name must be between 2 and 50 characters"
    ),

  // Validate email
  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail(),

  // Strong password validation
  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    )
    .isLength({
      min: 8
    })
    .withMessage(
      "Password must contain at least 8 characters"
    )
    .matches(/[A-Z]/)
    .withMessage(
      "Password must contain at least one uppercase letter"
    )
    .matches(/[a-z]/)
    .withMessage(
      "Password must contain at least one lowercase letter"
    )
    .matches(/[0-9]/)
    .withMessage(
      "Password must contain at least one number"
    )
    .matches(/[^A-Za-z0-9]/)
    .withMessage(
      "Password must contain at least one special character"
    ),

  // Send validation errors
  (req, res, next) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({

        message:
          "Registration validation failed",

        errors:
          errors.array()

      });

    }

    next();

  }

];


const router = express.Router();


// ========================================
// REGISTER
// POST /api/auth/register
// ========================================

router.post(
  "/register",
  validateRegistration,
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        role
      } = req.body;


      // Check if user already exists

      const existingUser =
        await User.findOne({

          email:
            email.toLowerCase()

        });


      if (existingUser) {

        return res.status(409).json({

          message:
            "User already exists"

        });

      }


      // Allowed roles

      const allowedRoles = [

        "farmer",
        "veterinarian",
        "admin"

      ];


      // Farmer is the default role

      const selectedRole =
        role || "farmer";


      // Validate role

      if (
        !allowedRoles.includes(
          selectedRole
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid role"

        });

      }


      // Hash password

      const passwordHash =
        await bcrypt.hash(

          password,

          12

        );


      // Create user

      const user =
        await User.create({

          name,

          email:
            email.toLowerCase(),

          passwordHash,

          role:
            selectedRole

        });


      return res.status(201).json({

        message:
          "User registered successfully",

        userId:
          user._id

      });


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      return res.status(500).json({

        message:
          "Registration failed",

        error:
          error.message

      });

    }

  }
);


// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

router.post(
  "/login",
  validateLogin,
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      // Find user

      const user =
        await User.findOne({

          email:
            email.toLowerCase()

        });


      // ====================================
      // USER DOES NOT EXIST
      // ====================================

      if (!user) {

        await createAuditLog({

          userId:
            null,

          action:
            "FAILED_LOGIN",

          module:
            "AUTH",

          description:
            `Failed login attempt for email: ${email}`,

          ipAddress:
            req.ip

        });


        return res.status(401).json({

          message:
            "Invalid email or password"

        });

      }


      // ====================================
      // CHECK ACCOUNT LOCK
      // This must be before password check
      // ====================================

      if (
        user.lockUntil &&
        user.lockUntil.getTime() >
          Date.now()
      ) {

        const remainingMinutes =
          Math.ceil(

            (
              user.lockUntil.getTime() -
              Date.now()
            ) /
            (
              1000 * 60
            )

          );


        return res.status(423).json({

          message:
            `Account is locked. Try again after ${remainingMinutes} minute(s).`

        });

      }


      // ====================================
      // CHECK PASSWORD
      // ====================================

      const isMatch =
        await bcrypt.compare(

          password,

          user.passwordHash

        );


      // ====================================
      // WRONG PASSWORD
      // ====================================

      if (!isMatch) {

        // Increase failed login attempts

        user.loginAttempts =
          (
            user.loginAttempts || 0
          ) + 1;


        // Lock account after 5 attempts

        if (
          user.loginAttempts >= 5
        ) {

          user.lockUntil =
            new Date(

              Date.now() +
              15 *
              60 *
              1000

            );

        }


        // Save attempts and lock time

        await user.save();


        // Create failed-login audit log

        await createAuditLog({

          userId:
            user._id,

          action:
            "FAILED_LOGIN",

          module:
            "AUTH",

          description:
            `Incorrect password for ${email}. Failed attempt: ${user.loginAttempts}`,

          ipAddress:
            req.ip

        });


        // Fifth wrong attempt:
        // return account locked

        if (
          user.lockUntil &&
          user.lockUntil.getTime() >
            Date.now()
        ) {

          return res.status(423).json({

            message:
              "Account locked for 15 minutes because of too many failed login attempts."

          });

        }


        // Attempts 1 to 4

        return res.status(401).json({

          message:
            "Invalid email or password",

          attemptsRemaining:
            5 -
            user.loginAttempts

        });

      }


      // ====================================
      // SUCCESSFUL LOGIN
      // Reset security fields
      // ====================================

      user.loginAttempts = 0;

      user.lockUntil = null;

      await user.save();


      // Generate JWT token

      const token =
        jwt.sign(

          {

            userId:
              user._id,

            role:
              user.role

          },

          process.env.JWT_SECRET,

          {

            expiresIn:
              "7d"

          }

        );


      // Create successful-login audit log

      await createAuditLog({

        userId:
          user._id,

        action:
          "LOGIN",

        module:
          "AUTH",

        description:
          `User logged in successfully: ${user.email}`,

        ipAddress:
          req.ip

      });


      // Return successful login

      return res.status(200).json({

        message:
          "Login successful",

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role

        }

      });


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      return res.status(500).json({

        message:
          "Login failed",

        error:
          error.message

      });

    }

  }
);


module.exports = router;