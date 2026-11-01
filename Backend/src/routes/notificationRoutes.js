const express = require("express");
const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const Reminder = require("../models/Reminder");
const Farm = require("../models/Farm");
const Animal = require("../models/Animal");

const protect = require("../middleware/authMiddleware");

const createAuditLog = require(
  "../services/auditLogService"
);

const router = express.Router();


// =====================================================
// GET ACCESSIBLE REMINDERS
// =====================================================

async function getAccessibleReminders(req) {

  // ---------------------------------------------------
  // ADMIN / VETERINARIAN
  // ---------------------------------------------------

  if (
    req.user.role === "admin" ||
    req.user.role === "veterinarian"
  ) {

    return Reminder.find({
      status: {
        $ne: "completed",
      },
    }).populate(
      "animalId",
      "name animalTagId farmId"
    );

  }


  // ---------------------------------------------------
  // FARMER
  // ---------------------------------------------------

  const farms = await Farm.find({
    ownerId: req.user.userId,
  }).select("_id");


  const farmIds = farms.map(
    (farm) => farm._id
  );


  const animals = await Animal.find({
    farmId: {
      $in: farmIds,
    },
  }).select("_id");


  const animalIds = animals.map(
    (animal) => animal._id
  );


  return Reminder.find({
    animalId: {
      $in: animalIds,
    },

    status: {
      $ne: "completed",
    },

  }).populate(
    "animalId",
    "name animalTagId farmId"
  );

}


// =====================================================
// GENERATE NOTIFICATIONS
// =====================================================

async function generateReminderNotifications(
  req
) {

  try {

    const reminders =
      await getAccessibleReminders(req);


    const now = new Date();


    // 3 DAYS FROM NOW

    const upcomingLimit =
      new Date(now);

    upcomingLimit.setDate(
      upcomingLimit.getDate() + 3
    );


    for (
      const reminder of reminders
    ) {

      if (
        !reminder.dueDate
      ) {
        continue;
      }


      const dueDate =
        new Date(
          reminder.dueDate
        );


      const animalName =
        reminder.animalId?.name ||
        reminder.animalId?.animalTagId ||
        "Animal";


      // =================================================
      // OVERDUE
      // =================================================

      if (
        dueDate < now
      ) {

        const existing =
          await Notification.findOne({
            userId:
              req.user.userId,

            reminderId:
              reminder._id,

            type:
              "OVERDUE_REMINDER",
          });


        if (!existing) {

          await Notification.create({

            userId:
              req.user.userId,

            type:
              "OVERDUE_REMINDER",

            title:
              "Overdue Reminder",

            message:
              `${reminder.title} for ${animalName} is overdue.`,

            reminderId:
              reminder._id,

            animalId:
              reminder.animalId?._id ||
              reminder.animalId,

            priority:
              "HIGH",

          });

        }

        continue;
      }


      // =================================================
      // UPCOMING
      // =================================================

      if (
        dueDate >= now &&
        dueDate <= upcomingLimit
      ) {

        const existing =
          await Notification.findOne({
            userId:
              req.user.userId,

            reminderId:
              reminder._id,

            type:
              "UPCOMING_REMINDER",
          });


        if (!existing) {

          await Notification.create({

            userId:
              req.user.userId,

            type:
              "UPCOMING_REMINDER",

            title:
              "Upcoming Reminder",

            message:
              `${reminder.title} for ${animalName} is due soon.`,

            reminderId:
              reminder._id,

            animalId:
              reminder.animalId?._id ||
              reminder.animalId,

            priority:
              "MEDIUM",

          });

        }

      }

    }

  } catch (error) {

    console.error(
      "NOTIFICATION GENERATION ERROR:",
      error
    );

  }

}


// =====================================================
// GET NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      // Generate fresh reminder notifications

      await generateReminderNotifications(
        req
      );


      const notifications =
        await Notification.find({

          userId:
            req.user.userId,

        })
          .populate(
            "reminderId",
            "title dueDate status"
          )
          .populate(
            "animalId",
            "name animalTagId"
          )
          .sort({
            createdAt: -1,
          });


      const unreadCount =
        notifications.filter(
          (notification) =>
            !notification.isRead
        ).length;


      return res.status(200).json({

        success: true,

        total:
          notifications.length,

        unreadCount,

        notifications,

      });

    } catch (error) {

      console.error(
        "NOTIFICATION FETCH ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch notifications",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch(
  "/:id/read",
  protect,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid notification ID",

        });

      }


      const notification =
        await Notification.findOne({

          _id:
            req.params.id,

          userId:
            req.user.userId,

        });


      if (!notification) {

        return res.status(404).json({

          success: false,

          message:
            "Notification not found",

        });

      }


      notification.isRead =
        true;

      notification.readAt =
        new Date();


      await notification.save();


      // Audit log

      try {

        await createAuditLog({

          userId:
            req.user.userId,

          action:
            "UPDATE",

          module:
            "NOTIFICATION",

          description:
            `Marked notification "${notification.title}" as read`,

          ipAddress:
            req.ip,

        });

      } catch (auditError) {

        console.error(
          "Notification audit error:",
          auditError
        );

      }


      return res.status(200).json({

        success: true,

        message:
          "Notification marked as read",

        notification,

      });

    } catch (error) {

      console.error(
        "NOTIFICATION READ ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to mark notification as read",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch(
  "/read-all",
  protect,
  async (req, res) => {

    try {

      const result =
        await Notification.updateMany(

          {
            userId:
              req.user.userId,

            isRead:
              false,
          },

          {
            $set: {

              isRead:
                true,

              readAt:
                new Date(),

            },
          }

        );


      return res.status(200).json({

        success: true,

        message:
          "All notifications marked as read",

        modifiedCount:
          result.modifiedCount,

      });

    } catch (error) {

      console.error(
        "MARK ALL READ ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to mark notifications as read",

        error:
          error.message,

      });

    }

  }
);


module.exports = router;