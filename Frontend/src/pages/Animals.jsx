import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./Animal.css";

function Animals() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/animals");

      console.log("Animals API response:", response.data);

      setAnimals(response.data?.animals || []);
    } catch (error) {
      console.error(
        "Animals fetch error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load animals."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD ANIMALS
  // =====================================================

  useEffect(() => {
    fetchAnimals();
  }, []);

  // =====================================================
  // ADD ANIMAL
  // =====================================================

  function goToAddAnimal() {
    navigate("/animals/add");
  }

  // =====================================================
  // EDIT ANIMAL
  // =====================================================

  function handleEdit(animalId) {
    if (!animalId) {
      return;
    }

    navigate(`/animals/edit/${animalId}`);
  }

  // =====================================================
  // DELETE ANIMAL
  // =====================================================

  async function handleDelete(animalId, animalName) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${
        animalName || "this animal"
      }?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(animalId);
      setError("");

      await api.delete(`/animals/${animalId}`);

      setAnimals((currentAnimals) =>
        currentAnimals.filter(
          (animal) => animal._id !== animalId
        )
      );

      alert("Animal deleted successfully.");
    } catch (error) {
      console.error(
        "Delete animal error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete animal."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // AI RECOMMENDATION
  // =====================================================

  function handleAIRecommendation(animalId) {
    if (!animalId) {
      setError("Animal ID is missing.");
      return;
    }

    navigate(`/ai/recommendation/${animalId}`);
  }

  // =====================================================
  // AI HEALTH RISK
  // =====================================================

  function handleAIHealthRisk(animalId) {
    if (!animalId) {
      setError("Animal ID is missing.");
      return;
    }

    navigate(`/ai/health-risk/${animalId}`);
  }

  // =====================================================
  // AI HEALTH TREND
  // =====================================================

  function handleAIHealthTrend(animalId) {
    if (!animalId) {
      setError("Animal ID is missing.");
      return;
    }

    navigate(`/ai/health-trend/${animalId}`);
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  function goToDashboard() {
    navigate("/");
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>🐄 Loading animals...</h2>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>
          <h1>🐄 DairyCare AI</h1>

          <p>Animal Management</p>
        </div>

        <div className="header-buttons">

          {/* DASHBOARD */}

          <button
            type="button"
            className="back-button"
            onClick={goToDashboard}
          >
            ← Dashboard
          </button>

          {/* ADD ANIMAL */}

          <button
            type="button"
            className="animals-button"
            onClick={goToAddAnimal}
          >
            ➕ Add Animal
          </button>

          {/* REFRESH */}

          <button
            type="button"
            className="refresh-button"
            onClick={fetchAnimals}
          >
            🔄 Refresh
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="page-title-row">

          <div>

            <h2 className="section-title">
              🐄 All Animals
            </h2>

            <p className="animal-count">
              Total Animals: {animals.length}
            </p>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="page-error">
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {animals.length === 0 ? (

          <div className="empty-message">

            <h3>🐄 No animals found</h3>

            <p>
              You haven't added any animals yet.
            </p>

            <button
              type="button"
              className="submit-button"
              onClick={goToAddAnimal}
            >
              ➕ Add Your First Animal
            </button>

          </div>

        ) : (

          /* =================================================
             ANIMAL GRID
          ================================================= */

          <div className="animals-grid">

            {animals.map((animal) => (

              <div
                className="animal-card"
                key={animal._id}
              >

                {/* =================================================
                    ANIMAL NAME
                ================================================= */}

                <h3>
                  🐄{" "}
                  {animal.name || "Unnamed Animal"}
                </h3>

                {/* =================================================
                    TAG
                ================================================= */}

                <p>
                  <strong>Tag ID:</strong>{" "}
                  {animal.animalTagId ||
                    "Not available"}
                </p>

                {/* =================================================
                    BREED
                ================================================= */}

                <p>
                  <strong>Breed:</strong>{" "}
                  {animal.breed ||
                    "Not available"}
                </p>

                {/* =================================================
                    GENDER
                ================================================= */}

                <p>
                  <strong>Gender:</strong>{" "}
                  {animal.gender ||
                    "Not available"}
                </p>

                {/* =================================================
                    DATE OF BIRTH
                ================================================= */}

                <p>
                  <strong>Date of Birth:</strong>{" "}

                  {animal.dateOfBirth
                    ? new Date(
                        animal.dateOfBirth
                      ).toLocaleDateString()
                    : "Not available"}
                </p>

                {/* =================================================
                    WEIGHT
                ================================================= */}

                <p>
                  <strong>Weight:</strong>{" "}

                  {animal.weight !== undefined &&
                  animal.weight !== null
                    ? `${animal.weight} kg`
                    : "Not available"}
                </p>

                {/* =================================================
                    MILK PRODUCTION
                ================================================= */}

                <p>
                  <strong>
                    Milk Production:
                  </strong>{" "}

                  {animal.milkProduction !==
                    undefined &&
                  animal.milkProduction !== null
                    ? `${animal.milkProduction} L/day`
                    : "Not available"}
                </p>

                {/* =================================================
                    PREGNANCY
                ================================================= */}

                <p>
                  <strong>Pregnancy:</strong>{" "}

                  {animal.pregnancyStatus === true
                    ? "🤰 Pregnant"
                    : animal.pregnancyStatus === false
                    ? "Not Pregnant"
                    : "Not available"}
                </p>

                {/* =================================================
                    CREATED DATE
                ================================================= */}

                {animal.createdAt && (
                  <p>
                    <strong>Added:</strong>{" "}

                    {new Date(
                      animal.createdAt
                    ).toLocaleDateString()}
                  </p>
                )}

                {/* =================================================
                    FARM ID
                ================================================= */}

                {animal.farmId && (
                  <p>
                    <strong>Farm:</strong>{" "}

                    {typeof animal.farmId === "object"
                      ? animal.farmId._id
                      : animal.farmId}
                  </p>
                )}

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "18px",
                    flexWrap: "wrap",
                  }}
                >

                  {/* =================================================
                      EDIT
                  ================================================= */}

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      handleEdit(animal._id)
                    }
                    disabled={
                      deletingId === animal._id
                    }
                  >
                    ✏ Edit
                  </button>

                  {/* =================================================
                      DELETE
                  ================================================= */}

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDelete(
                        animal._id,
                        animal.name
                      )
                    }
                    disabled={
                      deletingId === animal._id
                    }
                  >
                    {deletingId === animal._id
                      ? "Deleting..."
                      : "🗑 Delete"}
                  </button>

                  {/* =================================================
                      AI RECOMMENDATION
                  ================================================= */}

                  <button
                    type="button"
                    className="ai-button"
                    onClick={() =>
                      handleAIRecommendation(
                        animal._id
                      )
                    }
                    disabled={
                      deletingId === animal._id
                    }
                  >
                    🧠 AI Recommendation
                  </button>

                  {/* =================================================
                      AI HEALTH RISK
                  ================================================= */}

                  <button
                    type="button"
                    className="ai-health-button"
                    onClick={() =>
                      handleAIHealthRisk(
                        animal._id
                      )
                    }
                    disabled={
                      deletingId === animal._id
                    }
                  >
                    🩺 Health Risk Analysis
                  </button>

                  {/* =================================================
                      AI HEALTH TREND
                  ================================================= */}

                  <button
                    type="button"
                    className="ai-health-button"
                    onClick={() =>
                      handleAIHealthTrend(
                        animal._id
                      )
                    }
                    disabled={
                      deletingId === animal._id
                    }
                  >
                    📈 AI Health Trend
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Animals;