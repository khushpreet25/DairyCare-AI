import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function AddDietPlan() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [animals, setAnimals] = useState([]);

  const [formData, setFormData] = useState({
    animalId: "",
    feedName: "",
    quantity: "",
    feedingTime: "",
    nutritionalNotes: "",
    startDate: "",
    endDate: "",
  });

  const [loadingAnimals, setLoadingAnimals] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {
    try {
      setLoadingAnimals(true);
      setError("");

      const response =
        await api.get("/animals");

      console.log(
        "Animals API response:",
        response.data
      );

      setAnimals(
        response.data?.animals || []
      );
    } catch (error) {
      console.error(
        "Fetch animals error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load animals."
      );
    } finally {
      setLoadingAnimals(false);
    }
  }

  // =====================================================
  // LOAD ANIMALS
  // =====================================================

  useEffect(() => {
    fetchAnimals();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    // Clear previous messages
    setError("");
    setMessage("");
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  function validateForm() {
    if (!formData.animalId) {
      return "Please select an animal.";
    }

    if (!formData.feedName.trim()) {
      return "Please enter the feed name.";
    }

    if (!formData.quantity) {
      return "Please enter feed quantity.";
    }

    if (Number(formData.quantity) <= 0) {
      return "Quantity must be greater than 0.";
    }

    if (!formData.feedingTime.trim()) {
      return "Please enter feeding time.";
    }

    if (!formData.startDate) {
      return "Please select a start date.";
    }

    if (!formData.endDate) {
      return "Please select an end date.";
    }

    // Check dates
    const startDate =
      new Date(formData.startDate);

    const endDate =
      new Date(formData.endDate);

    if (endDate < startDate) {
      return "End date cannot be before start date.";
    }

    return "";
  }

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    // Validation
    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // DATA TO SEND
      // =================================================

      const dataToSend = {
        animalId:
          formData.animalId,

        feedName:
          formData.feedName.trim(),

        quantity:
          Number(formData.quantity),

        feedingTime:
          formData.feedingTime.trim(),

        nutritionalNotes:
          formData.nutritionalNotes.trim(),

        startDate:
          formData.startDate,

        endDate:
          formData.endDate,
      };

      console.log(
        "Creating diet plan:",
        dataToSend
      );

      // =================================================
      // API REQUEST
      // =================================================

      const response =
        await api.post(
          "/diet-plans",
          dataToSend
        );

      console.log(
        "Diet plan created:",
        response.data
      );

      setMessage(
        response.data?.message ||
          "Diet plan created successfully."
      );

      // =================================================
      // RESET FORM
      // =================================================

      setFormData({
        animalId: "",
        feedName: "",
        quantity: "",
        feedingTime: "",
        nutritionalNotes: "",
        startDate: "",
        endDate: "",
      });

      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {
        navigate("/diet-plans");
      }, 1000);

    } catch (error) {
      console.error(
        "Create diet plan error:",
        error.response?.data ||
          error.message
      );

      // Backend validation errors
      if (
        error.response?.data?.errors
      ) {
        const validationErrors =
          error.response.data.errors
            .map(
              (item) =>
                item.msg ||
                item.message
            )
            .filter(Boolean)
            .join("\n");

        setError(
          validationErrors ||
            "Please check the form fields."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to create diet plan."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function goBack() {
    navigate("/diet-plans");
  }

  function goDashboard() {
    navigate("/");
  }

  function goAnimals() {
    navigate("/animals");
  }

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================================
  // LOADING ANIMALS
  // =====================================================

  if (loadingAnimals) {
    return (
      <div className="dashboard-loading">

        <div className="loading-card">

          <div className="loading-icon">
            🥗
          </div>

          <h2>
            Loading Diet Management...
          </h2>

          <p>
            Fetching your animals...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="brand-section">

          <h1>
            🐄 DairyCare AI
          </h1>

          <p>
            Create Animal Diet Plan
          </p>

        </div>

        <div className="header-buttons">

          <button
            type="button"
            className="back-button"
            onClick={goDashboard}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="nav-button"
            onClick={goBack}
          >
            🥗 Diet Plans
          </button>

          <button
            type="button"
            className="nav-button"
            onClick={goAnimals}
          >
            🐄 Animals
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        <section className="dashboard-section">

          <div className="section-header-row">

            <div>

              <h2 className="section-title">
                ➕ Add Diet Plan
              </h2>

              <p>
                Create a nutrition and
                feeding schedule for an animal.
              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="page-error">

              <strong>
                ⚠️ Please check the following:
              </strong>

              <p
                style={{
                  whiteSpace: "pre-line",
                }}
              >
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {message && (
            <div className="success-message">

              ✅ {message}

              <p>
                Redirecting to Diet Plans...
              </p>

            </div>
          )}

          {/* =================================================
              NO ANIMALS
          ================================================= */}

          {animals.length === 0 ? (

            <div className="empty-message">

              <div className="empty-icon">
                🐄
              </div>

              <h3>
                No Animals Found
              </h3>

              <p>
                You must add an animal
                before creating a diet plan.
              </p>

              <button
                type="button"
                className="submit-button"
                onClick={goAnimals}
              >
                ➕ Add Animal
              </button>

            </div>

          ) : (

            /* =================================================
                FORM
            ================================================= */

            <form
              className="form-card"
              onSubmit={handleSubmit}
            >

              {/* ANIMAL */}

              <div className="form-group">

                <label htmlFor="animalId">
                  🐄{" "}
                  <strong>
                    Select Animal
                  </strong>
                </label>

                <select
                  id="animalId"
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >

                  <option value="">
                    -- Select Animal --
                  </option>

                  {animals.map(
                    (animal) => (
                      <option
                        key={animal._id}
                        value={animal._id}
                      >
                        {animal.name ||
                          "Unnamed Animal"}

                        {animal.animalTagId
                          ? ` (${animal.animalTagId})`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* FEED NAME */}

              <div className="form-group">

                <label htmlFor="feedName">
                  🌾{" "}
                  <strong>
                    Feed Name
                  </strong>
                </label>

                <input
                  id="feedName"
                  type="text"
                  name="feedName"
                  value={formData.feedName}
                  onChange={handleChange}
                  placeholder="e.g. Green Fodder"
                  disabled={submitting}
                  required
                />

              </div>

              {/* QUANTITY */}

              <div className="form-group">

                <label htmlFor="quantity">
                  ⚖️{" "}
                  <strong>
                    Quantity (kg)
                  </strong>
                </label>

                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  min="0.1"
                  step="0.1"
                  disabled={submitting}
                  required
                />

              </div>

              {/* FEEDING TIME */}

              <div className="form-group">

                <label htmlFor="feedingTime">
                  🕐{" "}
                  <strong>
                    Feeding Time
                  </strong>
                </label>

                <input
                  id="feedingTime"
                  type="text"
                  name="feedingTime"
                  value={formData.feedingTime}
                  onChange={handleChange}
                  placeholder="e.g. Morning"
                  disabled={submitting}
                  required
                />

                <small>
                  Example: Morning, Afternoon,
                  Evening
                </small>

              </div>

              {/* START DATE */}

              <div className="form-group">

                <label htmlFor="startDate">
                  📅{" "}
                  <strong>
                    Start Date
                  </strong>
                </label>

                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />

              </div>

              {/* END DATE */}

              <div className="form-group">

                <label htmlFor="endDate">
                  📅{" "}
                  <strong>
                    End Date
                  </strong>
                </label>

                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />

              </div>

              {/* NUTRITIONAL NOTES */}

              <div className="form-group">

                <label htmlFor="nutritionalNotes">
                  📝{" "}
                  <strong>
                    Nutritional Notes
                  </strong>
                </label>

                <textarea
                  id="nutritionalNotes"
                  name="nutritionalNotes"
                  value={
                    formData.nutritionalNotes
                  }
                  onChange={handleChange}
                  placeholder="Enter nutritional information or feeding instructions..."
                  rows="5"
                  disabled={submitting}
                />

              </div>

              {/* BUTTONS */}

              <div className="form-buttons">

                <button
                  type="button"
                  className="back-button"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "⏳ Saving..."
                    : "🥗 Save Diet Plan"}
                </button>

              </div>

            </form>

          )}

        </section>

      </main>

    </div>
  );
}

export default AddDietPlan;