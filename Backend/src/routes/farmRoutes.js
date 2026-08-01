const protect = require("../middleware/authMiddleware");
const express = require("express");
const createAuditLog = require(
  "../services/auditLogService"
);

const Farm = require("../models/Farm");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {

    const { farmName, location } = req.body;

    if (!farmName || !location) {
      return res.status(400).json({
        message: "Farm name and location are required"
      });
    }

    const farm = await Farm.create({
      farmName,
      location,
      ownerId: req.user.userId
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      module: "FARM",
      description: `Created farm: ${farmName}`,
      ipAddress: req.ip
    });
    res.status(201).json({
      message: "Farm created successfully",
      farm
    });

  } catch (error) {
    res.status(500).json({
      message: "Farm creation failed",
      error: error.message
    });
  }
});

router.get("/my-farm", protect, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      ownerId: req.user.userId
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found"
      });
    }

    res.status(200).json({
      message: "Farm fetched successfully",
      farm
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farm",
      error: error.message
    });
  }
});

module.exports = router;