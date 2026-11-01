const Animal = require("../models/Animal");
const HealthRecord = require("../models/HealthRecord");

const analyzeHealthTrend = async (animalId) => {
  const animal = await Animal.findById(animalId);

  if (!animal) {
    throw new Error("Animal not found");
  }

  const records = await HealthRecord.find({ animalId })
    .sort({ createdAt: 1 });

  if (records.length === 0) {
    return {
      animalName: animal.name,
      animalTag: animal.animalTagId,
      trend: "No Data",
      currentRisk: "Unknown",
      previousRisk: "Unknown",
      riskChange: "No historical data available",
      healthScore: null,
      history: [],
      insights: [
        "No health history is available for this animal.",
        "Add health records to generate AI health trend analysis."
      ]
    };
  }

  const calculateScore = (record) => {
    let score = 100;

    // Temperature
    if (
      record.temperature !== undefined &&
      record.temperature !== null
    ) {
      if (record.temperature > 39.5) {
        score -= 25;
      } else if (record.temperature > 39) {
        score -= 10;
      }
    }

    // Appetite
    if (record.appetite === "poor") {
      score -= 20;
    } else if (record.appetite === "normal") {
      score -= 5;
    }

    // Activity
    if (record.activityLevel === "low") {
      score -= 15;
    } else if (record.activityLevel === "normal") {
      score -= 5;
    }

    // Symptoms
    if (record.symptoms && record.symptoms.trim() !== "") {
      score -= 10;
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
  };

  const getRiskLevel = (score) => {
    if (score <= 60) return "High";
    if (score <= 80) return "Medium";
    return "Low";
  };

  const history = records.map((record) => {
    const score = calculateScore(record);

    return {
      date: record.createdAt,
      healthScore: score,
      riskLevel: getRiskLevel(score),
      temperature: record.temperature ?? null,
      appetite: record.appetite ?? null,
      activityLevel: record.activityLevel ?? null,
      milkProduction: record.milkProduction ?? null,
      symptoms: record.symptoms ?? "",
      notes: record.notes ?? ""
    };
  });

  const current = history[history.length - 1];

  const previous =
    history.length > 1
      ? history[history.length - 2]
      : null;

  let trend = "Stable";

  if (previous) {
    const difference =
      current.healthScore - previous.healthScore;

    if (difference >= 10) {
      trend = "Improving";
    } else if (difference <= -10) {
      trend = "Declining";
    }
  }

  let riskChange = "No significant change";

  if (previous) {
    if (current.healthScore > previous.healthScore) {
      riskChange = "Risk indicators have decreased";
    } else if (current.healthScore < previous.healthScore) {
      riskChange = "Risk indicators have increased";
    }
  }

  const insights = [];

  // Temperature trend
  const temperatures = records
    .filter(
      (record) =>
        record.temperature !== undefined &&
        record.temperature !== null
    )
    .map((record) => record.temperature);

  if (temperatures.length >= 2) {
    const latestTemperature =
      temperatures[temperatures.length - 1];

    const previousTemperature =
      temperatures[temperatures.length - 2];

    if (latestTemperature < previousTemperature) {
      insights.push(
        "Recent temperature readings show an improving trend."
      );
    } else if (latestTemperature > previousTemperature) {
      insights.push(
        "Recent temperature readings have increased and should be monitored."
      );
    } else {
      insights.push(
        "Recent temperature readings are stable."
      );
    }
  }

  // Appetite trend
  if (current.appetite === "poor") {
    insights.push(
      "Poor appetite is present in the latest health record."
    );
  } else if (current.appetite === "good") {
    insights.push(
      "Latest appetite status is good."
    );
  }

  // Activity trend
  if (current.activityLevel === "low") {
    insights.push(
      "Low activity has been recorded recently. Continue close monitoring."
    );
  } else if (current.activityLevel === "active") {
    insights.push(
      "The animal is currently showing an active activity level."
    );
  }

  // Milk production trend
  const milkRecords = records.filter(
    (record) =>
      record.milkProduction !== undefined &&
      record.milkProduction !== null
  );

  if (milkRecords.length >= 2) {
    const latestMilk =
      milkRecords[milkRecords.length - 1].milkProduction;

    const previousMilk =
      milkRecords[milkRecords.length - 2].milkProduction;

    if (latestMilk > previousMilk) {
      insights.push(
        "Milk production has increased compared with the previous record."
      );
    } else if (latestMilk < previousMilk) {
      insights.push(
        "Milk production has decreased compared with the previous record."
      );
    } else {
      insights.push(
        "Milk production is stable compared with the previous record."
      );
    }
  }

  // Risk insight
  if (current.riskLevel === "High") {
    insights.push(
      "Current indicators suggest high risk. Veterinary evaluation is recommended."
    );
  } else if (current.riskLevel === "Medium") {
    insights.push(
      "Current indicators suggest moderate risk. Continue close monitoring."
    );
  } else {
    insights.push(
      "Current indicators show low risk based on the available health records."
    );
  }

  return {
    animalName: animal.name,
    animalTag: animal.animalTagId,

    trend,

    currentRisk: current.riskLevel,

    previousRisk: previous
      ? previous.riskLevel
      : "No Previous Record",

    riskChange,

    healthScore: current.healthScore,

    totalRecords: records.length,

    history,

    insights
  };
};

module.exports = {
  analyzeHealthTrend
};