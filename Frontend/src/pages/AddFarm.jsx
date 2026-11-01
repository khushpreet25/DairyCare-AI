import { useState } from "react";
import api from "../api/axios";

function AddFarm() {

  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ==========================
  // Handle Input Change
  // ==========================

  function handleChange(event) {

    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));

  }

  // ==========================
  // Submit Form
  // ==========================

  async function handleSubmit(event) {

    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {

      const farmData = {
        farmName: formData.farmName.trim(),
        location: formData.location.trim(),
        address: formData.address.trim()
      };

      console.log("Sending Farm:", farmData);

      const response = await api.post(
        "/farms",
        farmData
      );

      setMessage(
        response.data.message ||
        "Farm created successfully"
      );

      setFormData({
        farmName: "",
        location: "",
        address: ""
      });

    } catch (error) {

      console.error(
        "Add farm error:",
        error.response?.data || error.message
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
          "Failed to create farm."
        );

      }

    } finally {

      setLoading(false);

    }

  }

  // ==========================
  // Navigation
  // ==========================

  function goToDashboard() {

    window.location.href = "/";

  }

  function goToFarms() {

    window.location.href = "/farms";

  }

  function handleLogout() {

    localStorage.removeItem("token");

    window.location.href = "/login";

  }

  // ==========================
  // UI
  // ==========================

  return (

    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>🌾 DairyCare AI</h1>

          <p>Add New Farm</p>

        </div>

        <div className="header-buttons">

          <button
            type="button"
            className="back-button"
            onClick={goToDashboard}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="animals-button"
            onClick={goToFarms}
          >
            🌾 Manage Farms
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

      <main>

        <h2 className="section-title">

          ➕ Add New Farm

        </h2>

        {message && (

          <div className="success-message">

            {message}

          </div>

        )}

        {error && (

          <div className="page-error">

            {error}

          </div>

        )}

        <form
          className="animal-form"
          onSubmit={handleSubmit}
        >

          <label>

            Farm Name *

            <input
              type="text"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              placeholder="Happy Dairy Farm"
              required
            />

          </label>

          <label>

            Location *

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Rajpura"
              required
            />

          </label>

          <label>

            Address *

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              placeholder="Village, City, State"
              required
            />

          </label>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >

            {loading
              ? "Creating Farm..."
              : "🌾 Add Farm"}

          </button>

        </form>

      </main>

    </div>

  );

}

export default AddFarm;