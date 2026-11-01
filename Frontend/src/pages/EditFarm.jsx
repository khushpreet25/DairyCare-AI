import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function EditFarm() {

  const { id } = useParams();

  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ======================
  // Load Farm
  // ======================

  useEffect(() => {

    async function fetchFarm() {

      try {

        const response = await api.get(`/farms/${id}`);

        const farm = response.data.farm;

        setFormData({
          farmName: farm.farmName,
          location: farm.location,
          address: farm.address
        });

      } catch (error) {

        console.error(error);

        setError(
          error.response?.data?.message ||
          "Failed to load farm."
        );

      } finally {

        setLoading(false);

      }

    }

    fetchFarm();

  }, [id]);

  // ======================
  // Handle Input
  // ======================

  function handleChange(event) {

    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

  }

  // ======================
  // Update Farm
  // ======================

  async function handleSubmit(event) {

    event.preventDefault();

    setSaving(true);

    setError("");

    setMessage("");

    try {

      const response = await api.put(

        `/farms/${id}`,

        formData

      );

      setMessage(

        response.data.message ||

        "Farm updated successfully"

      );

      setTimeout(() => {

        window.location.href = "/farms";

      }, 1500);

    } catch (error) {

      console.error(error);

      setError(

        error.response?.data?.message ||

        "Failed to update farm."

      );

    } finally {

      setSaving(false);

    }

  }

  function goBack() {

    window.location.href = "/farms";

  }

  function handleLogout() {

    localStorage.removeItem("token");

    window.location.href = "/login";

  }

  if (loading) {

    return (

      <div className="dashboard-loading">

        <h2>Loading Farm...</h2>

      </div>

    );

  }

  return (

    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>🌾 DairyCare AI</h1>

          <p>Edit Farm</p>

        </div>

        <div className="header-buttons">

          <button

            className="back-button"

            onClick={goBack}

          >

            ← Manage Farms

          </button>

          <button

            className="logout-button"

            onClick={handleLogout}

          >

            Logout

          </button>

        </div>

      </header>

      <main>

        <h2 className="section-title">

          ✏ Edit Farm

        </h2>

        {message &&

          <div className="success-message">

            {message}

          </div>

        }

        {error &&

          <div className="page-error">

            {error}

          </div>

        }

        <form

          className="animal-form"

          onSubmit={handleSubmit}

        >

          <label>

            Farm Name

            <input

              type="text"

              name="farmName"

              value={formData.farmName}

              onChange={handleChange}

              required

            />

          </label>

          <label>

            Location

            <input

              type="text"

              name="location"

              value={formData.location}

              onChange={handleChange}

              required

            />

          </label>

          <label>

            Address

            <textarea

              rows="4"

              name="address"

              value={formData.address}

              onChange={handleChange}

              required

            />

          </label>

          <button

            type="submit"

            className="submit-button"

            disabled={saving}

          >

            {

              saving

                ? "Updating..."

                : "💾 Update Farm"

            }

          </button>

        </form>

      </main>

    </div>

  );

}

export default EditFarm;