import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import "./AIHealthTrend.css";

function AIHealthTrend() {
  const { animalId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHealthTrend = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/ai/health-trend/${animalId}`
        );

        setData(response.data.data);
        setError("");
      } catch (err) {
        console.error("Health trend error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load health trend"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHealthTrend();
  }, [animalId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="ai-trend-page">
        <div className="ai-trend-loading">
          Loading AI health history...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="ai-trend-page">
        <div className="ai-trend-error">
          <h2>Unable to Load Health Trend</h2>

          <p>{error}</p>

          <button onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="ai-trend-page">

      {/* HEADER */}
      <div className="ai-trend-header">

        <div>
          <h1>
            AI Health History & Risk Trend
          </h1>

          <p>
            Historical health analysis and risk
            trend for this animal.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </div>


      {/* ANIMAL SUMMARY */}
      <div className="trend-card animal-summary">

        <div>
          <span className="summary-label">
            Animal
          </span>

          <strong>
            {data?.animalName || "Unknown"}
          </strong>
        </div>

        <div>
          <span className="summary-label">
            Tag ID
          </span>

          <strong>
            {data?.animalTag || "N/A"}
          </strong>
        </div>

        <div>
          <span className="summary-label">
            Health Records
          </span>

          <strong>
            {data?.totalRecords || 0}
          </strong>
        </div>

      </div>


      {/* SUMMARY CARDS */}
      <div className="trend-summary-grid">

        {/* HEALTH TREND */}
        <div className="trend-card">

          <span className="summary-label">
            Health Trend
          </span>

          <div className="trend-value">

            {data?.trend === "Improving" && "📈"}

            {data?.trend === "Declining" && "📉"}

            {data?.trend === "Stable" && "➡️"}

            {data?.trend === "No Data" && "—"}

            <strong>
              {data?.trend || "Unknown"}
            </strong>

          </div>

        </div>


        {/* CURRENT RISK */}
        <div className="trend-card">

          <span className="summary-label">
            Current Risk
          </span>

          <span
            className={`risk-badge ${
              data?.currentRisk?.toLowerCase() || ""
            }`}
          >
            {data?.currentRisk || "Unknown"}
          </span>

        </div>


        {/* PREVIOUS RISK */}
        <div className="trend-card">

          <span className="summary-label">
            Previous Risk
          </span>

          <span
            className={`risk-badge ${
              data?.previousRisk?.toLowerCase() || ""
            }`}
          >
            {data?.previousRisk || "N/A"}
          </span>

        </div>


        {/* HEALTH SCORE */}
        <div className="trend-card">

          <span className="summary-label">
            Health Score
          </span>

          <strong className="health-score">

            {data?.healthScore ?? "N/A"}

            {data?.healthScore !== null &&
              data?.healthScore !== undefined &&
              "/100"}

          </strong>

        </div>

      </div>


      {/* RISK CHANGE */}
      <div className="trend-card risk-change-card">

        <h2>Risk Change</h2>

        <p>
          {data?.riskChange ||
            "No significant change detected."}
        </p>

      </div>


      {/* HEALTH HISTORY */}
      <div className="trend-card">

        <div className="section-title">

          <div>
            <h2>Health History</h2>

            <p>
              Historical health records used for
              AI trend analysis.
            </p>
          </div>

        </div>


        {data?.history?.length > 0 ? (

          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Risk</th>
                  <th>Temperature</th>
                  <th>Appetite</th>
                  <th>Activity</th>
                  <th>Milk Production</th>
                </tr>
              </thead>


              <tbody>

                {data.history.map(
                  (record, index) => (

                    <tr key={index}>

                      <td>
                        {new Date(
                          record.date
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <strong>
                          {record.healthScore}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`risk-badge ${
                            record.riskLevel?.toLowerCase() ||
                            ""
                          }`}
                        >
                          {record.riskLevel}
                        </span>

                      </td>

                      <td>
                        {record.temperature ?? "—"}
                      </td>

                      <td>
                        {record.appetite ?? "—"}
                      </td>

                      <td>
                        {record.activityLevel ?? "—"}
                      </td>

                      <td>
                        {record.milkProduction ?? "—"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="no-history">
            No historical health records available.
          </div>

        )}

      </div>


      {/* AI INSIGHTS */}
      <div className="trend-card">

        <h2>
          🤖 AI Health Insights
        </h2>

        <div className="insights-list">

          {data?.insights?.length > 0 ? (

            data.insights.map(
              (insight, index) => (

                <div
                  className="insight-item"
                  key={index}
                >

                  <span>💡</span>

                  <p>
                    {insight}
                  </p>

                </div>

              )
            )

          ) : (

            <p>
              No additional insights available.
            </p>

          )}

        </div>

      </div>


      {/* DISCLAIMER */}
      <div className="ai-trend-disclaimer">

        <strong>
          AI Analysis Notice
        </strong>

        <p>
          This health trend analysis is based on
          available historical health records and
          rule-based indicators. It is intended as
          decision-support information and is not a
          veterinary diagnosis.
        </p>

      </div>

    </div>
  );
}

export default AIHealthTrend;