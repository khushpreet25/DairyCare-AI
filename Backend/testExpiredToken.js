require("dotenv").config();
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from your .env file");
  process.exit(1);
}

// Generate an already-expired JWT
const token = jwt.sign(
  {
    userId: "test-user",
    role: "farmer"
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "-1s"
  }
);

console.log("Expired JWT generated successfully:");
console.log(token);