import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AddInjection.css";

function AddInjection() {
  const navigate = useNavigate();

  // =========================================
  // FORM STATE
  // =========================================

  const [formData, setFormData] = useState({
    animalId: "",
    injectionName: "",
    dateGiven: "",
    nextDueDate: "",
    veterinarianName: "",
    dosage: "",
    notes: "",
  });

  // =========================================
  // OTHER STATES
  // =========================================

  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================
  // FETCH ANIMALS
  // =========================================

  useEffect(() => {
    fetchAnimals();
  }, []);

  async function fetchAnimals() {
    try {
      setLoadingAnimals(true);
      setError("");

      const response = await api.get("/animals");

      const animalList = Array.isArray(response.data?.animals)
        ? response.data.animals
        : [];

      setAnimals(animalList);
    } catch (err) {
      console.error(
        "Fetch animals error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load animals."
      );
    } finally {
      setLoadingAnimals(false);
    }
  }

  // =========================================
  // HANDLE INPUT
  // =========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!formData.animalId) {
      setError("Please select an animal.");
      return;
    }

    if (!formData.injectionName.trim()) {
      setError("Please enter the injection name.");
      return;
    }

    if (!formData.dateGiven) {
      setError("Please select the date given.");
      return;
    }

    if (!formData.nextDueDate) {
      setError("Please select the next due date.");
      return;
    }

    // Make sure next due date is not before date given
    if (
      new Date(formData.nextDueDate) <
      new Date(formData.dateGiven)
    ) {
      setError(
        "Next due date cannot be before the date given."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        animalId: formData.animalId,
        injectionName: formData.injectionName.trim(),
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate,
        veterinarianName:
          formData.veterinarianName.trim(),
        dosage: formData.dosage.trim(),
        notes: formData.notes.trim(),
      };

      const response = await api.post(
        "/injections",
        payload
      );

      setMessage(
        response.data?.message ||
          "Injection added successfully."
      );

      // Reset form
      setFormData({
        animalId: "",
        injectionName: "",
        dateGiven: "",
        nextDueDate: "",
        veterinarianName: "",
        dosage: "",
        notes: "",
      });

    } catch (err) {
      console.error(
        "Add injection error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to add injection."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // NAVIGATION
  // =========================================

  function handleCancel() {
    navigate("/injections");
  }

  function handleLogout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="add-injection-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div className="brand-section">
          <h1>🐄 DairyCare AI</h1>

          <p>
            Smart Dairy Farm Management
          </p>
        </div>

        <div className="header-buttons">

          <button
            type="button"
            className="back-button"
            onClick={handleCancel}
          >
            ← Back to Injections
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="add-injection-main">

        {/* TITLE */}

        <div className="page-heading">

          <h2 className="section-title">
            💉 Add Injection
          </h2>

          <p className="section-description">
            Enter injection details below.
          </p>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="success-message">
            ✅ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="page-error">
            ⚠️ {error}
          </div>
        )}

        {/* ===================================
            FORM
        ==================================== */}

        <form
          className="injection-form"
          onSubmit={handleSubmit}
        >

          {/* ANIMAL */}

          <div className="form-group">

            <label htmlFor="animalId">
              Animal <span>*</span>
            </label>

            <select
              id="animalId"
              name="animalId"
              value={formData.animalId}
              onChange={handleChange}
              disabled={loadingAnimals || saving}
              required
            >

              <option value="">
                {loadingAnimals
                  ? "Loading animals..."
                  : "Select an animal"}
              </option>

              {animals.map((animal) => (
                <option
                  key={animal._id}
                  value={animal._id}
                >
                  {animal.name || "Unnamed Animal"}
                  {" - "}
                  {animal.animalTagId || "No Tag"}
                </option>
              ))}

            </select>

          </div>

          {/* INJECTION NAME */}

          <div className="form-group">

            <label htmlFor="injectionName">
              Injection Name <span>*</span>
            </label>

            <input
              id="injectionName"
              type="text"
              name="injectionName"
              value={formData.injectionName}
              onChange={handleChange}
              placeholder="e.g. FMD Vaccine"
              disabled={saving}
              required
            />

          </div>

          {/* DATE GIVEN */}

          <div className="form-group">

            <label htmlFor="dateGiven">
              Date Given <span>*</span>
            </label>

            <input
              id="dateGiven"
              type="date"
              name="dateGiven"
              value={formData.dateGiven}
              onChange={handleChange}
              disabled={saving}
              required
            />

          </div>

          {/* NEXT DUE DATE */}

          <div className="form-group">

            <label htmlFor="nextDueDate">
              Next Due Date <span>*</span>
            </label>

            <input
              id="nextDueDate"
              type="date"
              name="nextDueDate"
              value={formData.nextDueDate}
              onChange={handleChange}
              disabled={saving}
              required
            />

          </div>

          {/* VETERINARIAN */}

          <div className="form-group">

            <label htmlFor="veterinarianName">
              Veterinarian Name
            </label>

            <input
              id="veterinarianName"
              type="text"
              name="veterinarianName"
              value={formData.veterinarianName}
              onChange={handleChange}
              placeholder="Enter veterinarian name"
              disabled={saving}
            />

          </div>

          {/* DOSAGE */}

          <div className="form-group">

            <label htmlFor="dosage">
              Dosage
            </label>

            <input
              id="dosage"
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g. 5 ml"
              disabled={saving}
            />

          </div>

          {/* NOTES */}

          <div className="form-group notes-group">

            <label htmlFor="notes">
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the injection..."
              disabled={saving}
              rows="5"
            />

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={saving || loadingAnimals}
            >
              {saving
                ? "Saving..."
                : "💾 Save Injection"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AddInjection;