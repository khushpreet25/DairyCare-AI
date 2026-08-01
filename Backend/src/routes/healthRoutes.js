const express = require("express");
const HealthRecord = require("../models/HealthRecord");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const createAuditLog = require(
  "../services/auditLogService"
);
const validateHealthRecord = require(
  "../validators/healthValidator"
);
const router = express.Router();


// Create health record
router.post(
  "/",
  protect,
  authorizeRoles("veterinarian", "admin"),validateHealthRecord,
  async (req, res) => {
    try {

      const {
        animalId,
        temperature,
        appetite,
        activityLevel,
        milkProduction,
        symptoms,
        notes
      } = req.body;

      // animalId is required
      if (!animalId) {
        return res.status(400).json({
          message: "Animal ID is required"
        });
      }

      const healthRecord = await HealthRecord.create({
        animalId,
        temperature,
        appetite,
        activityLevel,
        milkProduction,
        symptoms,
        notes
      });

      //cyberseurity audit log
      await createAuditLog({
        userId: req.user.userId,
        action: "CREATE",
        module: "HEALTH_RECORD",
        description: `Created a health record for animal ${animalId}`,
        ipAddress: req.ip
      });
      return res.status(201).json({
        message: "Health record created successfully",
        healthRecord
      });

    } catch (error) {

      console.error("Health record error:", error);

      return res.status(500).json({
        message: "Health record creation failed",
        error: error.message
      });
    }
  }
);


// Get health records for one animal
router.get(
  "/:animalId",
  protect,
  async (req, res) => {
    try {

      const healthRecords = await HealthRecord.find({
        animalId: req.params.animalId
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Health records fetched successfully",
        healthRecords
      });

    } catch (error) {

      return res.status(500).json({
        message: "Failed to fetch health records",
        error: error.message
      });
    }
  }
);

module.exports = router;