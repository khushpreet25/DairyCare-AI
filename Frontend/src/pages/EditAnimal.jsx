import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function EditAnimal() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [farms, setFarms] = useState([]);

  const [formData, setFormData] = useState({
    animalTagId: "",
    name: "",
    breed: "",
    gender: "",
    dateOfBirth: "",
    weight: "",
    milkProduction: "",
    pregnancyStatus: false,
    farmId: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // FETCH ANIMAL
  // =====================================================

  async function fetchAnimal() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/animals/${id}`
      );

      console.log(
        "Animal details:",
        response.data
      );

      const animal =
        response.data?.animal;

      if (!animal) {
        setError("Animal not found.");
        return;
      }

      // =================================================
      // SET FORM DATA
      // =================================================

      setFormData({
        animalTagId:
          animal.animalTagId || "",

        name:
          animal.name || "",

        breed:
          animal.breed || "",

        gender:
          animal.gender || "",

        dateOfBirth:
          animal.dateOfBirth
            ? new Date(animal.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",

        weight:
          animal.weight ?? "",

        milkProduction:
          animal.milkProduction ?? "",

        pregnancyStatus:
          animal.pregnancyStatus === true,

        farmId:
          typeof animal.farmId === "object"
            ? animal.farmId?._id || ""
            : animal.farmId || "",
      });
    } catch (error) {
      console.error(
        "Fetch animal error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load animal."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FETCH FARMS
  // =====================================================

  async function fetchFarms() {
    try {
      const response =
        await api.get("/farms");

      console.log(
        "Farms:",
        response.data
      );

      setFarms(
        response.data?.farms || []
      );
    } catch (error) {
      console.error(
        "Fetch farms error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load farms."
      );
    }
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Invalid animal ID.");
      setLoading(false);
      return;
    }

    fetchAnimal();
    fetchFarms();
  }, [id]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previousData) => ({
      ...previousData,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // =====================================================
  // SUBMIT UPDATE
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      // -----------------------------------------------
      // Basic validation
      // -----------------------------------------------

      if (!formData.animalTagId) {
        setError(
          "Animal Tag ID is required."
        );
        return;
      }

      if (!formData.name) {
        setError(
          "Animal name is required."
        );
        return;
      }

      if (!formData.farmId) {
        setError(
          "Please select a farm."
        );
        return;
      }

      // -----------------------------------------------
      // Data sent to backend
      // -----------------------------------------------

      const updateData = {
        animalTagId:
          formData.animalTagId,

        name:
          formData.name,

        breed:
          formData.breed,

        gender:
          formData.gender,

        dateOfBirth:
          formData.dateOfBirth,

        weight:
          formData.weight === ""
            ? undefined
            : Number(formData.weight),

        milkProduction:
          formData.milkProduction === ""
            ? undefined
            : Number(
                formData.milkProduction
              ),

        pregnancyStatus:
          formData.pregnancyStatus,

        farmId:
          formData.farmId,
      };

      console.log(
        "Updating animal:",
        updateData
      );

      // -----------------------------------------------
      // UPDATE API
      // -----------------------------------------------

      const response =
        await api.put(
          `/animals/${id}`,
          updateData
        );

      console.log(
        "Update response:",
        response.data
      );

      setMessage(
        response.data?.message ||
          "Animal updated successfully."
      );

      // -----------------------------------------------
      // Go back after successful update
      // -----------------------------------------------

      setTimeout(() => {
        navigate("/animals");
      }, 1000);

    } catch (error) {
      console.error(
        "Update animal error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to update animal."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // BACK
  // =====================================================

  function goBack() {
    navigate("/animals");
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  function goDashboard() {
    navigate("/");
  }

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
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>
          🐄 Loading animal...
        </h2>
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
            🐄 DairyCare AI
          </h1>

          <p>
            Edit Animal
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

      <main>

        <h2 className="section-title">
          ✏️ Edit Animal
        </h2>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="page-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="animal-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              FARM
          ================================================= */}

          <label>
            Farm

            <select
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Farm
              </option>

              {farms.map((farm) => (
                <option
                  key={farm._id}
                  value={farm._id}
                >
                  {farm.farmName}
                </option>
              ))}

            </select>

          </label>

          {/* =================================================
              ANIMAL TAG ID
          ================================================= */}

          <label>
            Animal Tag ID

            <input
              type="text"
              name="animalTagId"
              value={
                formData.animalTagId
              }
              onChange={handleChange}
              placeholder="Example: COW-001"
              required
            />

          </label>

          {/* =================================================
              NAME
          ================================================= */}

          <label>
            Animal Name

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={handleChange}
              placeholder="Example: Gauri"
              required
            />

          </label>

          {/* =================================================
              BREED
          ================================================= */}

          <label>
            Breed

            <input
              type="text"
              name="breed"
              value={
                formData.breed
              }
              onChange={handleChange}
              placeholder="Example: Jersey"
            />

          </label>

          {/* =================================================
              GENDER
          ================================================= */}

          <label>
            Gender

            <select
              name="gender"
              value={
                formData.gender
              }
              onChange={handleChange}
            >

              <option value="">
                Select Gender
              </option>

              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

            </select>

          </label>

          {/* =================================================
              DATE OF BIRTH
          ================================================= */}

          <label>
            Date of Birth

            <input
              type="date"
              name="dateOfBirth"
              value={
                formData.dateOfBirth
              }
              onChange={handleChange}
            />

          </label>

          {/* =================================================
              WEIGHT
          ================================================= */}

          <label>
            Weight (kg)

            <input
              type="number"
              name="weight"
              value={
                formData.weight
              }
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Example: 450"
            />

          </label>

          {/* =================================================
              MILK PRODUCTION
          ================================================= */}

          <label>
            Milk Production (L/day)

            <input
              type="number"
              name="milkProduction"
              value={
                formData.milkProduction
              }
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Example: 18"
            />

          </label>

          {/* =================================================
              PREGNANCY
          ================================================= */}

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >

            <input
              type="checkbox"
              name="pregnancyStatus"
              checked={
                formData.pregnancyStatus
              }
              onChange={handleChange}
            />

            <span>
              🤰 Pregnant
            </span>

          </label>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >

            {/* UPDATE */}

            <button
              type="submit"
              className="submit-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "💾 Save Changes"}
            </button>

            {/* CANCEL */}

            <button
              type="button"
              className="back-button"
              onClick={goBack}
              disabled={saving}
            >
              Cancel
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default EditAnimal;