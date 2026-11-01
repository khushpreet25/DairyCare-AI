import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function EditHealthRecord() {

  // =========================
  // Get Health Record ID
  // =========================

  const { id } = useParams();


  // =========================
  // State
  // =========================

  const [animals, setAnimals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    animalId: "",
    temperature: "",
    appetite: "",
    activityLevel: "",
    milkProduction: "",
    symptoms: "",
    notes: ""
  });


  // =========================
  // Fetch Animals
  // =========================

  async function fetchAnimals() {

    try {

      const response =
        await api.get("/animals");

      console.log(
        "Animals:",
        response.data
      );

      setAnimals(
        response.data.animals || []
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


  // =========================
  // Fetch Health Record
  // =========================

  async function fetchHealthRecord() {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get(
          `/health/single/${id}`
        );


      console.log(
        "Health record:",
        response.data
      );


      const record =
        response.data.healthRecord;


      if (!record) {

        setError(
          "Health record not found."
        );

        return;

      }


      setFormData({

        animalId:
          record.animalId?._id ||
          record.animalId ||
          "",

        temperature:
          record.temperature ?? "",

        appetite:
          record.appetite || "",

        activityLevel:
          record.activityLevel || "",

        milkProduction:
          record.milkProduction ?? "",

        symptoms:
          record.symptoms || "",

        notes:
          record.notes || ""

      });

    } catch (error) {

      console.error(
        "Fetch health record error:",
        error.response?.data ||
        error.message
      );


      setError(
        error.response?.data?.message ||
        "Failed to load health record."
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================
  // Load Data
  // =========================

  useEffect(() => {

    fetchAnimals();

    fetchHealthRecord();

  }, [id]);


  // =========================
  // Handle Input
  // =========================

  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    setFormData(
      (currentData) => ({

        ...currentData,

        [name]: value

      })
    );

  }


  // =========================
  // Update Health Record
  // =========================

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");


    // =========================
    // Basic Validation
    // =========================

    if (!formData.animalId) {

      setError(
        "Animal ID is required."
      );

      return;

    }


    if (!formData.temperature) {

      setError(
        "Temperature is required."
      );

      return;

    }


    if (!formData.appetite) {

      setError(
        "Please select appetite."
      );

      return;

    }


    if (!formData.activityLevel) {

      setError(
        "Please select activity level."
      );

      return;

    }


    try {

      setSubmitting(true);


      const dataToSend = {

        animalId:
          formData.animalId,

        temperature:
          Number(
            formData.temperature
          ),

        appetite:
          formData.appetite,

        activityLevel:
          formData.activityLevel,

        milkProduction:
          formData.milkProduction === ""
            ? 0
            : Number(
                formData.milkProduction
              ),

        symptoms:
          formData.symptoms.trim(),

        notes:
          formData.notes.trim()

      };


      console.log(
        "Updating health record:",
        dataToSend
      );


      const response =
        await api.put(
          `/health/${id}`,
          dataToSend
        );


      console.log(
        "Update response:",
        response.data
      );


      alert(
        "Health record updated successfully!"
      );


      // Return to Health Records

      window.location.href =
        "/health";

    } catch (error) {

      console.error(
        "Update health record error:",
        error.response?.data ||
        error.message
      );


      // Express-validator errors

      if (
        error.response?.data?.errors
      ) {

        const validationErrors =
          error.response.data.errors
            .map(
              (item) =>
                item.msg
            )
            .join("\n");


        setError(
          validationErrors
        );

      } else {

        setError(
          error.response?.data?.message ||
          "Failed to update health record."
        );

      }

    } finally {

      setSubmitting(false);

    }

  }


  // =========================
  // Navigation
  // =========================

  function goBack() {

    window.location.href =
      "/health";

  }


  function goDashboard() {

    window.location.href =
      "/";

  }


  function logout() {

    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/login";

  }


  // =========================
  // Loading
  // =========================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <h2>
          Loading Health Record...
        </h2>

      </div>

    );

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="dashboard">


      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            ❤️ DairyCare AI
          </h1>

          <p>
            Edit Health Record
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
            className="animals-button"
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

        </div>

      </header>


      {/* ========================= */}
      {/* Main */}
      {/* ========================= */}

      <main>

        <h2 className="section-title">

          ✏️ Edit Health Record

        </h2>


        {/* ========================= */}
        {/* Error */}
        {/* ========================= */}

        {error && (

          <div className="page-error">

            {error}

          </div>

        )}


        {/* ========================= */}
        {/* Form */}
        {/* ========================= */}

        <form
          onSubmit={handleSubmit}
          className="form-card"
        >


          {/* Animal */}

          <div className="form-group">

            <label>

              <strong>
                🐄 Animal
              </strong>

            </label>


            <select
              name="animalId"
              value={
                formData.animalId
              }
              onChange={handleChange}
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


          {/* Temperature */}

          <div className="form-group">

            <label>

              <strong>
                🌡️ Temperature (°C)
              </strong>

            </label>


            <input
              type="number"
              name="temperature"
              value={
                formData.temperature
              }
              onChange={handleChange}
              step="0.1"
              placeholder="e.g. 38.5"
              required
            />

          </div>


          {/* Appetite */}

          <div className="form-group">

            <label>

              <strong>
                🍽️ Appetite
              </strong>

            </label>


            <select
              name="appetite"
              value={
                formData.appetite
              }
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


          {/* Activity Level */}

          <div className="form-group">

            <label>

              <strong>
                🏃 Activity Level
              </strong>

            </label>


            <select
              name="activityLevel"
              value={
                formData.activityLevel
              }
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


          {/* Milk Production */}

          <div className="form-group">

            <label>

              <strong>
                🥛 Milk Production (Litres)
              </strong>

            </label>


            <input
              type="number"
              name="milkProduction"
              value={
                formData.milkProduction
              }
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="e.g. 12.5"
            />

          </div>


          {/* Symptoms */}

          <div className="form-group">

            <label>

              <strong>
                ⚠️ Symptoms
              </strong>

            </label>


            <textarea
              name="symptoms"
              value={
                formData.symptoms
              }
              onChange={handleChange}
              placeholder="Enter symptoms"
              rows="4"
            />

          </div>


          {/* Notes */}

          <div className="form-group">

            <label>

              <strong>
                📝 Notes
              </strong>

            </label>


            <textarea
              name="notes"
              value={
                formData.notes
              }
              onChange={handleChange}
              placeholder="Enter veterinarian notes"
              rows="4"
            />

          </div>


          {/* Buttons */}

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
                ? "Updating..."
                : "💾 Update Health Record"}

            </button>

          </div>


        </form>

      </main>

    </div>

  );

}

export default EditHealthRecord;