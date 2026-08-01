const express = require("express");
const Animal = require("../models/Animal");
const protect = require("../middleware/authMiddleware");
const Farm = require("../models/Farm");

const createAuditLog = require(
  "../services/auditLogService"
);

const validateAnimal = require(
  "../validators/animalValidator"
);

const router = express.Router();


// Create animal
router.post("/", protect,validateAnimal, async (req, res) => {
  try {

    console.log("Animal request received");

    // First create the animal
    const animal = await Animal.create(req.body);

    // Then create the audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      module: "ANIMAL",
      description: `Created animal: ${
        animal.name || animal.animalTagId
      }`,
      ipAddress: req.ip
    });

    // Finally send the response
    res.status(201).json({
      message: "Animal created successfully",
      animal
    });

  } catch (error) {

    console.error("Animal creation error:", error);

    res.status(500).json({
      message: "Animal creation failed",
      error: error.message
    });
  }
});


module.exports = router;