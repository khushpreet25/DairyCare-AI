const {
  generateRecommendation
} = require("../services/aiRecommendationService");

const {
  analyzeAnimalHealthRisk
} = require("../services/healthRiskService");

const {
  analyzeHealthTrend
} = require("../services/healthTrendService");


// =====================================================
// AI RECOMMENDATION
// GET /api/ai/recommend/:animalId
// =====================================================

const getRecommendation = async (req, res) => {

  try {

    const { animalId } = req.params;

    const result =
      await generateRecommendation(
        animalId
      );

    res.status(200).json({

      success: true,

      message:
        "AI recommendation generated successfully",

      data: result

    });

  } catch (error) {

    console.error(
      "AI recommendation error:",
      error
    );

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// =====================================================
// AI HEALTH RISK ANALYSIS
// GET /api/ai/health-risk/:animalId
// =====================================================

const getHealthRisk = async (req, res) => {

  try {

    const { animalId } =
      req.params;

    const result =
      await analyzeAnimalHealthRisk(
        animalId
      );

    res.status(200).json({

      success: true,

      message:
        "AI health risk analysis generated successfully",

      data: result

    });

  } catch (error) {

    console.error(
      "AI health risk error:",
      error
    );

    // -----------------------------------------------
    // ANIMAL NOT FOUND
    // -----------------------------------------------

    if (
      error.message ===
      "Animal not found"
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Animal not found"

      });

    }

    // -----------------------------------------------
    // GENERAL ERROR
    // -----------------------------------------------

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// =====================================================
// AI HEALTH HISTORY & RISK TREND
// GET /api/ai/health-trend/:animalId
// =====================================================

const getHealthTrend = async (req, res) => {

  try {

    const { animalId } =
      req.params;

    const result =
      await analyzeHealthTrend(
        animalId
      );

    res.status(200).json({

      success: true,

      message:
        "AI health history and risk trend generated successfully",

      data: result

    });

  } catch (error) {

    console.error(
      "AI health trend error:",
      error
    );

    // -----------------------------------------------
    // ANIMAL NOT FOUND
    // -----------------------------------------------

    if (
      error.message ===
      "Animal not found"
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Animal not found"

      });

    }

    // -----------------------------------------------
    // GENERAL ERROR
    // -----------------------------------------------

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  getRecommendation,

  getHealthRisk,

  getHealthTrend

};