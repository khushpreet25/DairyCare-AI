const Animal = require("../models/Animal");
const HealthRecord = require("../models/HealthRecord");
const DietPlan = require("../models/DietPlan");
const Reminder = require("../models/Reminder");
const Injection = require("../models/Injection");

const generateRecommendation = async (animalId) => {

  // =====================================================
  // FIND ANIMAL
  // =====================================================

  const animal = await Animal.findById(animalId);

  if (!animal) {
    throw new Error("Animal not found");
  }


  // =====================================================
  // GET DATA
  // =====================================================

  const health = await HealthRecord.findOne({
    animalId
  }).sort({ createdAt: -1 });

  const diet = await DietPlan.findOne({
    animalId,
    status: "Active"
  }).sort({ createdAt: -1 });

  const reminders = await Reminder.find({
    animalId,
    status: "pending"
  });

  const injections = await Injection.find({
    animalId
  });


  // =====================================================
  // VARIABLES
  // =====================================================

  let recommendations = [];

  let healthScore = 100;


  // =====================================================
  // HELPER
  // =====================================================

  const addRecommendation = (
    category,
    priority,
    message
  ) => {

    recommendations.push({
      category,
      priority,
      message
    });

  };


  // =====================================================
  // WEIGHT ANALYSIS
  // =====================================================

  if (
    animal.weight !== undefined &&
    animal.weight !== null
  ) {

    if (animal.weight < 300) {

      addRecommendation(
        "Nutrition",
        "HIGH",
        "Animal weight is below the configured screening range. Gradually review energy and protein intake with a veterinarian."
      );

      healthScore -= 15;

    }

    if (animal.weight > 550) {

      addRecommendation(
        "Nutrition",
        "MEDIUM",
        "Animal weight is above the configured screening range. Review energy-rich feed and overall diet balance."
      );

      healthScore -= 10;

    }

  }


  // =====================================================
  // MILK PRODUCTION ANALYSIS
  // =====================================================

  if (
    animal.milkProduction !== undefined &&
    animal.milkProduction !== null
  ) {

    if (animal.milkProduction < 10) {

      addRecommendation(
        "Milk Production",
        "HIGH",
        "Milk production is low based on the configured range. Review nutrition, health status and feeding practices."
      );

      healthScore -= 15;

    }

    else if (
      animal.milkProduction >= 10 &&
      animal.milkProduction <= 20
    ) {

      addRecommendation(
        "Milk Production",
        "LOW",
        "Milk production is within the configured moderate range. Maintain balanced nutrition and regular monitoring."
      );

    }

    else if (animal.milkProduction > 20) {

      addRecommendation(
        "Milk Production",
        "LOW",
        "Milk production is above the configured moderate range. Maintain adequate energy, protein and hydration."
      );

    }

  }


  // =====================================================
  // PREGNANCY ANALYSIS
  // =====================================================

  if (animal.pregnancyStatus) {

    addRecommendation(
      "Pregnancy",
      "HIGH",
      "Pregnancy is recorded. Pay close attention to nutrition, minerals and routine veterinary monitoring."
    );

    addRecommendation(
      "Nutrition",
      "MEDIUM",
      "Consider appropriate calcium and mineral supplementation according to the animal's condition and veterinary advice."
    );

  }


  // =====================================================
  // HEALTH ANALYSIS
  // =====================================================

  if (health) {

    // -----------------------------
    // TEMPERATURE
    // -----------------------------

    if (
      health.temperature !== undefined &&
      health.temperature !== null &&
      health.temperature > 39.5
    ) {

      addRecommendation(
        "Health",
        "HIGH",
        "Temperature is above the configured screening range. Veterinary evaluation is recommended."
      );

      healthScore -= 25;

    }


    // -----------------------------
    // APPETITE
    // -----------------------------

    if (
      health.appetite &&
      health.appetite.toLowerCase() === "poor"
    ) {

      addRecommendation(
        "Health",
        "HIGH",
        "Poor appetite has been recorded. Monitor feed intake and consider veterinary evaluation if it persists."
      );

      healthScore -= 20;

    }


    // -----------------------------
    // ACTIVITY
    // -----------------------------

    if (
      health.activityLevel &&
      health.activityLevel.toLowerCase() === "low"
    ) {

      addRecommendation(
        "Health",
        "MEDIUM",
        "Low activity has been recorded. Monitor the animal closely for changes in behavior or health."
      );

      healthScore -= 15;

    }

  }


  // =====================================================
  // CURRENT DIET ANALYSIS
  // =====================================================

  if (!diet) {

    addRecommendation(
      "Nutrition",
      "HIGH",
      "No active diet plan was found. Consider creating a balanced diet plan appropriate for the animal."
    );

    healthScore -= 10;

  }

  else {

    addRecommendation(
      "Nutrition",
      "LOW",
      `Current diet contains ${diet.feedName} at ${diet.quantity} unit(s), scheduled for ${diet.feedingTime}.`
    );

  }


  // =====================================================
  // REMINDER ANALYSIS
  // =====================================================

  if (reminders.length > 0) {

    addRecommendation(
      "Reminders",
      "MEDIUM",
      `${reminders.length} pending reminder(s) require attention. Review and complete them according to schedule.`
    );

    healthScore -= 5;

  }


  // =====================================================
  // INJECTION / VACCINATION ANALYSIS
  // =====================================================

  if (injections.length === 0) {

    addRecommendation(
      "Vaccination",
      "HIGH",
      "No vaccination or injection records were found. Verify the animal's vaccination schedule with a veterinarian."
    );

    healthScore -= 10;

  }

  else {

    addRecommendation(
      "Vaccination",
      "LOW",
      `${injections.length} injection/vaccination record(s) are available. Continue following the scheduled veterinary plan.`
    );

  }


  // =====================================================
  // HEALTH SCORE LIMIT
  // =====================================================

  if (healthScore < 0) {
    healthScore = 0;
  }

  if (healthScore > 100) {
    healthScore = 100;
  }


  // =====================================================
  // DISEASE RISK
  // =====================================================

  let diseaseRisk = "Low";

  if (healthScore <= 80) {
    diseaseRisk = "Medium";
  }

  if (healthScore <= 60) {
    diseaseRisk = "High";
  }


  // =====================================================
  // SAFETY MESSAGE
  // =====================================================

  if (diseaseRisk === "High") {

    recommendations.unshift({
      category: "Health",
      priority: "HIGH",
      message:
        "HIGH RISK: Veterinary evaluation is strongly recommended. AI recommendations are supportive guidance only and are not a veterinary diagnosis or treatment."
    });

  }

  else if (diseaseRisk === "Medium") {

    recommendations.unshift({
      category: "Health",
      priority: "HIGH",
      message:
        "MEDIUM RISK: Monitor the animal closely and consider veterinary consultation if concerning symptoms continue."
    });

  }

  else {

    recommendations.unshift({
      category: "Health",
      priority: "LOW",
      message:
        "LOW RISK: No major risk indicators were detected from the available information. Continue regular monitoring."
    });

  }


  // =====================================================
  // AI DIET RECOMMENDATIONS
  // =====================================================

  const dietRecommendations = [];


  // =====================================================
  // GREEN FODDER
  // =====================================================

  let greenFodderQuantity = 15;

  if (
    animal.milkProduction !== undefined &&
    animal.milkProduction > 20
  ) {
    greenFodderQuantity = 20;
  }

  if (
    animal.milkProduction !== undefined &&
    animal.milkProduction < 10
  ) {
    greenFodderQuantity = 18;
  }


  dietRecommendations.push({
    feedName: "Green Fodder",
    quantity: greenFodderQuantity,
    feedingTime: "Morning",
    nutritionalNotes:
      "Provides fiber and supports normal digestion."
  });


  // =====================================================
  // DRY FODDER
  // =====================================================

  dietRecommendations.push({
    feedName: "Dry Fodder",
    quantity: 5,
    feedingTime: "Afternoon",
    nutritionalNotes:
      "Provides fiber and helps maintain rumen function."
  });


  // =====================================================
  // CONCENTRATE FEED
  // =====================================================

  let concentrateQuantity = 3;

  if (
    animal.milkProduction !== undefined &&
    animal.milkProduction > 20
  ) {
    concentrateQuantity = 5;
  }

  if (
    animal.milkProduction !== undefined &&
    animal.milkProduction < 10
  ) {
    concentrateQuantity = 3.5;
  }

  if (
    animal.weight !== undefined &&
    animal.weight < 300
  ) {
    concentrateQuantity += 0.5;
  }


  dietRecommendations.push({
    feedName: "Concentrate Feed",
    quantity: concentrateQuantity,
    feedingTime: "Evening",
    nutritionalNotes:
      "Provides additional energy and protein. Adjust according to animal condition and veterinary advice."
  });


  // =====================================================
  // MINERAL SUPPLEMENT
  // =====================================================

  if (animal.pregnancyStatus) {

    dietRecommendations.push({
      feedName: "Mineral Supplement",
      quantity: 0.1,
      feedingTime: "Morning",
      nutritionalNotes:
        "Pregnant animals may require additional minerals. Confirm dosage with a veterinarian."
    });

  }


  // =====================================================
  // WATER
  // =====================================================

  dietRecommendations.push({
    feedName: "Clean Drinking Water",
    quantity: 40,
    feedingTime: "Morning",
    nutritionalNotes:
      "Ensure clean and accessible drinking water throughout the day."
  });


  // =====================================================
  // RETURN RESULT
  // =====================================================

  return {

    animalName: animal.name,

    animalTag: animal.animalTagId,

    breed: animal.breed,

    healthScore,

    diseaseRisk,

    recommendations,

    currentDiet: diet
      ? {
          feedName: diet.feedName,
          quantity: diet.quantity,
          feedingTime: diet.feedingTime,
          nutritionalNotes: diet.nutritionalNotes,
          status: diet.status
        }
      : null,

    dietRecommendations

  };

};


module.exports = {
  generateRecommendation
};