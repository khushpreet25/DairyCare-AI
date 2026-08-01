const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const animalRoutes = require("./routes/animalRoutes");
const injectionRoutes = require("./routes/injectionRoutes");
const dietRoutes = require("./routes/dietRoutes");
const healthRoutes = require("./routes/healthRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Middleware
const errorHandler = require(
  "./middleware/errorMiddleware"
);

const noSqlSanitize = require(
  "./middleware/noSqlSanitize"
);


// ==============================
// Load Environment Variables
// ==============================

dotenv.config();


// ==============================
// Connect to MongoDB
// ==============================

connectDB();


// ==============================
// Create Express App
// ==============================

const app = express();


// ==============================
// Security Middleware
// ==============================

// Secure HTTP headers

app.use(
  helmet()
);


// ==============================
// Secure CORS Configuration
// ==============================

const allowedOrigins = [

  // React frontend

  "http://localhost:3000",

  // Vite frontend

  "http://localhost:5173"

];


const corsOptions = {

  origin: function (
    origin,
    callback
  ) {

    // Allow Postman, Thunder Client,
    // mobile apps, and server requests

    if (!origin) {

      return callback(
        null,
        true
      );

    }


    // Allow trusted frontend URLs

    if (
      allowedOrigins.includes(
        origin
      )
    ) {

      return callback(
        null,
        true
      );

    }


    // Block unknown websites

    return callback(

      new Error(
        "CORS policy: This origin is not allowed"
      )

    );

  },


  methods: [

    "GET",

    "POST",

    "PUT",

    "PATCH",

    "DELETE"

  ],


  allowedHeaders: [

    "Content-Type",

    "Authorization"

  ],


  credentials: true

};


// Apply secure CORS

app.use(
  cors(corsOptions)
);


// ==============================
// Parse JSON Requests
// ==============================

app.use(
  express.json({
    limit: "10kb"
  })
);


// ==============================
// NoSQL Injection Protection
// ==============================

app.use(
  noSqlSanitize
);


// ==============================
// General API Rate Limiter
// ==============================

const apiLimiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 100,

  message: {

    message:
      "Too many requests. Please try again later."

  },

  standardHeaders: true,

  legacyHeaders: false

});


// Apply to all API routes

app.use(
  "/api",
  apiLimiter
);


// ==============================
// Login Rate Limiter
// ==============================

const loginLimiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  // Keep 20 temporarily for testing.
  // Change to 5 after testing.

  max: 5,

  message: {

    message:
      "Too many login attempts. Please try again after 15 minutes."

  },

  standardHeaders: true,

  legacyHeaders: false

});


// Apply only to login

app.use(

  "/api/auth/login",

  loginLimiter

);


// ==============================
// API Routes
// ==============================

app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/farms",
  farmRoutes
);


app.use(
  "/api/animals",
  animalRoutes
);


app.use(
  "/api/injections",
  injectionRoutes
);


app.use(
  "/api/diets",
  dietRoutes
);


app.use(
  "/api/health-records",
  healthRoutes
);


app.use(
  "/api/reminders",
  reminderRoutes
);


app.use(
  "/api/dashboard",
  dashboardRoutes
);


app.use(
  "/api/ai",
  aiRoutes
);


// ==============================
// Health Check Route
// ==============================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({

      message:
        "DairyCare AI Backend is running",

      status:
        "success"

    });

  }
);


// ==============================
// Test Error Handler
// ==============================

app.get(

  "/api/test-error",

  (req, res, next) => {

    const error =
      new Error(

        "Centralized error handler is working"

      );


    error.statusCode = 400;


    next(error);

  }

);


// ==============================
// Centralized Error Handler
// Must be after all routes
// ==============================

app.use(
  errorHandler
);


// ==============================
// Start Server
// ==============================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(

      `Server running on port ${PORT}`

    );

  }
);