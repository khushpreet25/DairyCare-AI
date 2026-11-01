import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function EditDietPlan() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [animals, setAnimals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    animalId: "",
    feedName: "",
    quantity: "",
    feedingTime: "",
    nutritionalNotes: "",
    startDate: "",
    endDate: "",
  });

  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {
    try {
      const response = await api.get("/animals");

      console.log("Animals response:", response.data);

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
    }
  }

  // =====================================================
  // FORMAT DATE FOR INPUT
  // =====================================================

  function formatDateForInput(date) {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  }

  // =====================================================
  // FORMAT FEEDING TIME
  // =====================================================

  function formatFeedingTime(time) {
    if (!time) {
      return "";
    }

    // Backend-supported values
    const validTimes = [
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
    ];

    // Already valid
    if (validTimes.includes(time)) {
      return time;
    }

    // Handle old data stored as HH:mm
    if (
      typeof time === "string" &&
      /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
    ) {
      const hour = Number(time.split(":")[0]);

      if (hour >= 5 && hour < 12) {
        return "Morning";
      }

      if (hour >= 12 && hour < 17) {
        return "Afternoon";
      }

      if (hour >= 17 && hour < 21) {
        return "Evening";
      }

      return "Night";
    }

    return "";
  }

  // =====================================================
  // FETCH SINGLE DIET PLAN
  // =====================================================

  async function fetchDietPlan() {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching diet plan:", id);

      const response = await api.get(
        `/diet-plans/details/${id}`
      );

      console.log(
        "Diet plan response:",
        response.data
      );

      const diet = response.data?.dietPlan;

      if (!diet) {
        throw new Error(
          "Diet plan not found."
        );
      }

      // =================================================
      // GET ANIMAL ID
      // =================================================

      let animalId = "";

      if (
        diet.animalId &&
        typeof diet.animalId === "object"
      ) {
        animalId =
          diet.animalId._id || "";
      } else {
        animalId =
          diet.animalId || "";
      }

      // =================================================
      // SET FORM DATA
      // =================================================

      setFormData({
        animalId,

        feedName:
          diet.feedName || "",

        quantity:
          diet.quantity ?? "",

        feedingTime:
          formatFeedingTime(
            diet.feedingTime
          ),

        nutritionalNotes:
          diet.nutritionalNotes || "",

        startDate:
          formatDateForInput(
            diet.startDate
          ),

        endDate:
          formatDateForInput(
            diet.endDate
          ),
      });

    } catch (error) {
      console.error(
        "Fetch diet plan error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load diet plan."
      );

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError(
        "Diet plan ID is missing."
      );

      setLoading(false);

      return;
    }

    fetchAnimals();
    fetchDietPlan();

  }, [id]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    // =================================================
    // FRONTEND VALIDATION
    // =================================================

    if (!formData.animalId) {
      setError(
        "Please select an animal."
      );
      return;
    }

    if (!formData.feedName.trim()) {
      setError(
        "Feed name is required."
      );
      return;
    }

    if (
      formData.feedName.trim().length < 2
    ) {
      setError(
        "Feed name must be at least 2 characters."
      );
      return;
    }

    if (
      formData.feedName.trim().length > 100
    ) {
      setError(
        "Feed name cannot exceed 100 characters."
      );
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) <= 0
    ) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (!formData.feedingTime) {
      setError(
        "Please select feeding time."
      );
      return;
    }

    const validTimes = [
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
    ];

    if (
      !validTimes.includes(
        formData.feedingTime
      )
    ) {
      setError(
        "Invalid feeding time."
      );
      return;
    }

    if (!formData.startDate) {
      setError(
        "Start date is required."
      );
      return;
    }

    if (!formData.endDate) {
      setError(
        "End date is required."
      );
      return;
    }

    // =================================================
    // DATE VALIDATION
    // =================================================

    const startDate =
      new Date(formData.startDate);

    const endDate =
      new Date(formData.endDate);

    if (
      Number.isNaN(
        startDate.getTime()
      ) ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      setError(
        "Please enter valid dates."
      );
      return;
    }

    if (endDate < startDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    // =================================================
    // NUTRITIONAL NOTES VALIDATION
    // =================================================

    if (
      formData.nutritionalNotes.trim()
        .length > 500
    ) {
      setError(
        "Nutritional notes cannot exceed 500 characters."
      );
      return;
    }

    // =================================================
    // UPDATE
    // =================================================

    try {
      setSaving(true);

      const updateData = {
        animalId:
          formData.animalId,

        feedName:
          formData.feedName.trim(),

        quantity:
          Number(formData.quantity),

        feedingTime:
          formData.feedingTime,

        nutritionalNotes:
          formData.nutritionalNotes.trim(),

        startDate:
          formData.startDate,

        endDate:
          formData.endDate,
      };

      console.log(
        "================================="
      );

      console.log(
        "UPDATING DIET PLAN"
      );

      console.log(
        "Diet Plan ID:",
        id
      );

      console.log(
        "Update Data:",
        updateData
      );

      console.log(
        "================================="
      );

      const response = await api.put(
        `/diet-plans/${id}`,
        updateData
      );

      console.log(
        "Update response:",
        response.data
      );

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        "Diet plan updated successfully."
      );

      // Redirect after success
      setTimeout(() => {
        navigate("/diet-plans");
      }, 1000);

    } catch (error) {

      console.error(
        "================================="
      );

      console.error(
        "UPDATE DIET PLAN ERROR"
      );

      console.error(
        error.response?.data ||
          error.message
      );

      console.error(
        "================================="
      );

      // =================================================
      // SHOW VALIDATION ERRORS
      // =================================================

      const validationErrors =
        error.response?.data?.errors;

      if (
        Array.isArray(
          validationErrors
        ) &&
        validationErrors.length > 0
      ) {

        const errorMessages =
          validationErrors
            .map(
              (item) =>
                item.msg
            )
            .filter(Boolean)
            .join(" | ");

        setError(
          errorMessages ||
            "Diet plan validation failed."
        );

      } else {

        setError(
          error.response?.data?.message ||
            error.message ||
            "Update failed."
        );
      }

    } finally {
      setSaving(false);
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

  function logout() {
    localStorage.removeItem(
      "token"
    );

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

        <div className="loading-card">

          <div className="loading-icon">
            🥗
          </div>

          <h2>
            Loading Diet Plan...
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
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
            Edit Diet Plan
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

          <h2 className="section-title">
            ✏ Edit Diet Plan
          </h2>

          <p>
            Update the feeding and
            nutrition information below.
          </p>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="success-message">
              ✅ {message}
            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="page-error">
              ⚠️ {error}
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
                required
              >

                <option value="">
                  -- Select Animal --
                </option>

                {animals.map(
                  (animal) => (

                    <option
                      key={
                        animal._id
                      }
                      value={
                        animal._id
                      }
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
                FEED NAME
            ================================================= */}

            <div className="form-group">

              <label htmlFor="feedName">
                🥗 Feed Name
              </label>

              <input
                id="feedName"
                type="text"
                name="feedName"
                value={
                  formData.feedName
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Green Fodder"
                maxLength={100}
                required
              />

            </div>

            {/* =================================================
                QUANTITY
            ================================================= */}

            <div className="form-group">

              <label htmlFor="quantity">
                ⚖ Quantity (kg)
              </label>

              <input
                id="quantity"
                type="number"
                name="quantity"
                min="0.1"
                step="0.1"
                value={
                  formData.quantity
                }
                onChange={
                  handleChange
                }
                placeholder="Enter quantity"
                required
              />

            </div>

            {/* =================================================
                FEEDING TIME
            ================================================= */}

            <div className="form-group">

              <label htmlFor="feedingTime">
                ⏰ Feeding Time
              </label>

              <select
                id="feedingTime"
                name="feedingTime"
                value={
                  formData.feedingTime
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  -- Select Feeding Time --
                </option>

                <option value="Morning">
                  Morning
                </option>

                <option value="Afternoon">
                  Afternoon
                </option>

                <option value="Evening">
                  Evening
                </option>

                <option value="Night">
                  Night
                </option>

              </select>

            </div>

            {/* =================================================
                NUTRITIONAL NOTES
            ================================================= */}

            <div className="form-group">

              <label htmlFor="nutritionalNotes">
                📝 Nutritional Notes
              </label>

              <textarea
                id="nutritionalNotes"
                name="nutritionalNotes"
                rows="5"
                value={
                  formData.nutritionalNotes
                }
                onChange={
                  handleChange
                }
                placeholder="Enter nutritional notes..."
                maxLength={500}
              />

            </div>

            {/* =================================================
                START DATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="startDate">
                📅 Start Date
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                value={
                  formData.startDate
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* =================================================
                END DATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="endDate">
                📅 End Date
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                value={
                  formData.endDate
                }
                onChange={
                  handleChange
                }
                min={
                  formData.startDate
                }
                required
              />

            </div>

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

              <button
                type="submit"
                className="submit-button"
                disabled={saving}
              >

                {saving
                  ? "💾 Updating..."
                  : "💾 Update Diet Plan"}

              </button>

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

        </section>

      </main>

    </div>
  );
}

export default EditDietPlan;