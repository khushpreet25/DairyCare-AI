import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import "./AIHealthRisk.css";

function AIHealthRisk() {
  const navigate = useNavigate();
  const { animalId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH AI HEALTH RISK
  // =====================================================

  async function fetchHealthRisk() {
    try {
      setLoading(true);
      setError("");
      setData(null);

      if (!animalId) {
        setError("Animal ID is missing.");
        return;
      }

      console.log(
        "Fetching AI Health Risk for Animal:",
        animalId
      );

      const response = await api.get(
        `/ai/health-risk/${animalId}`
      );

      console.log(
        "AI Health Risk Response:",
        response.data
      );

      if (response.data?.success === false) {
        setError(
          response.data?.message ||
            "Failed to generate AI health risk analysis."
        );

        return;
      }

      setData(response.data?.data || null);

    } catch (error) {
      console.error(
        "AI Health Risk Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to generate AI health risk analysis."
      );

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchHealthRisk();
  }, [animalId]);

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================================
  // BACK
  // =====================================================

  function goBack() {
    navigate(-1);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ai-loading-page">

        <div className="ai-loading-card">

          <div className="ai-loading-icon">
            🧠
          </div>

          <h2>
            Analyzing Animal Health...
          </h2>

          <p>
            AI is analyzing the available health,
            injection and reminder records.
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

        <header className="ai-header">

          <div>
            <h1>
              🧠 DairyCare AI
            </h1>

            <p>
              AI Health Risk Analysis
            </p>
          </div>

          <button
            type="button"
            className="ai-logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </header>

        <main className="ai-main">

          <div className="ai-error-card">

            <div className="ai-error-icon">
              ⚠️
            </div>

            <h2>
              Analysis Failed
            </h2>

            <p>
              {error}
            </p>

            <div className="ai-action-buttons">

              <button
                type="button"
                className="ai-primary-button"
                onClick={fetchHealthRisk}
              >
                🔄 Try Again
              </button>

              <button
                type="button"
                className="ai-secondary-button"
                onClick={goBack}
              >
                ← Go Back
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!data || !data.analysis) {
    return (
      <div className="ai-page">

        <header className="ai-header">

          <div>
            <h1>
              🧠 DairyCare AI
            </h1>

            <p>
              AI Health Risk Analysis
            </p>
          </div>

          <button
            type="button"
            className="ai-logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </header>

        <main className="ai-main">

          <div className="ai-error-card">

            <div className="ai-error-icon">
              🔍
            </div>

            <h2>
              No Analysis Available
            </h2>

            <p>
              AI could not generate a health
              analysis for this animal.
            </p>

            <div className="ai-action-buttons">

              <button
                type="button"
                className="ai-primary-button"
                onClick={fetchHealthRisk}
              >
                🔄 Try Again
              </button>

              <button
                type="button"
                className="ai-secondary-button"
                onClick={goBack}
              >
                ← Go Back
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // EXTRACT DATA
  // =====================================================

  const animal = data.animal;
  const analysis = data.analysis;
  const summary = data.dataSummary;

  const riskLevel =
    analysis.riskLevel || "LOW";

  const riskScore =
    analysis.riskScore ?? 0;

  const severity =
    analysis.severity ||
    (
      riskLevel === "HIGH"
        ? "Immediate Attention"
        : riskLevel === "MEDIUM"
        ? "Monitor Closely"
        : "Routine Monitoring"
    );

  const dataConfidence =
    analysis.dataConfidence ?? 0;

  const breakdown =
    analysis.breakdown || {
      health: 0,
      injections: 0,
      reminders: 0,
      production: 0,
    };

  const riskFactors =
    analysis.riskFactors || [];

  const recommendations =
    analysis.recommendations || [];

  // =====================================================
  // RISK CLASS
  // =====================================================

  const riskClass =
    String(riskLevel).toLowerCase();

  // =====================================================
  // SEVERITY CLASS
  // =====================================================

  const severityClass =
    String(severity)
      .toLowerCase()
      .replace(/\s+/g, "-");

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
            🧠 DairyCare AI
          </h1>

          <p>
            AI Health Risk Analysis
          </p>

        </div>

        <div className="ai-header-actions">

          <button
            type="button"
            className="ai-secondary-button"
            onClick={goBack}
          >
            ← Back
          </button>

          <button
            type="button"
            className="ai-logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ai-main">

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div className="ai-page-title">

          <div>

            <h2>
              AI Health Assessment
            </h2>

            <p>
              Intelligent screening based on the
              animal's available records.
            </p>

          </div>

          <button
            type="button"
            className="ai-refresh-button"
            onClick={fetchHealthRisk}
          >
            🔄 Re-analyze
          </button>

        </div>

        {/* =================================================
            ANIMAL INFORMATION
        ================================================= */}

        <section className="animal-info-card">

          <div className="animal-avatar">
            🐄
          </div>

          <div className="animal-details">

            <h2>
              {animal?.name ||
                "Unnamed Animal"}
            </h2>

            <div className="animal-meta">

              <span>
                <strong>Tag:</strong>{" "}
                {animal?.tagId || "N/A"}
              </span>

              <span>
                <strong>Breed:</strong>{" "}
                {animal?.breed || "N/A"}
              </span>

              <span>
                <strong>Gender:</strong>{" "}
                {animal?.gender || "N/A"}
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            RISK OVERVIEW
        ================================================= */}

        <section className="risk-overview">

          {/* RISK SCORE */}

          <div className="risk-score-card">

            <p className="card-label">
              HEALTH RISK SCORE
            </p>

            <div className="risk-score">
              {riskScore}
              <span className="score-max">
                /100
              </span>
            </div>

            <p className="score-description">
              Higher score indicates a greater
              number of detected risk factors.
            </p>

          </div>

          {/* RISK LEVEL */}

          <div
            className={`risk-level-card ${riskClass}`}
          >

            <p className="card-label">
              CURRENT RISK LEVEL
            </p>

            <div className="risk-level-icon">

              {riskLevel === "HIGH" && "🔴"}

              {riskLevel === "MEDIUM" && "🟠"}

              {riskLevel === "LOW" && "🟢"}

            </div>

            <h2>
              {riskLevel}
            </h2>

            <p>

              {riskLevel === "HIGH" &&
                "Veterinary evaluation is strongly recommended."}

              {riskLevel === "MEDIUM" &&
                "Closer monitoring is recommended."}

              {riskLevel === "LOW" &&
                "No major risk factors were detected."}

            </p>

          </div>

        </section>

        {/* =================================================
            NEW AI METRICS
        ================================================= */}

        <section className="ai-metrics-grid">

          {/* SEVERITY */}

          <div className={`ai-metric-card severity-card ${severityClass}`}>

            <div className="metric-icon">
              🎯
            </div>

            <div className="metric-content">

              <span className="metric-label">
                SEVERITY
              </span>

              <strong>
                {severity}
              </strong>

              <small>
                Based on the current detected risk level
              </small>

            </div>

          </div>

          {/* DATA CONFIDENCE */}

          <div className="ai-metric-card">

            <div className="metric-icon">
              📊
            </div>

            <div className="metric-content">

              <span className="metric-label">
                DATA CONFIDENCE
              </span>

              <strong>
                {dataConfidence}%
              </strong>

              <small>
                Availability of records used for screening
              </small>

              <div className="confidence-bar">

                <div
                  className="confidence-fill"
                  style={{
                    width: `${Math.min(
                      Math.max(dataConfidence, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RISK BREAKDOWN
        ================================================= */}

        <section className="ai-section">

          <div className="section-heading">

            <div className="section-icon">
              🔍
            </div>

            <div>

              <h2>
                Risk Breakdown
              </h2>

              <p>
                Contribution of different data categories
                to the current screening score.
              </p>

            </div>

          </div>

          <div className="risk-breakdown-grid">

            {/* HEALTH */}

            <div className="breakdown-card">

              <div className="breakdown-icon">
                🩺
              </div>

              <div className="breakdown-content">

                <span>
                  Health
                </span>

                <strong>
                  {breakdown.health ?? 0}
                </strong>

              </div>

            </div>

            {/* INJECTIONS */}

            <div className="breakdown-card">

              <div className="breakdown-icon">
                💉
              </div>

              <div className="breakdown-content">

                <span>
                  Injections
                </span>

                <strong>
                  {breakdown.injections ?? 0}
                </strong>

              </div>

            </div>

            {/* REMINDERS */}

            <div className="breakdown-card">

              <div className="breakdown-icon">
                🔔
              </div>

              <div className="breakdown-content">

                <span>
                  Reminders
                </span>

                <strong>
                  {breakdown.reminders ?? 0}
                </strong>

              </div>

            </div>

            {/* PRODUCTION */}

            <div className="breakdown-card">

              <div className="breakdown-icon">
                🥛
              </div>

              <div className="breakdown-content">

                <span>
                  Production
                </span>

                <strong>
                  {breakdown.production ?? 0}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RISK FACTORS
        ================================================= */}

        <section className="ai-section">

          <div className="section-heading">

            <div className="section-icon">
              ⚠️
            </div>

            <div>

              <h2>
                Detected Risk Factors
              </h2>

              <p>
                Conditions identified from the
                available animal records.
              </p>

            </div>

          </div>

          {riskFactors.length === 0 ? (

            <div className="no-risk">

              <span>
                ✅
              </span>

              <p>
                No significant risk factors detected.
              </p>

            </div>

          ) : (

            <div className="risk-factor-list">

              {riskFactors.map(
                (factor, index) => (

                  <div
                    className="risk-factor"
                    key={index}
                  >

                    <span className="factor-number">
                      {index + 1}
                    </span>

                    <span>
                      {factor}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            AI RECOMMENDATIONS
        ================================================= */}

        <section className="ai-section">

          <div className="section-heading">

            <div className="section-icon">
              💡
            </div>

            <div>

              <h2>
                AI Recommendations
              </h2>

              <p>
                Suggested actions based on the
                detected risk factors.
              </p>

            </div>

          </div>

          {recommendations.length === 0 ? (

            <div className="no-risk">

              <span>
                ✅
              </span>

              <p>
                No additional recommendations.
              </p>

            </div>

          ) : (

            <div className="recommendation-list">

              {recommendations.map(
                (recommendation, index) => (

                  <div
                    className="recommendation-item"
                    key={index}
                  >

                    <div className="recommendation-icon">
                      💡
                    </div>

                    <div>
                      {recommendation}
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            DATA SUMMARY
        ================================================= */}

        <section className="ai-section">

          <div className="section-heading">

            <div className="section-icon">
              📊
            </div>

            <div>

              <h2>
                Analysis Data
              </h2>

              <p>
                Records used during this analysis.
              </p>

            </div>

          </div>

          <div className="data-summary-grid">

            {/* HEALTH RECORDS */}

            <div className="summary-card">

              <span className="summary-icon">
                🩺
              </span>

              <strong>
                {summary?.healthRecords ?? 0}
              </strong>

              <span>
                Health Records
              </span>

            </div>

            {/* INJECTIONS */}

            <div className="summary-card">

              <span className="summary-icon">
                💉
              </span>

              <strong>
                {summary?.injections ?? 0}
              </strong>

              <span>
                Injection Records
              </span>

            </div>

            {/* REMINDERS */}

            <div className="summary-card">

              <span className="summary-icon">
                🔔
              </span>

              <strong>
                {summary?.reminders ?? 0}
              </strong>

              <span>
                Reminders
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="ai-disclaimer">

          <strong>
            ⚠️ Important:
          </strong>

          <span>
            This AI health risk analysis is a
            screening tool based on available
            records. It is not a veterinary
            diagnosis. For high-risk animals,
            consult a qualified veterinarian.
          </span>

        </div>

        {/* =================================================
            BOTTOM BUTTONS
        ================================================= */}

        <div className="bottom-actions">

          <button
            type="button"
            className="ai-secondary-button"
            onClick={goBack}
          >
            ← Back
          </button>

          <button
            type="button"
            className="ai-primary-button"
            onClick={fetchHealthRisk}
          >
            🧠 Run Analysis Again
          </button>

        </div>

      </main>

    </div>
  );
}

export default AIHealthRisk;