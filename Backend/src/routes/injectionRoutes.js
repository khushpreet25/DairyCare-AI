const express = require("express");

const Injection = require("../models/Injection");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");

const createAuditLog = require(
  "../services/auditLogService"
);

const validateInjection = require(
  "../validators/injectionValidator"
);

const router = express.Router();


// Create a new injection record
router.post("/", protect,validateInjection, async (req, res) => {
  try {

    const {
      animalId,
      injectionName,
      dateGiven,
      nextDueDate,
      veterinarianName,
      notes
    } = req.body;


    // Validate required fields
    if (
      !animalId ||
      !injectionName ||
      !dateGiven ||
      !nextDueDate
    ) {
      return res.status(400).json({
        message:
          "Animal ID, injection name, date given, and next due date are required"
      });
    }


    // Step 1: Find the animal
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }


    // Step 2: Find the farm
    const farm = await Farm.findById(
      animal.farmId
    );

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found for this animal"
      });
    }


    // Step 3: Check permission

    const isFarmOwner =
      farm.ownerId.toString() ===
      req.user.userId.toString();

    const isVeterinarian =
      req.user.role === "veterinarian";

    const isAdmin =
      req.user.role === "admin";


    // Allow farm owner, veterinarian, or admin
    if (
      !isFarmOwner &&
      !isVeterinarian &&
      !isAdmin
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to add an injection"
      });
    }


    // Step 4: Create injection
    const injection = await Injection.create({
      animalId,
      injectionName,
      dateGiven,
      nextDueDate,
      veterinarianName,
      notes
    });


    // Step 5: Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      module: "INJECTION",
      description:
        `Created ${injectionName} injection record ` +
        `for animal ${animalId}`,
      ipAddress: req.ip
    });


    // Step 6: Send response
    res.status(201).json({
      message:
        "Injection record created successfully",
      injection
    });


  } catch (error) {

    console.error(
      "Injection creation error:",
      error
    );

    res.status(500).json({
      message:
        "Injection record creation failed",
      error: error.message
    });

  }
});


module.exports = router;