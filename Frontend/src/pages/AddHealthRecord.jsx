import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function AddHealthRecord() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =========================================================
  // ANIMAL ID FROM URL
  // Example:
  // /health/add?animalId=12345
  // =========================================================

  const animalIdFromUrl = searchParams.get("animalId");

  // =========================================================
  // STATE
  // =========================================================

  const [animals, setAnimals] = useState([]);

  const [formData, setFormData] = useState({
    animalId: animalIdFromUrl || "",
    temperature: "",
    appetite: "",
    activityLevel: "",
    milkProduction: "",
    symptoms: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ANIMALS
  // =========================================================

  async function fetchAnimals() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/animals");

      console.log("Animals:", response.data);

      setAnimals(response.data?.animals || []);
    } catch (error) {
      console.error(
        "Fetch animals error:",
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

  // =========================================================
  // LOAD ANIMALS
  // =========================================================

  useEffect(() => {
    fetchAnimals();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  // =========================================================
  // SUBMIT HEALTH RECORD
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.animalId) {
      setError("Please select an animal.");
      return;
    }

    if (
      formData.temperature === "" ||
      formData.temperature === null
    ) {
      setError("Please enter temperature.");
      return;
    }

    if (!formData.appetite) {
      setError("Please select appetite.");
      return;
    }

    if (!formData.activityLevel) {
      setError("Please select activity level.");
      return;
    }

    // -------------------------------------------------------
    // PREPARE DATA
    // -------------------------------------------------------

    const dataToSend = {
      animalId: formData.animalId,

      temperature: Number(formData.temperature),

      appetite: formData.appetite,

      activityLevel: formData.activityLevel,

      milkProduction:
        formData.milkProduction === ""
          ? 0
          : Number(formData.milkProduction),

      symptoms: formData.symptoms.trim(),

      notes: formData.notes.trim(),
    };

    try {
      setSubmitting(true);

      console.log(
        "Creating health record:",
        dataToSend
      );

      const response = await api.post(
        "/health",
        dataToSend
      );

      console.log(
        "Health record created:",
        response.data
      );

      alert(
        "❤️ Health record created successfully!"
      );

      // React Router navigation
      navigate("/health");
    } catch (error) {
      console.error(
        "Create health record error:",
        error.response?.data || error.message
      );

      // -----------------------------------------------------
      // VALIDATION ERRORS FROM BACKEND
      // -----------------------------------------------------

      if (
        Array.isArray(
          error.response?.data?.errors
        )
      ) {
        const validationErrors =
          error.response.data.errors
            .map(
              (item) =>
                item.msg || item.message
            )
            .join("\n");

        setError(validationErrors);
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to create health record."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  function goBack() {
    navigate("/health");
  }

  function goDashboard() {
    navigate("/");
  }

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <div className="loading-icon">
            ❤️
          </div>

          <h2>
            Loading Health Management...
          </h2>

          <p>
            Fetching your animals...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div className="brand-section">

          <h1>
            🐄 DairyCare AI
          </h1>

          <p>
            Add Health Record
          </p>

        </div>

        <nav className="header-buttons">

          <button
            type="button"
            className="nav-button"
            onClick={goDashboard}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="nav-button"
            onClick={goBack}
          >
            ❤️ Health Records
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </nav>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        <section className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2 className="section-title">
                ➕ Add Health Record
              </h2>

              <p>
                Record the current health
                condition of an animal.
              </p>
            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="page-error">

              <strong>
                ⚠️ Error
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="form-card"
          >

            {/* =================================================
                ANIMAL
            ================================================= */}

            <div className="form-group">

              <label htmlFor="animalId">
                <strong>
                  🐄 Select Animal
                </strong>
              </label>

              <select
                id="animalId"
                name="animalId"
                value={formData.animalId}
                onChange={handleChange}
                required
              >

                <option value="">
                  -- Select Animal --
                </option>

                {animals.map((animal) => (
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
                ))}

              </select>

            </div>

            {/* =================================================
                TEMPERATURE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="temperature">
                <strong>
                  🌡️ Temperature (°C)
                </strong>
              </label>

              <input
                id="temperature"
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="e.g. 38.5"
                required
              />

            </div>

            {/* =================================================
                APPETITE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="appetite">
                <strong>
                  🍽️ Appetite
                </strong>
              </label>

              <select
                id="appetite"
                name="appetite"
                value={formData.appetite}
                onChange={handleChange}
                required
              >

                <option value="">
                  -- Select Appetite --
                </option>

                <option value="good">
                  Good
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="poor">
                  Poor
                </option>

              </select>

            </div>

            {/* =================================================
                ACTIVITY
            ================================================= */}

            <div className="form-group">

              <label htmlFor="activityLevel">
                <strong>
                  🏃 Activity Level
                </strong>
              </label>

              <select
                id="activityLevel"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
              >

                <option value="">
                  -- Select Activity Level --
                </option>

                <option value="active">
                  Active
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="low">
                  Low
                </option>

              </select>

            </div>

            {/* =================================================
                MILK PRODUCTION
            ================================================= */}

            <div className="form-group">

              <label htmlFor="milkProduction">
                <strong>
                  🥛 Milk Production (Litres)
                </strong>
              </label>

              <input
                id="milkProduction"
                type="number"
                name="milkProduction"
                value={formData.milkProduction}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 12.5"
              />

            </div>

            {/* =================================================
                SYMPTOMS
            ================================================= */}

            <div className="form-group">

              <label htmlFor="symptoms">
                <strong>
                  ⚠️ Symptoms
                </strong>
              </label>

              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Enter observed symptoms"
                rows="4"
              />

            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <div className="form-group">

              <label htmlFor="notes">
                <strong>
                  📝 Veterinarian Notes
                </strong>
              </label>

              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter veterinarian notes"
                rows="4"
              />

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

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
                  : "❤️ Save Health Record"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default AddHealthRecord;