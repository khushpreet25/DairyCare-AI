const express = require("express");
const protect = require("../middleware/authMiddleware");

const Farm = require("../models/Farm");
const Animal = require("../models/Animal");
const DietPlan = require("../models/DietPlan");
const HealthRecord = require("../models/HealthRecord");
const Reminder = require("../models/Reminder");

const router = express.Router();


// ======================
// Dashboard Statistics
// ======================

router.get("/stats", protect, async (req, res) => {
  try {

    const farms = await Farm.find({
      ownerId: req.user.userId
    });

    const farmIds = farms.map(farm => farm._id);

    const animals = await Animal.find({
      farmId: { $in: farmIds }
    });

    const animalIds = animals.map(animal => animal._id);

    const totalFarms = farms.length;

    const totalAnimals = animals.length;

    const totalDietPlans = await DietPlan.countDocuments({
      animalId: { $in: animalIds }
    });

    const totalHealthRecords = await HealthRecord.countDocuments({
      animalId: { $in: animalIds }
    });

    const totalReminders = await Reminder.countDocuments({
      animalId: { $in: animalIds }
    });

    const completedReminders = await Reminder.countDocuments({
      animalId: { $in: animalIds },
      status: "completed"
    });

    const pendingReminders = await Reminder.countDocuments({
      animalId: { $in: animalIds },
      status: "pending"
    });

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats: {
        totalFarms,
        totalAnimals,
        totalDietPlans,
        totalHealthRecords,
        totalReminders,
        completedReminders,
        pendingReminders
      }
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });

  }
});



// ======================
// Recent Animals
// ======================

router.get("/recent-animals", protect, async (req, res) => {
  try {

    const farms = await Farm.find({
      ownerId: req.user.userId
    });

    const farmIds = farms.map(farm => farm._id);

    const animals = await Animal.find({
      farmId: { $in: farmIds }
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Recent animals fetched successfully",
      animals
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch recent animals",
      error: error.message
    });

  }
});



// ======================
// Upcoming Reminders
// ======================

router.get("/upcoming-reminders", protect, async (req, res) => {
  try {

    const farms = await Farm.find({
      ownerId: req.user.userId
    });

    console.log("Farms:", farms);

    const farmIds = farms.map(farm => farm._id);

    const animals = await Animal.find({
      farmId: { $in: farmIds }
    });

    console.log("Animals:", animals);

    const animalIds = animals.map(animal => animal._id);

    console.log("Animal IDs:", animalIds);

    const reminders = await Reminder.find({
      animalId: { $in: animalIds }
    });

    console.log("Reminders:", reminders);

    res.json({
      reminders
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});



// ======================
// Health Summary
// ======================

router.get("/health-summary", protect, async (req, res) => {
  try {

    const farms = await Farm.find({
      ownerId: req.user.userId
    });

    const farmIds = farms.map(farm => farm._id);

    const animals = await Animal.find({
      farmId: { $in: farmIds }
    });

    const animalIds = animals.map(animal => animal._id);

    const healthyAnimals = await HealthRecord.countDocuments({
      animalId: { $in: animalIds },
      appetite: "good",
      activityLevel: "active"
    });

    const sickAnimals = await HealthRecord.countDocuments({
      animalId: { $in: animalIds },
      $or: [
        { appetite: "poor" },
        { activityLevel: "low" }
      ]
    });

    const pregnantAnimals = await Animal.countDocuments({
      farmId: { $in: farmIds },
      pregnancyStatus: true
    });

    res.status(200).json({
      message: "Health summary fetched successfully",
      summary: {
        healthyAnimals,
        sickAnimals,
        pregnantAnimals
      }
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch health summary",
      error: error.message
    });

  }
});


module.exports = router;