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

// Get all farms of the logged-in user
router.get("/", protect, async (req, res) => {
  try {

    const farms = await Farm.find({
      ownerId: req.user.userId
    });

    res.status(200).json({
      message: "Farms fetched successfully",
      farms
    });

  } catch (error) {

    console.error(
      "Fetch farms error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch farms",
      error: error.message
    });

  }
});
// ==========================
// GET SINGLE FARM
// GET /api/farms/:id
// ==========================

router.get("/:id", protect, async (req, res) => {

  try {

    const farm = await Farm.findOne({
      _id: req.params.id,
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

    console.error("Fetch farm error:", error);

    res.status(500).json({
      message: "Failed to fetch farm",
      error: error.message
    });

  }

});
// ==========================
// UPDATE FARM
// PUT /api/farms/:id
// ==========================

router.put("/:id", protect, async (req, res) => {

  try {

    const farm = await Farm.findOne({
      _id: req.params.id,
      ownerId: req.user.userId
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found"
      });
    }

    farm.farmName = req.body.farmName;
    farm.location = req.body.location;
    farm.address = req.body.address;

    await farm.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      module: "FARM",
      description: `Updated farm: ${farm.farmName}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Farm updated successfully",
      farm
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update farm",
      error: error.message
    });

  }

});

// ==========================
// DELETE FARM
// DELETE /api/farms/:id
// ==========================

router.delete("/:id", protect, async (req, res) => {

  try {

    const farm = await Farm.findOne({
      _id: req.params.id,
      ownerId: req.user.userId
    });

    if (!farm) {

      return res.status(404).json({
        message: "Farm not found"
      });

    }

    await Farm.findByIdAndDelete(req.params.id);

    await createAuditLog({

      userId: req.user.userId,

      action: "DELETE",

      module: "FARM",

      description: `Deleted farm: ${farm.farmName}`,

      ipAddress: req.ip

    });

    res.status(200).json({

      message: "Farm deleted successfully"

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Failed to delete farm",

      error: error.message

    });

  }

});

module.exports = router;