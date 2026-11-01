const express = require("express");
const mongoose = require("mongoose");

const Injection = require("../models/Injection");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");
const createAuditLog = require("../services/auditLogService");
const validateInjection = require("../validators/injectionValidator");

const router = express.Router();


// =====================================================
// HELPER
// CHECK WHETHER USER CAN ACCESS ANIMAL
// =====================================================

async function checkAnimalAccess(animalId, req) {
  try {

    // Validate Animal ID
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return {
        allowed: false,
        status: 400,
        message: "Invalid animal ID"
      };
    }

    // Find animal
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return {
        allowed: false,
        status: 404,
        message: "Animal not found"
      };
    }

    // Admin can access everything
    if (req.user.role === "admin") {
      return {
        allowed: true,
        animal,
        farm: null
      };
    }

    // Find farm
    const farm = await Farm.findById(animal.farmId);

    if (!farm) {
      return {
        allowed: false,
        status: 404,
        message: "Farm not found for this animal"
      };
    }

    // Veterinarian can access animal records
    if (req.user.role === "veterinarian") {
      return {
        allowed: true,
        animal,
        farm
      };
    }

    // Farmer must own the farm
    const isFarmOwner =
      farm.ownerId &&
      farm.ownerId.toString() ===
        req.user.userId.toString();

    if (!isFarmOwner) {
      return {
        allowed: false,
        status: 403,
        message:
          "You are not allowed to access this animal's injection records"
      };
    }

    return {
      allowed: true,
      animal,
      farm
    };

  } catch (error) {

    console.error(
      "Animal access check error:",
      error
    );

    return {
      allowed: false,
      status: 500,
      message: "Failed to check animal access"
    };
  }
}


// =====================================================
// GET ALL INJECTIONS
// GET /api/injections
// =====================================================

router.get("/", protect, async (req, res) => {
  try {

    let injections = [];

    // ---------------------------------------------------
    // ADMIN
    // ---------------------------------------------------

    if (req.user.role === "admin") {

      injections = await Injection.find()
        .populate(
          "animalId",
          "name animalTagId farmId"
        )
        .sort({
          dateGiven: -1
        });
    }

    // ---------------------------------------------------
    // VETERINARIAN
    // ---------------------------------------------------

    else if (req.user.role === "veterinarian") {

      const animals = await Animal.find()
        .select("_id name animalTagId farmId");

      const animalIds = animals.map(
        animal => animal._id
      );

      injections = await Injection.find({
        animalId: {
          $in: animalIds
        }
      })
        .populate(
          "animalId",
          "name animalTagId farmId"
        )
        .sort({
          dateGiven: -1
        });
    }

    // ---------------------------------------------------
    // FARMER
    // ---------------------------------------------------

    else if (req.user.role === "farmer") {

      const farms = await Farm.find({
        ownerId: req.user.userId
      }).select("_id");

      const farmIds = farms.map(
        farm => farm._id
      );

      const animals = await Animal.find({
        farmId: {
          $in: farmIds
        }
      }).select(
        "_id name animalTagId farmId"
      );

      const animalIds = animals.map(
        animal => animal._id
      );

      injections = await Injection.find({
        animalId: {
          $in: animalIds
        }
      })
        .populate(
          "animalId",
          "name animalTagId farmId"
        )
        .sort({
          dateGiven: -1
        });
    }

    // ---------------------------------------------------
    // UNKNOWN ROLE
    // ---------------------------------------------------

    else {

      return res.status(403).json({
        success: false,
        message: "You do not have permission to view injections"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Injections fetched successfully",
      count: injections.length,
      injections
    });

  } catch (error) {

    console.error(
      "Fetch all injections error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch injections",
      error: error.message
    });
  }
});


// =====================================================
// GET UPCOMING INJECTIONS
// GET /api/injections/upcoming
// =====================================================

router.get(
  "/upcoming",
  protect,
  async (req, res) => {

    try {

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      let animalIds = [];

      // -------------------------------------------------
      // ADMIN + VETERINARIAN
      // -------------------------------------------------

      if (
        req.user.role === "admin" ||
        req.user.role === "veterinarian"
      ) {

        const animals = await Animal.find()
          .select("_id");

        animalIds = animals.map(
          animal => animal._id
        );
      }

      // -------------------------------------------------
      // FARMER
      // -------------------------------------------------

      else if (req.user.role === "farmer") {

        const farms = await Farm.find({
          ownerId: req.user.userId
        }).select("_id");

        const farmIds = farms.map(
          farm => farm._id
        );

        const animals = await Animal.find({
          farmId: {
            $in: farmIds
          }
        }).select("_id");

        animalIds = animals.map(
          animal => animal._id
        );
      }

      else {

        return res.status(403).json({
          success: false,
          message: "You do not have permission to view injections"
        });
      }

      const injections = await Injection.find({
        animalId: {
          $in: animalIds
        },

        completed: false,

        nextDueDate: {
          $gte: today
        }

      })
        .populate(
          "animalId",
          "name animalTagId farmId"
        )
        .sort({
          nextDueDate: 1
        });

      return res.status(200).json({

        success: true,

        message:
          "Upcoming injections fetched successfully",

        count:
          injections.length,

        injections
      });

    } catch (error) {

      console.error(
        "Fetch upcoming injections error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch upcoming injections",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// GET OVERDUE INJECTIONS
// GET /api/injections/overdue
// =====================================================

router.get(
  "/overdue",
  protect,
  async (req, res) => {

    try {

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      let animalIds = [];

      // -------------------------------------------------
      // ADMIN + VETERINARIAN
      // -------------------------------------------------

      if (
        req.user.role === "admin" ||
        req.user.role === "veterinarian"
      ) {

        const animals = await Animal.find()
          .select("_id");

        animalIds = animals.map(
          animal => animal._id
        );
      }

      // -------------------------------------------------
      // FARMER
      // -------------------------------------------------

      else if (req.user.role === "farmer") {

        const farms = await Farm.find({
          ownerId: req.user.userId
        }).select("_id");

        const farmIds = farms.map(
          farm => farm._id
        );

        const animals = await Animal.find({
          farmId: {
            $in: farmIds
          }
        }).select("_id");

        animalIds = animals.map(
          animal => animal._id
        );
      }

      else {

        return res.status(403).json({
          success: false,
          message: "You do not have permission to view injections"
        });
      }

      const injections = await Injection.find({

        animalId: {
          $in: animalIds
        },

        completed: false,

        nextDueDate: {
          $lt: today
        }

      })
        .populate(
          "animalId",
          "name animalTagId farmId"
        )
        .sort({
          nextDueDate: 1
        });

      return res.status(200).json({

        success: true,

        message:
          "Overdue injections fetched successfully",

        count:
          injections.length,

        injections
      });

    } catch (error) {

      console.error(
        "Fetch overdue injections error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch overdue injections",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// GET INJECTIONS FOR ONE ANIMAL
// GET /api/injections/animal/:animalId
// =====================================================

router.get(
  "/animal/:animalId",
  protect,
  async (req, res) => {

    try {

      const {
        animalId
      } = req.params;

      const access =
        await checkAnimalAccess(
          animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,
          message: access.message

        });
      }

      const injections =
        await Injection.find({
          animalId
        })
          .populate(
            "animalId",
            "name animalTagId farmId"
          )
          .sort({
            dateGiven: -1
          });

      return res.status(200).json({

        success: true,

        message:
          "Injection records fetched successfully",

        count:
          injections.length,

        injections
      });

    } catch (error) {

      console.error(
        "Fetch animal injections error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch animal injections",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// GET SINGLE INJECTION
// GET /api/injections/:id
// =====================================================

router.get(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,
          message: "Invalid injection ID"

        });
      }

      const injection =
        await Injection.findById(id)
          .populate(
            "animalId",
            "name animalTagId farmId"
          );

      if (!injection) {

        return res.status(404).json({

          success: false,
          message:
            "Injection record not found"

        });
      }

      const animalId =
        injection.animalId?._id ||
        injection.animalId;

      const access =
        await checkAnimalAccess(
          animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,
          message: access.message

        });
      }

      return res.status(200).json({

        success: true,

        message:
          "Injection fetched successfully",

        injection
      });

    } catch (error) {

      console.error(
        "Fetch single injection error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch injection",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// CREATE INJECTION
// POST /api/injections
// =====================================================

router.post(
  "/",
  protect,
  validateInjection,
  async (req, res) => {

    try {

      const {
        animalId,
        injectionName,
        dateGiven,
        nextDueDate,
        veterinarianName,
        dosage,
        notes
      } = req.body;

      // -------------------------------------------------
      // REQUIRED FIELDS
      // -------------------------------------------------

      if (
        !animalId ||
        !injectionName ||
        !dateGiven ||
        !nextDueDate
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Animal ID, injection name, date given, and next due date are required"

        });
      }

      // -------------------------------------------------
      // DATE VALIDATION
      // -------------------------------------------------

      const givenDate =
        new Date(dateGiven);

      const dueDate =
        new Date(nextDueDate);

      if (
        Number.isNaN(
          givenDate.getTime()
        ) ||
        Number.isNaN(
          dueDate.getTime()
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid date format"

        });
      }

      if (dueDate < givenDate) {

        return res.status(400).json({

          success: false,

          message:
            "Next due date cannot be before date given"

        });
      }

      // -------------------------------------------------
      // ACCESS CHECK
      // -------------------------------------------------

      const access =
        await checkAnimalAccess(
          animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });
      }

      // -------------------------------------------------
      // CREATE
      // -------------------------------------------------

      const injection =
        await Injection.create({

          animalId,

          injectionName:
            injectionName.trim(),

          dateGiven:
            givenDate,

          nextDueDate:
            dueDate,

          veterinarianName:
            veterinarianName?.trim() || "",

          dosage:
            dosage?.trim() || "",

          notes:
            notes?.trim() || "",

          completed:
            false

        });

      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      try {

        await createAuditLog({

          userId:
            req.user.userId,

          action:
            "CREATE",

          module:
            "INJECTION",

          description:
            `Created ${injectionName} injection record for animal ${animalId}`,

          ipAddress:
            req.ip

        });

      } catch (auditError) {

        console.error(
          "Injection audit log error:",
          auditError
        );
      }

      // Populate response
      await injection.populate(
        "animalId",
        "name animalTagId farmId"
      );

      return res.status(201).json({

        success: true,

        message:
          "Injection record created successfully",

        injection
      });

    } catch (error) {

      console.error(
        "Injection creation error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Injection record creation failed",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// UPDATE INJECTION
// PUT /api/injections/:id
// =====================================================

router.put(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid injection ID"

        });
      }

      const injection =
        await Injection.findById(id);

      if (!injection) {

        return res.status(404).json({

          success: false,

          message:
            "Injection record not found"

        });
      }

      // -------------------------------------------------
      // ACCESS CHECK
      // -------------------------------------------------

      const access =
        await checkAnimalAccess(
          injection.animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });
      }

      // -------------------------------------------------
      // UPDATE FIELDS
      // -------------------------------------------------

      const {
        injectionName,
        dateGiven,
        nextDueDate,
        veterinarianName,
        dosage,
        notes,
        completed
      } = req.body;

      if (
        injectionName !== undefined
      ) {

        if (
          !injectionName.trim()
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Injection name cannot be empty"

          });
        }

        injection.injectionName =
          injectionName.trim();
      }

      if (
        dateGiven !== undefined
      ) {

        const parsedDate =
          new Date(dateGiven);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid date given"

          });
        }

        injection.dateGiven =
          parsedDate;
      }

      if (
        nextDueDate !== undefined
      ) {

        const parsedDueDate =
          new Date(nextDueDate);

        if (
          Number.isNaN(
            parsedDueDate.getTime()
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid next due date"

          });
        }

        injection.nextDueDate =
          parsedDueDate;
      }

      // Check date relationship
      if (
        injection.dateGiven &&
        injection.nextDueDate &&
        injection.nextDueDate <
          injection.dateGiven
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Next due date cannot be before date given"

        });
      }

      if (
        veterinarianName !== undefined
      ) {

        injection.veterinarianName =
          veterinarianName.trim();
      }

      if (
        dosage !== undefined
      ) {

        injection.dosage =
          dosage.trim();
      }

      if (
        notes !== undefined
      ) {

        injection.notes =
          notes.trim();
      }

      if (
        completed !== undefined
      ) {

        injection.completed =
          Boolean(completed);
      }

      // -------------------------------------------------
      // SAVE
      // -------------------------------------------------

      const updatedInjection =
        await injection.save();

      await updatedInjection.populate(
        "animalId",
        "name animalTagId farmId"
      );

      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      try {

        await createAuditLog({

          userId:
            req.user.userId,

          action:
            "UPDATE",

          module:
            "INJECTION",

          description:
            `Updated injection record ${id}`,

          ipAddress:
            req.ip

        });

      } catch (auditError) {

        console.error(
          "Update injection audit error:",
          auditError
        );
      }

      return res.status(200).json({

        success: true,

        message:
          "Injection record updated successfully",

        injection:
          updatedInjection
      });

    } catch (error) {

      console.error(
        "Update injection error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to update injection",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// MARK INJECTION AS COMPLETED
// PATCH /api/injections/:id/complete
// =====================================================

router.patch(
  "/:id/complete",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid injection ID"

        });
      }

      const injection =
        await Injection.findById(id);

      if (!injection) {

        return res.status(404).json({

          success: false,

          message:
            "Injection record not found"

        });
      }

      // -------------------------------------------------
      // ACCESS CHECK
      // -------------------------------------------------

      const access =
        await checkAnimalAccess(
          injection.animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });
      }

      if (
        injection.completed === true
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Injection is already marked as completed"

        });
      }

      injection.completed = true;

      const updatedInjection =
        await injection.save();

      await updatedInjection.populate(
        "animalId",
        "name animalTagId farmId"
      );

      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      try {

        await createAuditLog({

          userId:
            req.user.userId,

          action:
            "UPDATE",

          module:
            "INJECTION",

          description:
            `Marked injection record ${id} as completed`,

          ipAddress:
            req.ip

        });

      } catch (auditError) {

        console.error(
          "Complete injection audit error:",
          auditError
        );
      }

      return res.status(200).json({

        success: true,

        message:
          "Injection marked as completed successfully",

        injection:
          updatedInjection
      });

    } catch (error) {

      console.error(
        "Complete injection error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to mark injection as completed",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// DELETE INJECTION
// DELETE /api/injections/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid injection ID"

        });
      }

      const injection =
        await Injection.findById(id);

      if (!injection) {

        return res.status(404).json({

          success: false,

          message:
            "Injection record not found"

        });
      }

      // -------------------------------------------------
      // ACCESS CHECK
      // -------------------------------------------------

      const access =
        await checkAnimalAccess(
          injection.animalId,
          req
        );

      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          success: false,

          message:
            access.message

        });
      }

      await Injection.findByIdAndDelete(
        id
      );

      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      try {

        await createAuditLog({

          userId:
            req.user.userId,

          action:
            "DELETE",

          module:
            "INJECTION",

          description:
            `Deleted injection record ${id}`,

          ipAddress:
            req.ip

        });

      } catch (auditError) {

        console.error(
          "Delete injection audit error:",
          auditError
        );
      }

      return res.status(200).json({

        success: true,

        message:
          "Injection record deleted successfully"

      });

    } catch (error) {

      console.error(
        "Delete injection error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to delete injection",

        error:
          error.message
      });
    }
  }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;