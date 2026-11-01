const express = require("express");
const mongoose = require("mongoose");

const Reminder = require("../models/Reminder");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const protect = require("../middleware/authMiddleware");

const createAuditLog = require("../services/auditLogService");

const validateReminder = require(
  "../validators/reminderValidator"
);

const router = express.Router();


// =====================================================
// REMINDER ACCESS CONTROL HELPER
// =====================================================
//
// ADMIN
// → Can access everything
//
// VETERINARIAN
// → Can access all animals/reminders
//
// FARMER
// → Can access only animals belonging to their farms
//
// =====================================================

async function checkReminderAccess(reminderId, req) {

  try {

    // -------------------------------------------------
    // VALIDATE REMINDER ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(reminderId)
    ) {

      return {
        allowed: false,
        status: 400,
        message: "Invalid reminder ID"
      };

    }


    // -------------------------------------------------
    // FIND REMINDER
    // -------------------------------------------------

    const reminder =
      await Reminder.findById(reminderId);

    if (!reminder) {

      return {
        allowed: false,
        status: 404,
        message: "Reminder not found"
      };

    }


    // -------------------------------------------------
    // VALIDATE ANIMAL ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        reminder.animalId
      )
    ) {

      return {
        allowed: false,
        status: 400,
        message: "Invalid animal ID in reminder"
      };

    }


    // -------------------------------------------------
    // FIND ANIMAL
    // -------------------------------------------------

    const animal =
      await Animal.findById(
        reminder.animalId
      );

    if (!animal) {

      return {
        allowed: false,
        status: 404,
        message: "Animal associated with reminder not found"
      };

    }


    // -------------------------------------------------
    // ADMIN
    // -------------------------------------------------

    if (
      req.user.role === "admin"
    ) {

      return {
        allowed: true,
        reminder,
        animal
      };

    }


    // -------------------------------------------------
    // VETERINARIAN
    // -------------------------------------------------

    if (
      req.user.role === "veterinarian"
    ) {

      return {
        allowed: true,
        reminder,
        animal
      };

    }


    // -------------------------------------------------
    // FARMER
    // -------------------------------------------------

    const farm =
      await Farm.findOne({

        _id:
          animal.farmId,

        ownerId:
          req.user.userId

      });

    if (!farm) {

      return {
        allowed: false,
        status: 403,
        message:
          "You do not have permission to access this reminder"
      };

    }


    // -------------------------------------------------
    // ACCESS GRANTED
    // -------------------------------------------------

    return {
      allowed: true,
      reminder,
      animal,
      farm
    };

  } catch (error) {

    console.error(
      "REMINDER ACCESS CHECK ERROR:",
      error
    );

    return {
      allowed: false,
      status: 500,
      message:
        "Failed to verify reminder access"
    };

  }

}


// =====================================================
// CREATE REMINDER
// POST /api/reminders
//
// FARMER       → Own animals
// VETERINARIAN → Any animal
// ADMIN        → Any animal
// =====================================================

router.post(
  "/",
  protect,
  validateReminder,
  async (req, res) => {

    try {

      const {
        animalId,
        reminderType,
        title,
        dueDate
      } = req.body;


      // -------------------------------------------------
      // VALIDATE ANIMAL ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          animalId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid animal ID"

        });

      }


      // -------------------------------------------------
      // FIND ANIMAL
      // -------------------------------------------------

      const animal =
        await Animal.findById(
          animalId
        );

      if (!animal) {

        return res.status(404).json({

          message:
            "Animal not found"

        });

      }


      // -------------------------------------------------
      // FARMER OWNERSHIP
      // -------------------------------------------------

      if (
        req.user.role === "farmer"
      ) {

        const farm =
          await Farm.findOne({

            _id:
              animal.farmId,

            ownerId:
              req.user.userId

          });


        if (!farm) {

          return res.status(403).json({

            message:
              "Unauthorized. You do not own this animal."

          });

        }

      }


      // -------------------------------------------------
      // CREATE REMINDER
      // -------------------------------------------------

      const reminder =
        await Reminder.create({

          animalId,

          reminderType,

          title:
            title.trim(),

          dueDate,

          status:
            "pending"

        });


      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "CREATE",

        module:
          "REMINDER",

        description:
          `Created reminder "${title}" for animal ${animalId}`,

        ipAddress:
          req.ip

      });


      return res.status(201).json({

        message:
          "Reminder created successfully",

        reminder

      });

    } catch (error) {

      console.error(
        "REMINDER CREATE ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Reminder creation failed",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// GET ALL REMINDERS
// GET /api/reminders
//
// FARMER
// → Only reminders belonging to own animals
//
// VETERINARIAN
// → All reminders
//
// ADMIN
// → All reminders
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      let reminders = [];


      // -------------------------------------------------
      // ADMIN / VETERINARIAN
      // -------------------------------------------------

      if (
        req.user.role === "admin" ||
        req.user.role === "veterinarian"
      ) {

        reminders =
          await Reminder.find()

            .populate(
              "animalId",
              "name animalTagId farmId"
            )

            .sort({
              dueDate: 1
            });

      }


      // -------------------------------------------------
      // FARMER
      // -------------------------------------------------

      else {

        const farms =
          await Farm.find({

            ownerId:
              req.user.userId

          }).select("_id");


        const farmIds =
          farms.map(
            farm => farm._id
          );


        const animals =
          await Animal.find({

            farmId: {
              $in: farmIds
            }

          }).select("_id");


        const animalIds =
          animals.map(
            animal => animal._id
          );


        reminders =
          await Reminder.find({

            animalId: {
              $in: animalIds
            }

          })

            .populate(
              "animalId",
              "name animalTagId"
            )

            .sort({
              dueDate: 1
            });

      }


      return res.status(200).json({

        message:
          "Reminders fetched successfully",

        total:
          reminders.length,

        reminders

      });

    } catch (error) {

      console.error(
        "REMINDER FETCH ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to fetch reminders",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// GET SINGLE REMINDER
// GET /api/reminders/details/:id
// =====================================================

router.get(
  "/details/:id",
  protect,
  async (req, res) => {

    try {

      const access =
        await checkReminderAccess(
          req.params.id,
          req
        );


      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          message:
            access.message

        });

      }


      const reminder =
        await Reminder.findById(
          req.params.id
        ).populate(
          "animalId",
          "name animalTagId farmId"
        );


      return res.status(200).json({

        message:
          "Reminder fetched successfully",

        reminder

      });

    } catch (error) {

      console.error(
        "GET SINGLE REMINDER ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to fetch reminder",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// GET REMINDERS FOR ONE ANIMAL
// GET /api/reminders/:animalId
//
// FARMER
// → Only own animal
//
// VETERINARIAN
// → Any animal
//
// ADMIN
// → Any animal
// =====================================================

router.get(
  "/:animalId",
  protect,
  async (req, res) => {

    try {

      const {
        animalId
      } = req.params;


      // -------------------------------------------------
      // VALIDATE ANIMAL ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          animalId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid animal ID"

        });

      }


      // -------------------------------------------------
      // FIND ANIMAL
      // -------------------------------------------------

      const animal =
        await Animal.findById(
          animalId
        );

      if (!animal) {

        return res.status(404).json({

          message:
            "Animal not found"

        });

      }


      // -------------------------------------------------
      // FARMER OWNERSHIP
      // -------------------------------------------------

      if (
        req.user.role === "farmer"
      ) {

        const farm =
          await Farm.findOne({

            _id:
              animal.farmId,

            ownerId:
              req.user.userId

          });


        if (!farm) {

          return res.status(403).json({

            message:
              "Unauthorized. You do not own this animal."

          });

        }

      }


      // -------------------------------------------------
      // FIND REMINDERS
      // -------------------------------------------------

      const reminders =
        await Reminder.find({

          animalId

        })

          .populate(
            "animalId",
            "name animalTagId"
          )

          .sort({

            dueDate: 1

          });


      return res.status(200).json({

        message:
          "Reminders fetched successfully",

        total:
          reminders.length,

        reminders

      });

    } catch (error) {

      console.error(
        "ANIMAL REMINDERS ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to fetch reminders",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// UPDATE REMINDER
// PUT /api/reminders/:id
//
// FARMER
// → Own reminder
//
// VETERINARIAN
// → Any reminder
//
// ADMIN
// → Any reminder
// =====================================================

router.put(
  "/:id",
  protect,
  validateReminder,
  async (req, res) => {

    try {

      const {
        animalId,
        reminderType,
        title,
        dueDate
      } = req.body;


      // -------------------------------------------------
      // CHECK CURRENT REMINDER ACCESS
      // -------------------------------------------------

      const access =
        await checkReminderAccess(
          req.params.id,
          req
        );


      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          message:
            access.message

        });

      }


      const reminder =
        access.reminder;


      // -------------------------------------------------
      // VALIDATE NEW ANIMAL ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          animalId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid animal ID"

        });

      }


      // -------------------------------------------------
      // FIND NEW ANIMAL
      // -------------------------------------------------

      const newAnimal =
        await Animal.findById(
          animalId
        );


      if (!newAnimal) {

        return res.status(404).json({

          message:
            "Selected animal not found"

        });

      }


      // -------------------------------------------------
      // FARMER MUST OWN NEW ANIMAL
      // -------------------------------------------------

      if (
        req.user.role === "farmer"
      ) {

        const newFarm =
          await Farm.findOne({

            _id:
              newAnimal.farmId,

            ownerId:
              req.user.userId

          });


        if (!newFarm) {

          return res.status(403).json({

            message:
              "Unauthorized. You cannot assign this reminder to this animal."

          });

        }

      }


      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      reminder.animalId =
        animalId;

      reminder.reminderType =
        reminderType;

      reminder.title =
        title.trim();

      reminder.dueDate =
        dueDate;


      await reminder.save();


      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "UPDATE",

        module:
          "REMINDER",

        description:
          `Updated reminder "${reminder.title}"`,

        ipAddress:
          req.ip

      });


      return res.status(200).json({

        message:
          "Reminder updated successfully",

        reminder

      });

    } catch (error) {

      console.error(
        "REMINDER UPDATE ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to update reminder",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// MARK REMINDER COMPLETED
// PATCH /api/reminders/:id/complete
//
// FARMER
// → Own reminder
//
// VETERINARIAN
// → Any reminder
//
// ADMIN
// → Any reminder
// =====================================================

router.patch(
  "/:id/complete",
  protect,
  async (req, res) => {

    try {

      const access =
        await checkReminderAccess(
          req.params.id,
          req
        );


      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          message:
            access.message

        });

      }


      const reminder =
        access.reminder;


      // -------------------------------------------------
      // CHECK ALREADY COMPLETED
      // -------------------------------------------------

      if (
        reminder.status === "completed"
      ) {

        return res.status(400).json({

          message:
            "Reminder is already completed"

        });

      }


      // -------------------------------------------------
      // MARK COMPLETED
      // -------------------------------------------------

      reminder.status =
        "completed";


      await reminder.save();


      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "UPDATE",

        module:
          "REMINDER",

        description:
          `Marked reminder "${reminder.title}" as completed`,

        ipAddress:
          req.ip

      });


      return res.status(200).json({

        message:
          "Reminder marked as completed",

        reminder

      });

    } catch (error) {

      console.error(
        "REMINDER COMPLETE ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to update reminder",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// DELETE REMINDER
// DELETE /api/reminders/:id
//
// FARMER
// → Own reminder
//
// VETERINARIAN
// → Any reminder
//
// ADMIN
// → Any reminder
// =====================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const access =
        await checkReminderAccess(
          req.params.id,
          req
        );


      if (!access.allowed) {

        return res.status(
          access.status
        ).json({

          message:
            access.message

        });

      }


      const reminder =
        access.reminder;


      // -------------------------------------------------
      // DELETE
      // -------------------------------------------------

      await Reminder.findByIdAndDelete(
        req.params.id
      );


      // -------------------------------------------------
      // AUDIT LOG
      // -------------------------------------------------

      await createAuditLog({

        userId:
          req.user.userId,

        action:
          "DELETE",

        module:
          "REMINDER",

        description:
          `Deleted reminder "${reminder.title}"`,

        ipAddress:
          req.ip

      });


      return res.status(200).json({

        message:
          "Reminder deleted successfully"

      });

    } catch (error) {

      console.error(
        "REMINDER DELETE ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to delete reminder",

        error:
          error.message

      });

    }

  }
);


module.exports = router;