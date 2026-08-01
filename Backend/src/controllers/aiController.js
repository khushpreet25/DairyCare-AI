const { generateRecommendation } = require("../services/aiRecommendationService");

const getRecommendation = async (req, res) => {
  try {

    const { animalId } = req.params;

    const result = await generateRecommendation(animalId);

    res.status(200).json({
      success: true,
      message: "AI recommendation generated successfully",
      data: result
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getRecommendation
};