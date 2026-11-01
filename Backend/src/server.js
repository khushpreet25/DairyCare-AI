const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Helmet - secure HTTP headers
app.use(helmet());


// =====================================================
// CORS SECURITY
// =====================================================

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

// Add production frontend URL if available in .env
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without an origin
        // such as Postman/server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        // Allow only trusted frontend origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject unknown origins
        return callback(
            new Error("CORS policy: Origin not allowed")
        );
    },

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());


// =====================================================
// RATE LIMITING
// =====================================================

// -----------------------------------------------------
// General API Rate Limiter
// -----------------------------------------------------
// Maximum 300 requests per 15 minutes per IP
//
// Protects the application from:
// - Excessive API requests
// - API abuse
// - Basic DoS attempts
// - Automated request flooding
// -----------------------------------------------------

const apiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many API requests. Please try again later."
    }
});


// -----------------------------------------------------
// Authentication Rate Limiter
// -----------------------------------------------------
// Maximum 10 authentication requests per 15 minutes
// per IP.
//
// Protects:
// - Login
// - Registration
// - Brute-force attempts
// -----------------------------------------------------

const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many authentication attempts. Please try again later."
    }
});


// =====================================================
// APPLY GENERAL API RATE LIMITER
// =====================================================

// All /api requests are protected
app.use(
    "/api",
    apiLimiter
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log(
            "MongoDB connected"
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });


// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes =
    require("./routes/authRoutes");

const farmRoutes =
    require("./routes/farmRoutes");

const animalRoutes =
    require("./routes/animalRoutes");

const injectionRoutes =
    require("./routes/injectionRoutes");

const dietPlanRoutes =
    require("./routes/dietRoutes");

const healthRoutes =
    require("./routes/healthRoutes");

const reminderRoutes =
    require("./routes/reminderRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const aiRoutes =
    require("./routes/aiRoutes");

const auditLogRoutes =
    require("./routes/auditLogRoutes");


// -----------------------------------------------------
// Reports
// -----------------------------------------------------

const reportRoutes =
    require("./routes/reportRoutes");


// -----------------------------------------------------
// Notifications
// -----------------------------------------------------

const notificationRoutes =
    require("./routes/notificationRoutes");


// =====================================================
// API ROUTES
// =====================================================


// -----------------------------------------------------
// Authentication
// -----------------------------------------------------
// Authentication gets an additional stricter limiter.
//
// Therefore /api/auth is protected by:
// 1. General API limiter
// 2. Authentication limiter
// -----------------------------------------------------

app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);


// -----------------------------------------------------
// Farms
// -----------------------------------------------------

app.use(
    "/api/farms",
    farmRoutes
);


// -----------------------------------------------------
// Animals
// -----------------------------------------------------

app.use(
    "/api/animals",
    animalRoutes
);


// -----------------------------------------------------
// Injections
// -----------------------------------------------------

app.use(
    "/api/injections",
    injectionRoutes
);


// -----------------------------------------------------
// Diet Plans
// -----------------------------------------------------

app.use(
    "/api/diet-plans",
    dietPlanRoutes
);


// -----------------------------------------------------
// Health Records
// -----------------------------------------------------

app.use(
    "/api/health",
    healthRoutes
);


// -----------------------------------------------------
// Reminders
// -----------------------------------------------------

app.use(
    "/api/reminders",
    reminderRoutes
);


// -----------------------------------------------------
// Notifications
// -----------------------------------------------------

app.use(
    "/api/notifications",
    notificationRoutes
);


// -----------------------------------------------------
// Dashboard
// -----------------------------------------------------

app.use(
    "/api/dashboard",
    dashboardRoutes
);


// -----------------------------------------------------
// AI
// -----------------------------------------------------

app.use(
    "/api/ai",
    aiRoutes
);


// -----------------------------------------------------
// Reports
// -----------------------------------------------------

app.use(
    "/api/reports",
    reportRoutes
);


// -----------------------------------------------------
// Audit Logs
// -----------------------------------------------------

app.use(
    "/api/audit-logs",
    auditLogRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "DairyCare AI Backend is running",

        status:
            "success"

    });

});


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
            `Route ${req.method} ${req.originalUrl} not found`

    });

});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        "Server Error:",
        error
    );

    res.status(
        error.status || 500
    ).json({

        success: false,

        message:
            error.message ||
            "Internal server error."

    });

});


// =====================================================
// SERVER START
// =====================================================

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