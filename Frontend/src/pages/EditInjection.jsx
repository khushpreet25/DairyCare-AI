import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import "./Injection.css";

function EditInjection() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [animals, setAnimals] = useState([]);

  const [formData, setFormData] = useState({
    animalId: "",
    injectionName: "",
    injectionType: "",
    injectionDate: "",
    nextDueDate: "",
    dosage: "",
    administeredBy: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {
    try {
      const response = await api.get("/animals");

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
    }
  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDateForInput(date) {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate
      .toISOString()
      .split("T")[0];
  }


  // =====================================================
  // FETCH INJECTION
  // =====================================================

  async function fetchInjection() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/injections/${id}`
        );

      console.log(
        "Injection API response:",
        response.data
      );

      const injection =
        response.data?.injection ||
        response.data?.data;

      if (!injection) {
        setError(
          "Injection record not found."
        );

        return;
      }


      // =================================================
      // SET FORM DATA
      // =================================================

      setFormData({
        animalId:
          injection.animalId?._id ||
          injection.animalId ||
          "",

        injectionName:
          injection.injectionName ||
          "",

        injectionType:
          injection.injectionType ||
          "",

        injectionDate:
          formatDateForInput(
            injection.injectionDate
          ),

        nextDueDate:
          formatDateForInput(
            injection.nextDueDate
          ),

        dosage:
          injection.dosage ?? "",

        administeredBy:
          injection.administeredBy ||
          "",

        notes:
          injection.notes ||
          "",
      });

    } catch (error) {
      console.error(
        "Fetch injection error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load injection."
      );

    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // LOAD PAGE
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError(
        "Injection ID is missing."
      );

      setLoading(false);

      return;
    }

    async function loadData() {
      await Promise.all([
        fetchAnimals(),
        fetchInjection(),
      ]);
    }

    loadData();

  }, [id]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (currentData) => ({
        ...currentData,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");
  }


  // =====================================================
  // UPDATE INJECTION
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");


    // =================================================
    // VALIDATION
    // =================================================

    if (!formData.animalId) {
      setError(
        "Please select an animal."
      );

      return;
    }


    if (
      !formData.injectionName.trim()
    ) {
      setError(
        "Injection name is required."
      );

      return;
    }


    if (!formData.injectionDate) {
      setError(
        "Injection date is required."
      );

      return;
    }


    try {
      setSaving(true);


      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        animalId:
          formData.animalId,

        injectionName:
          formData.injectionName.trim(),

        injectionType:
          formData.injectionType.trim(),

        injectionDate:
          formData.injectionDate,

        nextDueDate:
          formData.nextDueDate ||
          null,

        dosage:
          formData.dosage,

        administeredBy:
          formData.administeredBy.trim(),

        notes:
          formData.notes.trim(),
      };


      console.log(
        "Updating injection:",
        payload
      );


      // =================================================
      // API
      // =================================================

      await api.put(
        `/injections/${id}`,
        payload
      );


      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Injection updated successfully."
      );


      setTimeout(() => {
        navigate("/injections");
      }, 1000);


    } catch (error) {
      console.error(
        "Update injection error:",
        error.response?.data ||
          error.message
      );


      // =================================================
      // UNAUTHORIZED
      // =================================================

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      setError(
        error.response?.data?.message ||
          "Failed to update injection."
      );

    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  function goBack() {
    navigate("/injections");
  }


  function goDashboard() {
    navigate("/");
  }


  function logout() {
    localStorage.removeItem(
      "token"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-card">

          <div className="loading-icon">
            💉
          </div>

          <h2>
            Loading Injection...
          </h2>

          <p>
            Fetching injection details.
          </p>

        </div>

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

          <h1>
            💉 DairyCare AI
          </h1>

          <p>
            Edit Injection Record
          </p>

        </div>


        <div className="header-buttons">

          <button
            type="button"
            className="back-button"
            onClick={goBack}
          >
            ← Injections
          </button>


          <button
            type="button"
            className="nav-button"
            onClick={goDashboard}
          >
            🏠 Dashboard
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

        <section className="form-card">

          {/* =================================================
              FORM HEADER
          ================================================= */}

          <div className="form-header">

            <div>

              <h2 className="section-title">
                💉 Edit Injection
              </h2>

              <p>
                Update the injection and
                vaccination information.
              </p>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="page-error">
              ⚠️ {error}
            </div>
          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="injection-form"
          >

            {/* =================================================
                ANIMAL
            ================================================= */}

            <div className="form-group">

              <label htmlFor="animalId">
                🐄 Animal
              </label>

              <select
                id="animalId"
                name="animalId"
                value={
                  formData.animalId
                }
                onChange={
                  handleChange
                }
                className="form-input"
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


            {/* =================================================
                INJECTION NAME
            ================================================= */}

            <div className="form-group">

              <label htmlFor="injectionName">
                💉 Injection Name
              </label>

              <input
                type="text"
                id="injectionName"
                name="injectionName"
                value={
                  formData.injectionName
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. FMD Vaccine"
                className="form-input"
                required
              />

            </div>


            {/* =================================================
                INJECTION TYPE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="injectionType">
                🧪 Injection Type
              </label>

              <input
                type="text"
                id="injectionType"
                name="injectionType"
                value={
                  formData.injectionType
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Vaccination"
                className="form-input"
              />

            </div>


            {/* =================================================
                INJECTION DATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="injectionDate">
                📅 Injection Date
              </label>

              <input
                type="date"
                id="injectionDate"
                name="injectionDate"
                value={
                  formData.injectionDate
                }
                onChange={
                  handleChange
                }
                className="form-input"
                required
              />

            </div>


            {/* =================================================
                NEXT DUE DATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="nextDueDate">
                🔔 Next Due Date
              </label>

              <input
                type="date"
                id="nextDueDate"
                name="nextDueDate"
                value={
                  formData.nextDueDate
                }
                onChange={
                  handleChange
                }
                className="form-input"
              />

            </div>


            {/* =================================================
                DOSAGE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="dosage">
                💊 Dosage
              </label>

              <input
                type="text"
                id="dosage"
                name="dosage"
                value={
                  formData.dosage
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 5 ml"
                className="form-input"
              />

            </div>


            {/* =================================================
                ADMINISTERED BY
            ================================================= */}

            <div className="form-group">

              <label htmlFor="administeredBy">
                🧑‍⚕️ Administered By
              </label>

              <input
                type="text"
                id="administeredBy"
                name="administeredBy"
                value={
                  formData.administeredBy
                }
                onChange={
                  handleChange
                }
                placeholder="Veterinarian / Staff name"
                className="form-input"
              />

            </div>


            {/* =================================================
                NOTES
            ================================================= */}

            <div className="form-group">

              <label htmlFor="notes">
                📝 Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={
                  formData.notes
                }
                onChange={
                  handleChange
                }
                placeholder="Add additional information..."
                className="form-input"
                rows="5"
              />

            </div>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="form-actions">

              <button
                type="button"
                className="back-button"
                onClick={goBack}
                disabled={saving}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="submit-button"
                disabled={saving}
              >

                {saving
                  ? "💾 Updating..."
                  : "💾 Update Injection"}

              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default EditInjection;