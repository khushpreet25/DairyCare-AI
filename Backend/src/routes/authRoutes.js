const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const createAuditLog = require("../services/auditLogService");

const {
  body,
  validationResult
} = require("express-validator");

const {
  validateLogin
} = require("../validators/authValidator");

const router = express.Router();


// ======================================================
// REGISTRATION VALIDATION
// ======================================================

const validateRegistration = [

  // Name
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


  // Email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail(),


  // Password
  body("password")
    .notEmpty()
    .withMessage("Password is required")
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


  // Validation result
  (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        message: "Registration validation failed",
        errors: errors.array()
      });

    }

    next();
  }

];


// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================

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


      // -----------------------------------------------
      // Normalize email
      // -----------------------------------------------

      const normalizedEmail =
        email.trim().toLowerCase();


      // -----------------------------------------------
      // Check existing user
      // -----------------------------------------------

      const existingUser =
        await User.findOne({
          email: normalizedEmail
        });


      if (existingUser) {

        return res.status(409).json({
          message: "User already exists"
        });

      }


      // -----------------------------------------------
      // Allowed public registration roles
      // -----------------------------------------------
      //
      // IMPORTANT:
      // Admin accounts cannot be created through
      // public registration.
      //
      // Admin accounts should be created through
      // the secure admin creation process.
      // -----------------------------------------------

      const allowedRoles = [
        "farmer",
        "veterinarian"
      ];


      const selectedRole =
        role || "farmer";


      if (!allowedRoles.includes(selectedRole)) {

        return res.status(400).json({
          message: "Invalid role"
        });

      }


      // -----------------------------------------------
      // Hash password
      // -----------------------------------------------

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      // -----------------------------------------------
      // Create user
      // -----------------------------------------------

      const user =
        await User.create({

          name: name.trim(),

          email: normalizedEmail,

          passwordHash,

          role: selectedRole,

          loginAttempts: 0,

          lockUntil: null

        });


      // -----------------------------------------------
      // Registration success
      // -----------------------------------------------

      console.log(
        `User registered successfully: ${user.email}`
      );


      return res.status(201).json({

        message:
          "User registered successfully",

        userId:
          user._id

      });

    }


    catch (error) {

      console.error(
        "Registration error:",
        error
      );


      return res.status(500).json({

        message:
          "Registration failed",

        error:
          "An internal server error occurred"

      });

    }

  }
);


// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post(
  "/login",
  validateLogin,
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      // -----------------------------------------------
      // Normalize email
      // -----------------------------------------------

      const normalizedEmail =
        email.trim().toLowerCase();


      console.log(
        "Login attempt for:",
        normalizedEmail
      );


      // -----------------------------------------------
      // Find user
      // -----------------------------------------------

      const user =
        await User.findOne({
          email: normalizedEmail
        });


      // -----------------------------------------------
      // User does not exist
      // -----------------------------------------------

      if (!user) {

        console.log(
          "Login failed: user not found"
        );


        await createAuditLog({

          userId: null,

          action: "FAILED_LOGIN",

          module: "AUTH",

          description:
            "Failed login attempt",

          ipAddress:
            req.ip

        });


        return res.status(401).json({

          message:
            "Invalid email or password"

        });

      }


      // -----------------------------------------------
      // Check account lock
      // -----------------------------------------------

      if (
        user.lockUntil &&
        user.lockUntil.getTime() > Date.now()
      ) {

        const remainingMinutes =
          Math.ceil(

            (
              user.lockUntil.getTime() -
              Date.now()
            ) /
            (1000 * 60)

          );


        return res.status(423).json({

          message:
            `Account is locked. Try again after ${remainingMinutes} minute(s).`

        });

      }


      // -----------------------------------------------
      // Check password
      // -----------------------------------------------

      const isMatch =
        await bcrypt.compare(
          password,
          user.passwordHash
        );


      console.log(
        "Password match:",
        isMatch
      );


      // -----------------------------------------------
      // Incorrect password
      // -----------------------------------------------

      if (!isMatch) {

        user.loginAttempts =
          (user.loginAttempts || 0) + 1;


        // Lock after 5 failed attempts
        if (
          user.loginAttempts >= 5
        ) {

          user.lockUntil =
            new Date(
              Date.now() +
              15 * 60 * 1000
            );

        }


        await user.save();


        // Audit log
        await createAuditLog({

          userId:
            user._id,

          action:
            "FAILED_LOGIN",

          module:
            "AUTH",

          description:
            "Incorrect password during login",

          ipAddress:
            req.ip

        });


        // Account locked
        if (
          user.lockUntil &&
          user.lockUntil.getTime() > Date.now()
        ) {

          return res.status(423).json({

            message:
              "Account locked for 15 minutes because of too many failed login attempts."

          });

        }


        // Normal failed attempt
        return res.status(401).json({

          message:
            "Invalid email or password",

          attemptsRemaining:
            Math.max(
              0,
              5 - user.loginAttempts
            )

        });

      }


      // =================================================
      // SUCCESSFUL LOGIN
      // =================================================

      console.log(
        "Login successful:",
        user.email
      );


      // Reset failed login attempts
      user.loginAttempts = 0;

      user.lockUntil = null;

      await user.save();


      // -----------------------------------------------
      // Generate JWT
      // -----------------------------------------------

      if (!process.env.JWT_SECRET) {

        console.error(
          "JWT_SECRET is missing from environment variables"
        );


        return res.status(500).json({

          message:
            "Login failed",

          error:
            "An internal server error occurred"

        });

      }


      const token =
        jwt.sign(

          {

            userId:
              user._id.toString(),

            role:
              user.role

          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d"
          }

        );


      // -----------------------------------------------
      // Successful login audit
      // -----------------------------------------------

      await createAuditLog({

        userId:
          user._id,

        action:
          "LOGIN",

        module:
          "AUTH",

        description:
          "User logged in successfully",

        ipAddress:
          req.ip

      });


      // -----------------------------------------------
      // Send response
      // -----------------------------------------------

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

    }


    catch (error) {

      console.error(
        "Login error:",
        error
      );


      return res.status(500).json({

        message:
          "Login failed",

        error:
          "An internal server error occurred"

      });

    }

  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;