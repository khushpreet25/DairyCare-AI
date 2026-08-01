const express = require("express");
const DietPlan = require("../models/DietPlan");
const protect = require("../middleware/authMiddleware");
const validateDietPlan = require(
  "../validators/dietValidator"
);

const router = express.Router();

// Create a new diet plan
router.post("/",protect ,validateDietPlan,  async (req, res) => {
  try {
    const {
      animalId,
      feedName,
      quantity,
      feedingTime,
      nutritionalNotes,
      startDate,
      endDate
    } = req.body;

    // Validate required fields
    if (
      !animalId ||
      !feedName ||
      !quantity ||
      !feedingTime ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Animal ID, feed name, quantity, feeding time, start date, and end date are required"
      });
    }

    // Create diet plan
    const dietPlan = await DietPlan.create({
      animalId,
      feedName,
      quantity,
      feedingTime,
      nutritionalNotes,
      startDate,
      endDate
    });

    res.status(201).json({
      message: "Diet plan created successfully",
      dietPlan
    });

  } catch (error) {
    res.status(500).json({
      message: "Diet plan creation failed",
      error: error.message
    });
  }
});


// Get all diet plans for one animal
router.get("/:animalId",protect ,  async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({
      animalId: req.params.animalId
    });

    res.status(200).json({
      message: "Diet plans fetched successfully",
      dietPlans
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch diet plans",
      error: error.message
    });
  }
});


module.exports = router;