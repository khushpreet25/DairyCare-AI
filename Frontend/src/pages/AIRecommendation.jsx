import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import "./AIRecommendation.css";

function AIRecommendation() {
  const { animalId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH AI RECOMMENDATION
  // =====================================================

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/ai/recommend/${animalId}`
        );

        console.log(
          "AI Recommendation:",
          response.data
        );

        setData(response.data?.data || null);

      } catch (error) {
        console.error(
          "AI recommendation error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
          "Failed to generate AI recommendation."
        );

      } finally {
        setLoading(false);
      }
    }

    if (animalId) {
      fetchRecommendation();
    } else {
      setError("Animal ID is missing.");
      setLoading(false);
    }

  }, [animalId]);


  // =====================================================
  // CATEGORY ICON
  // =====================================================

  const getCategoryIcon = (category) => {

    switch (String(category || "").toLowerCase()) {

      case "health":
        return "🩺";

      case "nutrition":
        return "🥗";

      case "milk production":
        return "🥛";

      case "pregnancy":
        return "🐄";

      case "vaccination":
        return "💉";

      case "reminders":
        return "⏰";

      default:
        return "💡";
    }
  };


  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (priority) => {

    switch (String(priority || "").toLowerCase()) {

      case "high":
        return "priority-high";

      case "medium":
        return "priority-medium";

      case "low":
        return "priority-low";

      default:
        return "priority-low";
    }
  };


  // =====================================================
  // PRIORITY TEXT
  // =====================================================

  const getPriorityText = (priority) => {

    const value = String(priority || "LOW").toUpperCase();

    return `${value} PRIORITY`;
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ai-page">

        <div className="ai-loading-card">

          <div className="ai-loading-icon">
            🧠
          </div>

          <h2>
            Generating AI Recommendation...
          </h2>

          <p>
            Analyzing animal health, diet,
            reminders and injection records.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="ai-page">

        <div className="ai-error-card">

          <h2>
            ⚠️ AI Analysis Failed
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/animals")}
          >
            ← Back to Animals
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="ai-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ai-header">

        <div>

          <h1>
            🧠 AI Recommendation
          </h1>

          <p>
            Intelligent animal health and
            nutrition analysis
          </p>

        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/animals")}
        >
          ← Back to Animals
        </button>

      </header>


      {/* =================================================
          ANIMAL INFORMATION
      ================================================= */}

      {data && (
        <main className="ai-container">

          <section className="animal-info-card">

            <div>

              <span>
                Animal
              </span>

              <h2>
                {data.animalName || "Unnamed Animal"}
              </h2>

            </div>

            <div>

              <span>
                Tag ID
              </span>

              <strong>
                {data.animalTag || "N/A"}
              </strong>

            </div>

            <div>

              <span>
                Breed
              </span>

              <strong>
                {data.breed || "N/A"}
              </strong>

            </div>

          </section>


          {/* =================================================
              HEALTH SCORE
          ================================================= */}

          <section className="ai-score-card">

            <div>

              <h2>
                Health Score
              </h2>

              <p>
                Overall AI-generated health assessment
              </p>

            </div>

            <div className="score-circle">

              <strong>
                {data.healthScore ?? 0}
              </strong>

              <span>
                /100
              </span>

            </div>

          </section>


          {/* =================================================
              DISEASE RISK
          ================================================= */}

          <section className="risk-card">

            <h2>
              🩺 Disease Risk
            </h2>

            <div
              className={`risk-badge ${String(
                data.diseaseRisk || ""
              ).toLowerCase()}`}
            >
              {data.diseaseRisk || "Unknown"}
            </div>

            {String(data.diseaseRisk).toLowerCase() ===
              "high" && (

              <p className="high-risk-warning">
                ⚠️ High risk detected. Veterinary
                evaluation is strongly recommended.
              </p>

            )}

          </section>


          {/* =================================================
              AI RECOMMENDATIONS
          ================================================= */}

          <section className="recommendations-card">

            <h2>
              💡 AI Recommendations
            </h2>

            <p
              style={{
                color: "#66756b",
                marginTop: "-8px",
                marginBottom: "20px"
              }}
            >
              Personalized recommendations based on
              the animal's available health, nutrition,
              production and farm records.
            </p>

            {data.recommendations?.length > 0 ? (

              <div className="recommendation-list">

                {data.recommendations.map(
                  (recommendation, index) => {

                    /*
                     * New backend format:
                     *
                     * {
                     *   category: "Nutrition",
                     *   priority: "MEDIUM",
                     *   message: "..."
                     * }
                     *
                     * The fallback below keeps the UI
                     * compatible with old string data.
                     */

                    const isObject =
                      typeof recommendation === "object" &&
                      recommendation !== null;

                    const category = isObject
                      ? recommendation.category
                      : "General";

                    const priority = isObject
                      ? recommendation.priority
                      : "LOW";

                    const message = isObject
                      ? recommendation.message
                      : recommendation;

                    return (
                      <div
                        className="recommendation-item"
                        key={index}
                      >

                        {/* NUMBER */}

                        <span>
                          {index + 1}
                        </span>


                        {/* CONTENT */}

                        <div className="recommendation-content">

                          <div className="recommendation-header">

                            <div className="recommendation-category">

                              <span className="recommendation-category-icon">
                                {getCategoryIcon(category)}
                              </span>

                              {category || "General"}

                            </div>


                            <div
                              className={`recommendation-priority ${getPriorityClass(
                                priority
                              )}`}
                            >
                              {getPriorityText(priority)}
                            </div>

                          </div>


                          <p>
                            {message}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <p>
                No specific recommendations available.
              </p>

            )}

          </section>


          {/* =================================================
              CURRENT DIET
          ================================================= */}

          {data.currentDiet && (

            <section className="current-diet-card">

              <h2>
                🍃 Current Diet
              </h2>

              <div className="diet-details">

                <div>

                  <span>
                    Feed
                  </span>

                  <strong>
                    {data.currentDiet.feedName}
                  </strong>

                </div>

                <div>

                  <span>
                    Quantity
                  </span>

                  <strong>
                    {data.currentDiet.quantity}
                  </strong>

                </div>

                <div>

                  <span>
                    Feeding Time
                  </span>

                  <strong>
                    {data.currentDiet.feedingTime}
                  </strong>

                </div>

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {data.currentDiet.status}
                  </strong>

                </div>

              </div>

              {data.currentDiet.nutritionalNotes && (

                <p className="diet-notes">
                  {data.currentDiet.nutritionalNotes}
                </p>

              )}

            </section>

          )}


          {/* =================================================
              AI DIET RECOMMENDATIONS
          ================================================= */}

          <section className="diet-recommendations-card">

            <h2>
              🥗 AI Diet Recommendations
            </h2>

            {data.dietRecommendations?.length > 0 ? (

              <div className="diet-grid">

                {data.dietRecommendations.map(
                  (diet, index) => (

                    <div
                      className="diet-card"
                      key={index}
                    >

                      <h3>
                        {diet.feedName}
                      </h3>

                      <p>
                        <strong>
                          Quantity:
                        </strong>{" "}
                        {diet.quantity}
                      </p>

                      <p>
                        <strong>
                          Time:
                        </strong>{" "}
                        {diet.feedingTime}
                      </p>

                      <p>
                        {diet.nutritionalNotes}
                      </p>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                No diet recommendations available.
              </p>

            )}

          </section>


          {/* =================================================
              DISCLAIMER
          ================================================= */}

          <div className="ai-disclaimer">

            ⚠️ AI recommendations are supportive
            guidance only and are not a veterinary
            diagnosis or treatment. Always consult
            a qualified veterinarian for health
            concerns.

          </div>

        </main>
      )}

    </div>
  );
}

export default AIRecommendation;