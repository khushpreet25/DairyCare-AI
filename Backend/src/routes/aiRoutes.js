const express = require("express");
const protect = require("../middleware/authMiddleware");

const { getRecommendation } = require("../controllers/aiController");

const router = express.Router();

// AI Recommendation
router.get(
  "/recommend/:animalId",
  protect,
  getRecommendation
);

module.exports = router;