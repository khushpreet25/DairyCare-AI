const express = require("express");

const Farm = require("../models/Farm");
const Animal = require("../models/Animal");
const DietPlan = require("../models/DietPlan");
const HealthRecord = require("../models/HealthRecord");
const Reminder = require("../models/Reminder");
const Injection = require("../models/Injection");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// HELPER
// GET ANIMAL IDS ACCESSIBLE BY CURRENT USER
// =====================================================

async function getAccessibleAnimalIds(req) {
  try {

    // ===================================================
    // ADMIN
    // ===================================================

    if (req.user.role === "admin") {

      const animals = await Animal.find({})
        .select("_id");

      return animals.map(
        (animal) => animal._id
      );
    }


    // ===================================================
    // VETERINARIAN
    // ===================================================

    if (req.user.role === "veterinarian") {

      const animals = await Animal.find({})
        .select("_id");

      return animals.map(
        (animal) => animal._id
      );
    }


    // ===================================================
    // FARMER
    // ===================================================

    const farms = await Farm.find({
      ownerId: req.user.userId
    }).select("_id");

    const farmIds = farms.map(
      (farm) => farm._id
    );


    const animals = await Animal.find({
      farmId: {
        $in: farmIds
      }
    }).select("_id");


    return animals.map(
      (animal) => animal._id
    );

  } catch (error) {

    console.error(
      "Get accessible animals error:",
      error
    );

    throw error;
  }
}


// =====================================================
// GET DASHBOARD STATS
//
// GET /api/dashboard/stats
// =====================================================

router.get(
  "/stats",
  protect,
  async (req, res) => {

    try {

      // =================================================
      // ACCESSIBLE ANIMALS
      // =================================================

      const animalIds =
        await getAccessibleAnimalIds(req);


      // =================================================
      // FARM QUERY
      // =================================================

      let farmQuery = {};

      if (req.user.role !== "admin") {

        farmQuery = {
          ownerId: req.user.userId
        };
      }


      // =================================================
      // FARM COUNT
      // =================================================

      const totalFarms =
        await Farm.countDocuments(
          farmQuery
        );


      // =================================================
      // ANIMAL COUNT
      // =================================================

      const totalAnimals =
        animalIds.length;


      // =================================================
      // DIET PLAN COUNT
      // =================================================

      let totalDietPlans = 0;

      if (animalIds.length > 0) {

        totalDietPlans =
          await DietPlan.countDocuments({
            animalId: {
              $in: animalIds
            }
          });
      }


      // =================================================
      // HEALTH RECORD COUNT
      // =================================================

      let totalHealthRecords = 0;

      if (animalIds.length > 0) {

        totalHealthRecords =
          await HealthRecord.countDocuments({
            animalId: {
              $in: animalIds
            }
          });
      }


      // =================================================
      // REMINDER COUNTS
      // =================================================

      let totalReminders = 0;

      let pendingReminders = 0;

      let completedReminders = 0;


      if (animalIds.length > 0) {

        totalReminders =
          await Reminder.countDocuments({
            animalId: {
              $in: animalIds
            }
          });


        pendingReminders =
          await Reminder.countDocuments({
            animalId: {
              $in: animalIds
            },

            status: {
              $in: [
                "pending",
                "Pending"
              ]
            }
          });


        completedReminders =
          await Reminder.countDocuments({
            animalId: {
              $in: animalIds
            },

            status: {
              $in: [
                "completed",
                "Completed"
              ]
            }
          });
      }


      // =================================================
      // INJECTION COUNTS
      // =================================================

      let totalInjections = 0;

      let upcomingInjections = 0;

      let overdueInjections = 0;


      if (animalIds.length > 0) {

        // ------------------------------------------------
        // TOTAL
        // ------------------------------------------------

        totalInjections =
          await Injection.countDocuments({
            animalId: {
              $in: animalIds
            }
          });


        // ------------------------------------------------
        // TODAY
        // ------------------------------------------------

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );


        // ------------------------------------------------
        // UPCOMING
        //
        // Today and all future dates
        // ------------------------------------------------

        upcomingInjections =
          await Injection.countDocuments({

            animalId: {
              $in: animalIds
            },

            nextDueDate: {
              $gte: today
            }

          });


        // ------------------------------------------------
        // OVERDUE
        //
        // Anything before today
        // ------------------------------------------------

        overdueInjections =
          await Injection.countDocuments({

            animalId: {
              $in: animalIds
            },

            nextDueDate: {
              $lt: today
            }

          });
      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Dashboard statistics fetched successfully",

        stats: {

          totalFarms,

          totalAnimals,

          totalDietPlans,

          totalHealthRecords,

          totalReminders,

          pendingReminders,

          completedReminders,

          totalInjections,

          upcomingInjections,

          overdueInjections

        }

      });

    } catch (error) {

      console.error(
        "Dashboard stats error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch dashboard statistics",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET RECENT ANIMALS
//
// GET /api/dashboard/recent-animals
// =====================================================

router.get(
  "/recent-animals",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Recent animals fetched successfully",

          animals: []

        });
      }


      const animals =
        await Animal.find({
          _id: {
            $in: animalIds
          }
        })
          .populate(
            "farmId",
            "name"
          )
          .sort({
            createdAt: -1
          })
          .limit(5);


      return res.status(200).json({

        success: true,

        message:
          "Recent animals fetched successfully",

        animals

      });

    } catch (error) {

      console.error(
        "Recent animals error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch recent animals",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET UPCOMING REMINDERS
//
// GET /api/dashboard/upcoming-reminders
// =====================================================

router.get(
  "/upcoming-reminders",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Upcoming reminders fetched successfully",

          count: 0,

          reminders: []

        });
      }


      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      const reminders =
        await Reminder.find({

          animalId: {
            $in: animalIds
          },

          status: {
            $in: [
              "pending",
              "Pending"
            ]
          },

          dueDate: {
            $gte: today
          }

        })
          .populate(
            "animalId",
            "name animalTagId"
          )
          .sort({
            dueDate: 1
          })
          .limit(10);


      return res.status(200).json({

        success: true,

        message:
          "Upcoming reminders fetched successfully",

        count:
          reminders.length,

        reminders

      });

    } catch (error) {

      console.error(
        "Upcoming reminders error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch upcoming reminders",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET HEALTH SUMMARY
//
// GET /api/dashboard/health-summary
// =====================================================

router.get(
  "/health-summary",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Health summary fetched successfully",

          summary: {

            total: 0,

            healthy: 0,

            sick: 0,

            recovering: 0

          }

        });
      }


      const healthRecords =
        await HealthRecord.find({

          animalId: {
            $in: animalIds
          }

        });


      let healthy = 0;

      let sick = 0;

      let recovering = 0;


      healthRecords.forEach(
        (record) => {

          const status =
            String(
              record.status || ""
            ).toLowerCase();


          if (
            status === "healthy"
          ) {

            healthy++;

          } else if (
            status === "sick" ||
            status === "ill"
          ) {

            sick++;

          } else if (
            status === "recovering"
          ) {

            recovering++;

          }

        }
      );


      return res.status(200).json({

        success: true,

        message:
          "Health summary fetched successfully",

        summary: {

          total:
            healthRecords.length,

          healthy,

          sick,

          recovering

        }

      });

    } catch (error) {

      console.error(
        "Health summary error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch health summary",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET MILK SUMMARY
//
// GET /api/dashboard/milk-summary
// =====================================================
//
// Currently returns a safe default because DairyCare AI
// does not yet have a Milk Production model implemented.
// =====================================================

router.get(
  "/milk-summary",
  protect,
  async (req, res) => {

    try {

      return res.status(200).json({

        success: true,

        message:
          "Milk summary fetched successfully",

        summary: {

          totalMilkProduction: 0,

          averageMilkProduction: 0,

          unit: "litres"

        }

      });

    } catch (error) {

      console.error(
        "Milk summary error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch milk summary",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET RECENT INJECTIONS
//
// GET /api/dashboard/recent-injections
// =====================================================

router.get(
  "/recent-injections",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Recent injections fetched successfully",

          count: 0,

          injections: []

        });
      }


      const injections =
        await Injection.find({

          animalId: {
            $in: animalIds
          }

        })
          .populate(
            "animalId",
            "name animalTagId"
          )
          .sort({
            dateGiven: -1
          })
          .limit(5);


      return res.status(200).json({

        success: true,

        message:
          "Recent injections fetched successfully",

        count:
          injections.length,

        injections

      });

    } catch (error) {

      console.error(
        "Recent injections error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch recent injections",

        error:
          error.message

      });
    }
  }
);


// =====================================================
// GET UPCOMING INJECTIONS
//
// GET /api/dashboard/upcoming-injections
// =====================================================
//
// IMPORTANT:
// Shows ALL injections due today or in the future.
// This is consistent with:
// GET /api/injections/upcoming
// =====================================================

router.get(
  "/upcoming-injections",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Upcoming injections fetched successfully",

          count: 0,

          injections: []

        });
      }


      // =================================================
      // TODAY
      // =================================================

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      // =================================================
      // FIND UPCOMING
      // =================================================

      const injections =
        await Injection.find({

          animalId: {
            $in: animalIds
          },

          nextDueDate: {
            $gte: today
          }

        })
          .populate(
            "animalId",
            "name animalTagId"
          )
          .sort({
            nextDueDate: 1
          })
          .limit(10);


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
        "Upcoming injections error:",
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
//
// GET /api/dashboard/overdue-injections
// =====================================================

router.get(
  "/overdue-injections",
  protect,
  async (req, res) => {

    try {

      const animalIds =
        await getAccessibleAnimalIds(req);


      if (animalIds.length === 0) {

        return res.status(200).json({

          success: true,

          message:
            "Overdue injections fetched successfully",

          count: 0,

          injections: []

        });
      }


      // =================================================
      // TODAY
      // =================================================

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      // =================================================
      // FIND OVERDUE
      // =================================================

      const injections =
        await Injection.find({

          animalId: {
            $in: animalIds
          },

          nextDueDate: {
            $lt: today
          }

        })
          .populate(
            "animalId",
            "name animalTagId"
          )
          .sort({
            nextDueDate: 1
          })
          .limit(10);


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
        "Overdue injections error:",
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
// EXPORT ROUTER
// =====================================================

module.exports = router;