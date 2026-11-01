const express = require("express");

const AuditLog = require("../models/AuditLog");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// GET AUDIT LOGS
// GET /api/audit-logs
//
// Admin → Can view all audit logs
// Veterinarian → Can view audit logs
// Farmer → Access denied
// ======================================================

router.get(
  "/",
  protect,
  authorizeRoles("admin", "veterinarian"),
  async (req, res) => {
    try {

      // --------------------------------------------------
      // Get audit logs
      // --------------------------------------------------

      const logs = await AuditLog.find({})
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .limit(200);


      // --------------------------------------------------
      // Send response
      // --------------------------------------------------

      return res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });

    } catch (error) {

      console.error(
        "Error fetching audit logs:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs"
      });
    }
  }
);


module.exports = router;