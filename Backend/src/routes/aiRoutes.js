const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getRecommendation,
  getHealthRisk,
  getHealthTrend
} = require("../controllers/aiController");

const router = express.Router();


// =====================================================
// AI RECOMMENDATION
// GET /api/ai/recommend/:animalId
// =====================================================

router.get(
  "/recommend/:animalId",
  protect,
  getRecommendation
);


// =====================================================
// AI HEALTH RISK ANALYSIS
// GET /api/ai/health-risk/:animalId
// =====================================================

router.get(
  "/health-risk/:animalId",
  protect,
  getHealthRisk
);


// =====================================================
// AI HEALTH HISTORY & RISK TREND
// GET /api/ai/health-trend/:animalId
// =====================================================

router.get(
  "/health-trend/:animalId",
  protect,
  getHealthTrend
);


module.exports = router;