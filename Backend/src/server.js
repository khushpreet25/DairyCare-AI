const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();


// ======================
// Security Middleware
// ======================

app.use(helmet());

app.use(cors());

app.use(express.json());


// ======================
// Rate Limiting
// ======================

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message:
    "Too many requests. Please try again later."

});

app.use(limiter);



// ======================
// MongoDB Connection
// ======================

mongoose.connect(process.env.MONGO_URI)

.then(()=>{

    console.log("MongoDB connected");

})

.catch((error)=>{

    console.log(
        "MongoDB connection failed:",
        error.message
    );

});




// ======================
// Import Routes
// ======================

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





// ======================
// API Routes
// ======================

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
    "/api/diet-plans",
    dietPlanRoutes
);


app.use(
    "/api/health",
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





// ======================
// Health Check
// ======================

app.get("/", (req,res)=>{

    res.json({

        message:
        "DairyCare AI Backend is running",

        status:
        "success"

    });

});





// ======================
// Server Start
// ======================

const PORT =
process.env.PORT || 5000;


app.listen(PORT,()=>{

    console.log(
        `Server running on port ${PORT}`
    );

});