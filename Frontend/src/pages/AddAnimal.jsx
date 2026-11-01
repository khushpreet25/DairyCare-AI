import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AddAnimal.css";

function AddAnimal() {
  const [formData, setFormData] = useState({
    animalTagId: "",
    name: "",
    breed: "",
    gender: "female",
    dateOfBirth: "",
    weight: "",
    milkProduction: "",
    pregnancyStatus: false,
    farmId: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [farms, setFarms] = useState([]);

  // =========================================
  // Fetch user's farms
  // =========================================

  useEffect(() => {
    async function fetchFarms() {
      try {
        const response = await api.get("/farms");

        console.log("Farms received:", response.data);

        setFarms(response.data.farms || []);
      } catch (error) {
        console.error(
          "Farm loading error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load farms."
        );
      }
    }

    fetchFarms();
  }, []);

  // =========================================
  // Handle form changes
  // =========================================

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  }

  // =========================================
  // Submit animal form
  // =========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const animalData = {
        animalTagId: formData.animalTagId.trim(),

        name: formData.name.trim(),

        breed: formData.breed.trim(),

        gender: formData.gender,

        dateOfBirth: formData.dateOfBirth,

        weight: Number(formData.weight),

        milkProduction: Number(
          formData.milkProduction
        ),

        pregnancyStatus:
          formData.pregnancyStatus,

        farmId: formData.farmId
      };

      console.log(
        "Sending animal data:",
        animalData
      );

      const response = await api.post(
        "/animals",
        animalData
      );

      setMessage(
        response.data.message ||
          "Animal added successfully"
      );

      // Reset form
      setFormData({
        animalTagId: "",
        name: "",
        breed: "",
        gender: "female",
        dateOfBirth: "",
        weight: "",
        milkProduction: "",
        pregnancyStatus: false,
        farmId: ""
      });
    } catch (error) {
      console.error(
        "Add animal error:",
        error.response?.data ||
          error.message
      );

      const backendErrors =
        error.response?.data?.errors;

      if (
        backendErrors &&
        Array.isArray(backendErrors)
      ) {
        setError(
          backendErrors
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to add animal."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // Go to animals page
  // =========================================

  function goToAnimals() {
    window.location.href = "/animals";
  }

  // =========================================
  // Logout
  // =========================================

  function handleLogout() {
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="add-animal-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="dashboard-header">

        <div>
          <h1>🐄 DairyCare AI</h1>

          <p>
            Add a new animal
          </p>
        </div>

        <div className="header-buttons">

          <button
            type="button"
            className="back-button"
            onClick={goToAnimals}
          >
            ← All Animals
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
      ===================================== */}

      <main className="add-animal-main">

        <h2 className="section-title">
          ➕ Add New Animal
        </h2>

        {/* Success Message */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* Error Message */}

        {error && (
          <div className="page-error">
            {error}
          </div>
        )}

        {/* =================================
            ANIMAL FORM
        ================================= */}

        <form
          className="animal-form"
          onSubmit={handleSubmit}
        >

          {/* Animal Tag ID */}

          <label>
            Animal Tag ID *

            <input
              type="text"
              name="animalTagId"
              value={formData.animalTagId}
              onChange={handleChange}
              placeholder="COW-106"
              required
            />
          </label>

          {/* Animal Name */}

          <label>
            Animal Name *

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Rani"
              required
            />
          </label>

          {/* Breed */}

          <label>
            Breed *

            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Jersey"
              required
            />
          </label>

          {/* Gender */}

          <label>
            Gender *

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="female">
                Female
              </option>

              <option value="male">
                Male
              </option>
            </select>
          </label>

          {/* Date of Birth */}

          <label>
            Date of Birth *

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </label>

          {/* Weight */}

          <label>
            Weight (kg) *

            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="1"
              placeholder="420"
              required
            />
          </label>

          {/* Milk Production */}

          <label>
            Milk Production (L/day) *

            <input
              type="number"
              name="milkProduction"
              value={formData.milkProduction}
              onChange={handleChange}
              min="0"
              placeholder="18"
              required
            />
          </label>

          {/* Farm Dropdown */}

          <label>
            Select Farm *

            <select
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              required
            >

              <option value="">
                Select your farm
              </option>

              {farms.map((farm) => (
                <option
                  key={farm._id}
                  value={farm._id}
                >
                  {farm.farmName ||
                    farm.name ||
                    "Unnamed Farm"}
                </option>
              ))}

            </select>
          </label>

          {/* Pregnancy Status */}

          <label className="checkbox-label">

            <input
              type="checkbox"
              name="pregnancyStatus"
              checked={
                formData.pregnancyStatus
              }
              onChange={handleChange}
            />

            <span>
              Pregnant
            </span>

          </label>

          {/* Submit */}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading
              ? "Adding Animal..."
              : "➕ Add Animal"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default AddAnimal;