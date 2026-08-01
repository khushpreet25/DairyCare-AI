console.log("Dashboard routes loaded");
const express = require("express");
const protect = require("../middleware/authMiddleware");

const Farm = require("../models/Farm");
const Animal = require("../models/Animal");
const DietPlan = require("../models/DietPlan");
const HealthRecord = require("../models/HealthRecord");
const Reminder = require("../models/Reminder");

const router = express.Router();


// ======================
// Helper Function
// Get user's animals securely
// ======================

const getUserAnimals = async (userId) => {

  const farms = await Farm.find({
    ownerId: userId
  });

  const farmIds = farms.map(farm => farm._id);

  const animals = await Animal.find({
    farmId: {
      $in: farmIds
    }
  });

  return {
    farms,
    animals
  };
};



// ======================
// Dashboard Statistics
// ======================

router.get("/stats", protect, async (req, res) => {

  try {

    const { farms, animals } = await getUserAnimals(
      req.user.userId
    );


    const animalIds = animals.map(
      animal => animal._id
    );


    const totalDietPlans =
      await DietPlan.countDocuments({
        animalId: {
          $in: animalIds
        }
      });


    const totalHealthRecords =
      await HealthRecord.countDocuments({
        animalId: {
          $in: animalIds
        }
      });


    const totalReminders =
      await Reminder.countDocuments({
        animalId: {
          $in: animalIds
        }
      });


    const completedReminders =
      await Reminder.countDocuments({
        animalId: {
          $in: animalIds
        },
        status: "completed"
      });


    const pendingReminders =
      await Reminder.countDocuments({
        animalId: {
          $in: animalIds
        },
        status: "pending"
      });



    res.status(200).json({

      message:
        "Dashboard statistics fetched successfully",

      stats: {

        totalFarms: farms.length,

        totalAnimals: animals.length,

        totalDietPlans,

        totalHealthRecords,

        totalReminders,

        completedReminders,

        pendingReminders

      }

    });



  } catch (error) {

    res.status(500).json({

      message:
        "Failed to fetch dashboard statistics",

      error: error.message

    });

  }

});





// ======================
// Recent Animals
// ======================

router.get("/recent-animals", protect, async (req, res) => {


  try {


    const { animals } = await getUserAnimals(
      req.user.userId
    );



    const recentAnimals =
      animals
        .sort(
          (a, b) => b.createdAt - a.createdAt
        )
        .slice(0, 5);



    res.status(200).json({

      message:
        "Recent animals fetched successfully",

      animals: recentAnimals

    });



  } catch (error) {

    res.status(500).json({

      message:
        "Failed to fetch recent animals",

      error: error.message

    });

  }


});





// ======================
// Upcoming Reminders
// ======================

router.get("/upcoming-reminders", protect, async (req, res) => {


  try {


    const { animals } = await getUserAnimals(
      req.user.userId
    );


    const animalIds =
      animals.map(
        animal => animal._id
      );



    const reminders =
      await Reminder.find({

        animalId: {
          $in: animalIds
        },

        status: "pending",

        date: {
          $gte: new Date()
        }


      })
        .sort({
          date: 1
        })
        .limit(5);



    res.status(200).json({

      message:
        "Upcoming reminders fetched successfully",

      reminders

    });



  } catch (error) {


    res.status(500).json({

      message:
        "Failed to fetch reminders",

      error: error.message

    });


  }


});





// ======================
// Health Summary
// ======================

router.get("/health-summary", protect, async (req, res) => {


  try {


    const { farms, animals }
      =
      await getUserAnimals(
        req.user.userId
      );



    const farmIds =
      farms.map(
        farm => farm._id
      );


    const animalIds =
      animals.map(
        animal => animal._id
      );



    const healthyAnimals =
      await HealthRecord.countDocuments({

        animalId: {
          $in: animalIds
        },

        appetite: "good",

        activityLevel: "active"

      });



    const sickAnimals =
      await HealthRecord.countDocuments({

        animalId: {
          $in: animalIds
        },

        $or: [

          {
            appetite: "poor"
          },

          {
            activityLevel: "low"
          }

        ]

      });



    const pregnantAnimals =
      await Animal.countDocuments({

        farmId: {
          $in: farmIds
        },

        pregnancyStatus: true

      });



    res.status(200).json({

      message:
        "Health summary fetched successfully",

      summary: {

        healthyAnimals,

        sickAnimals,

        pregnantAnimals

      }

    });



  } catch (error) {


    res.status(500).json({

      message:
        "Failed to fetch health summary",

      error: error.message

    });


  }


});





// ======================
// Milk Production Summary
// ======================

router.get("/milk-summary", protect, async (req, res) => {


  try {


    const { animals } = await getUserAnimals(
      req.user.userId
    );



    let totalMilk = 0;



    animals.forEach(animal => {

      totalMilk +=
        animal.milkProduction || 0;

    });



    const averageMilk =
      animals.length > 0
        ?
        (totalMilk / animals.length).toFixed(2)
        :
        0;



    let topProducer = null;



    if (animals.length > 0) {

      topProducer =
        animals.reduce(
          (max, animal) =>

            (animal.milkProduction || 0)
              >
              (max.milkProduction || 0)
              ?
              animal
              :
              max
        );

    }



    res.status(200).json({

      message:
        "Milk summary fetched successfully",

      milkSummary: {

        totalMilkProduction:
          totalMilk,

        averageMilkProduction:
          averageMilk,

        topProducer

      }

    });


  } catch (error) {


    res.status(500).json({

      message:
        "Failed to fetch milk summary",

      error: error.message

    });


  }


});





module.exports = router;