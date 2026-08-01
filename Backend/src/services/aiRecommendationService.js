const Animal = require("../models/Animal");
const HealthRecord = require("../models/HealthRecord");
const DietPlan = require("../models/DietPlan");
const Reminder = require("../models/Reminder");
const Injection = require("../models/Injection");

const generateRecommendation = async (animalId) => {
  // Find Animal
  const animal = await Animal.findById(animalId);

  if (!animal) {
    throw new Error("Animal not found");
  }

  // Latest Health Record
  const health = await HealthRecord.findOne({
    animalId
  }).sort({ createdAt: -1 });

  // Active Diet Plan
  const diet = await DietPlan.findOne({
    animalId
  });

  // Pending Reminders
  const reminders = await Reminder.find({
    animalId,
    status: "pending"
  });

  // Injection Records
  const injections = await Injection.find({
    animalId
  });

  let recommendations = [];

  let healthScore = 100;

  // ===========================
  // Weight Analysis
  // ===========================

  if (animal.weight < 300) {
    recommendations.push(
      "Animal weight is low. Increase concentrate feed."
    );

    healthScore -= 15;
  }

  if (animal.weight > 550) {
    recommendations.push(
      "Animal is overweight. Reduce energy-rich feed."
    );

    healthScore -= 10;
  }

  // ===========================
  // Milk Production
  // ===========================

  if (animal.milkProduction < 10) {

    recommendations.push(
      "Milk production is low. Increase protein-rich feed."
    );

    healthScore -= 15;

  }

  if (animal.milkProduction > 20) {

    recommendations.push(
      "Excellent milk production. Maintain current nutrition."
    );

  }

  // ===========================
  // Pregnancy
  // ===========================

  if (animal.pregnancyStatus) {

    recommendations.push(
      "Provide calcium supplements."
    );

    recommendations.push(
      "Schedule monthly veterinary check-up."
    );

  }

  // ===========================
  // Health Analysis
  // ===========================

  if (health) {

    if (health.temperature > 39.5) {

      recommendations.push(
        "Possible fever detected."
      );

      recommendations.push(
        "Consult veterinarian immediately."
      );

      healthScore -= 25;

    }

    if (health.appetite === "poor") {

      recommendations.push(
        "Animal appetite is poor."
      );

      recommendations.push(
        "Increase green fodder."
      );

      healthScore -= 20;

    }

    if (health.activityLevel === "low") {

      recommendations.push(
        "Animal activity level is low."
      );

      recommendations.push(
        "Monitor closely for illness."
      );

      healthScore -= 15;

    }

  }

  // ===========================
  // Diet Plan
  // ===========================

  if (!diet) {

    recommendations.push(
      "No diet plan found. Create a diet plan."
    );

    healthScore -= 10;

  }

  // ===========================
  // Reminder Analysis
  // ===========================

  if (reminders.length > 0) {

    recommendations.push(
      `${reminders.length} pending reminders available.`
    );

    healthScore -= 5;

  }

  // ===========================
  // Injection Analysis
  // ===========================

  if (injections.length === 0) {

    recommendations.push(
      "No vaccination records found."
    );

    healthScore -= 10;

  }

  // ===========================
  // Disease Risk
  // ===========================

  let diseaseRisk = "Low";

  if (healthScore <= 80)
    diseaseRisk = "Medium";

  if (healthScore <= 60)
    diseaseRisk = "High";

  if (healthScore < 0)
    healthScore = 0;

  return {

    animalName: animal.name,

    animalTag: animal.animalTagId,

    breed: animal.breed,

    healthScore,

    diseaseRisk,

    recommendations

  };

};

module.exports = {
  generateRecommendation
};