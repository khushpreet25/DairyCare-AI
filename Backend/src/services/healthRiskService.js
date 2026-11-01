const Animal = require("../models/Animal");
const HealthRecord = require("../models/HealthRecord");
const Injection = require("../models/Injection");
const Reminder = require("../models/Reminder");

// =====================================================
// ADVANCED AI HEALTH RISK ANALYSIS
// =====================================================

async function analyzeAnimalHealthRisk(animalId) {

  // ---------------------------------------------------
  // FIND ANIMAL
  // ---------------------------------------------------

  const animal = await Animal.findById(animalId);

  if (!animal) {
    throw new Error("Animal not found");
  }


  // ---------------------------------------------------
  // FETCH RELATED DATA
  // ---------------------------------------------------

  const [
    healthRecords,
    injections,
    reminders
  ] = await Promise.all([

    HealthRecord.find({
      animalId
    }).sort({
      createdAt: -1
    }),

    Injection.find({
      animalId
    }).sort({
      nextDueDate: 1
    }),

    Reminder.find({
      animalId
    }).sort({
      dueDate: 1
    })

  ]);


  // ---------------------------------------------------
  // RISK VARIABLES
  // ---------------------------------------------------

  let riskScore = 0;

  const riskFactors = [];
  const recommendations = [];

  const analysisBreakdown = {
    health: 0,
    injections: 0,
    reminders: 0,
    production: 0
  };


  // ===================================================
  // HEALTH RECORD ANALYSIS
  // ===================================================

  const latestHealthRecord =
    healthRecords.length > 0
      ? healthRecords[0]
      : null;


  if (latestHealthRecord) {

    // -------------------------------------------------
    // APPETITE
    // -------------------------------------------------

    if (
      latestHealthRecord.appetite === "poor"
    ) {

      riskScore += 2;
      analysisBreakdown.health += 2;

      riskFactors.push(
        "Poor appetite detected"
      );

      recommendations.push(
        "Monitor feeding behavior and consider veterinary evaluation."
      );

    }


    // -------------------------------------------------
    // ACTIVITY
    // -------------------------------------------------

    if (
      latestHealthRecord.activityLevel === "low"
    ) {

      riskScore += 2;
      analysisBreakdown.health += 2;

      riskFactors.push(
        "Low activity level detected"
      );

      recommendations.push(
        "Monitor the animal's activity and behavior."
      );

    }


    // -------------------------------------------------
    // SYMPTOMS
    // -------------------------------------------------

    if (
      latestHealthRecord.symptoms &&
      latestHealthRecord.symptoms.trim() !== ""
    ) {

      riskScore += 2;
      analysisBreakdown.health += 2;

      riskFactors.push(
        `Reported symptoms: ${latestHealthRecord.symptoms}`
      );

      recommendations.push(
        "Review reported symptoms with a veterinarian."
      );

    }


    // -------------------------------------------------
    // TEMPERATURE
    // -------------------------------------------------

    if (
      typeof latestHealthRecord.temperature ===
      "number"
    ) {

      /*
       * Screening threshold only.
       * This is not a veterinary diagnosis.
       */

      if (
        latestHealthRecord.temperature < 38 ||
        latestHealthRecord.temperature > 39.5
      ) {

        riskScore += 3;
        analysisBreakdown.health += 3;

        riskFactors.push(
          "Temperature outside the configured screening range"
        );

        recommendations.push(
          "Recheck temperature and consider veterinary assessment."
        );

      }

    }


    // -------------------------------------------------
    // MILK PRODUCTION
    // -------------------------------------------------

    if (
      typeof latestHealthRecord.milkProduction ===
      "number" &&
      typeof animal.milkProduction ===
      "number"
    ) {

      const baseline =
        animal.milkProduction;

      const current =
        latestHealthRecord.milkProduction;


      if (
        baseline > 0 &&
        current < baseline * 0.8
      ) {

        riskScore += 2;
        analysisBreakdown.production += 2;

        riskFactors.push(
          "Milk production has decreased significantly"
        );

        recommendations.push(
          "Monitor milk production and investigate possible health or nutrition issues."
        );

      }

    }

  }


  // ===================================================
  // INJECTION ANALYSIS
  // ===================================================

  const now = new Date();


  const overdueInjection =
    injections.find(
      (injection) =>
        injection.nextDueDate &&
        new Date(
          injection.nextDueDate
        ) < now
    );


  if (overdueInjection) {

    riskScore += 2;
    analysisBreakdown.injections += 2;

    riskFactors.push(
      `Injection overdue: ${overdueInjection.injectionName}`
    );

    recommendations.push(
      "Review the animal's injection/vaccination schedule with a veterinarian."
    );

  }


  // ===================================================
  // REMINDER ANALYSIS
  // ===================================================

  const overdueReminder =
    reminders.find(
      (reminder) =>
        reminder.status === "pending" &&
        reminder.dueDate &&
        new Date(
          reminder.dueDate
        ) < now
    );


  if (overdueReminder) {

    riskScore += 2;
    analysisBreakdown.reminders += 2;

    riskFactors.push(
      `Overdue ${overdueReminder.reminderType} reminder`
    );

    recommendations.push(
      `Complete the overdue ${overdueReminder.reminderType} reminder.`
    );

  }


  // ===================================================
  // CAP SCORE
  // ===================================================

  /*
   * Current scoring rules can theoretically produce
   * different totals as more indicators are added.
   * Keep the public score within 0-100.
   */

  riskScore =
    Math.min(
      Math.max(riskScore, 0),
      100
    );


  // ===================================================
  // DETERMINE RISK LEVEL
  // ===================================================

  let riskLevel;

  if (riskScore >= 6) {

    riskLevel = "HIGH";

  } else if (riskScore >= 3) {

    riskLevel = "MEDIUM";

  } else {

    riskLevel = "LOW";

  }


  // ===================================================
  // DETERMINE SEVERITY
  // =====================================================

  let severity;

  if (riskLevel === "HIGH") {

    severity = "Immediate Attention";

  } else if (riskLevel === "MEDIUM") {

    severity = "Monitor Closely";

  } else {

    severity = "Routine Monitoring";

  }


  // ===================================================
  // DATA CONFIDENCE
  // ===================================================

  /*
   * Confidence is based on how much relevant data
   * is available for the screening analysis.
   */

  let confidencePoints = 0;

  if (healthRecords.length > 0) {
    confidencePoints += 40;
  }

  if (injections.length > 0) {
    confidencePoints += 30;
  }

  if (reminders.length > 0) {
    confidencePoints += 20;
  }

  if (
    typeof animal.milkProduction === "number"
  ) {
    confidencePoints += 10;
  }

  const dataConfidence =
    Math.min(
      confidencePoints,
      100
    );


  // ===================================================
  // SAFETY MESSAGE
  // ===================================================

  if (riskLevel === "HIGH") {

    recommendations.unshift(
      "HIGH RISK: Veterinary evaluation is strongly recommended. This AI analysis is a screening tool and is not a veterinary diagnosis."
    );

  } else if (riskLevel === "MEDIUM") {

    recommendations.unshift(
      "MEDIUM RISK: Monitor the animal closely and consider veterinary consultation if symptoms persist."
    );

  } else {

    recommendations.unshift(
      "LOW RISK: No major risk indicators were detected from the available records. Continue regular monitoring."
    );

  }


  // ===================================================
  // NO DATA MESSAGE
  // ===================================================

  if (
    healthRecords.length === 0 &&
    injections.length === 0 &&
    reminders.length === 0
  ) {

    recommendations.push(
      "More health and farm activity data is recommended for a more informative screening analysis."
    );

  }


  // ===================================================
  // REMOVE DUPLICATE VALUES
  // ===================================================

  const uniqueRiskFactors =
    [
      ...new Set(
        riskFactors
      )
    ];


  const uniqueRecommendations =
    [
      ...new Set(
        recommendations
      )
    ];


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return {

    animal: {

      id: animal._id,

      tagId:
        animal.animalTagId,

      name:
        animal.name ||
        "Unnamed Animal",

      breed:
        animal.breed,

      gender:
        animal.gender

    },


    analysis: {

      riskScore,

      riskLevel,

      severity,

      riskFactors:
        uniqueRiskFactors,

      recommendations:
        uniqueRecommendations,

      dataConfidence,

      breakdown:
        analysisBreakdown,

      analyzedAt:
        new Date()

    },


    dataSummary: {

      healthRecords:
        healthRecords.length,

      injections:
        injections.length,

      reminders:
        reminders.length

    }

  };

}


module.exports = {
  analyzeAnimalHealthRisk
};