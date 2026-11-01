import { useEffect, useState } from "react";
import api from "../api/axios";

function AddReminder() {

  // ==========================
  // State
  // ==========================

  const [animals, setAnimals] = useState([]);

  const [animalId, setAnimalId] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [animalsLoading, setAnimalsLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================
  // Fetch Animals
  // ==========================

  async function fetchAnimals() {

    try {

      setAnimalsLoading(true);
      setError("");

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
        "Animal fetch error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        "Failed to load animals."
      );

    } finally {

      setAnimalsLoading(false);

    }

  }


  // ==========================
  // Load Animals
  // ==========================

  useEffect(() => {

    fetchAnimals();

  }, []);


  // ==========================
  // Create Reminder
  // ==========================

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");


    // Basic validation

    if (!animalId) {

      setError(
        "Please select an animal."
      );

      return;

    }


    if (!reminderType) {

      setError(
        "Please select a reminder type."
      );

      return;

    }


    if (!title.trim()) {

      setError(
        "Please enter a reminder title."
      );

      return;

    }


    if (!dueDate) {

      setError(
        "Please select a due date."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await api.post(
          "/reminders",
          {
            animalId,
            reminderType,
            title: title.trim(),
            dueDate
          }
        );


      console.log(
        "Reminder created:",
        response.data
      );


      setSuccess(
        "Reminder created successfully!"
      );


      // Clear form

      setAnimalId("");
      setReminderType("");
      setTitle("");
      setDueDate("");


    } catch (error) {

      console.error(
        "Create reminder error:",
        error.response?.data ||
        error.message
      );


      // Handle validator errors

      if (
        error.response?.data?.errors
      ) {

        const messages =
          error.response.data.errors
            .map(
              (item) => item.msg
            )
            .join(", ");

        setError(messages);

      } else {

        setError(
          error.response?.data?.message ||
          "Failed to create reminder."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // ==========================
  // Navigation
  // ==========================

  function goReminders() {

    window.location.href =
      "/reminders";

  }


  function goDashboard() {

    window.location.href =
      "/";

  }


  function logout() {

    localStorage.removeItem("token");

    window.location.href =
      "/login";

  }


  // ==========================
  // UI
  // ==========================

  return (

    <div className="dashboard">


      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            🔔 DairyCare AI
          </h1>

          <p>
            Add Reminder
          </p>

        </div>


        <div className="header-buttons">

          <button
            className="nav-button"
            onClick={goDashboard}
          >
            ← Dashboard
          </button>


          <button
            className="nav-button"
            onClick={goReminders}
          >
            🔔 Reminders
          </button>


          <button
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
          ➕ Add Reminder
        </h2>


        <div className="form-container">

          <form
            onSubmit={handleSubmit}
          >


            {/* ================= */}
            {/* Animal */}
            {/* ================= */}

            <div className="form-group">

              <label>
                <strong>
                  Select Animal
                </strong>
              </label>


              {animalsLoading ? (

                <p>
                  Loading animals...
                </p>

              ) : (

                <select
                  value={animalId}
                  onChange={(e) =>
                    setAnimalId(
                      e.target.value
                    )
                  }
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

                        {" - "}

                        {animal.animalTagId ||
                          "No Tag"}

                      </option>

                    )
                  )}

                </select>

              )}

            </div>


            {/* ================= */}
            {/* Reminder Type */}
            {/* ================= */}

            <div className="form-group">

              <label>
                <strong>
                  Reminder Type
                </strong>
              </label>


              <select
                value={reminderType}
                onChange={(e) =>
                  setReminderType(
                    e.target.value
                  )
                }
              >

                <option value="">
                  -- Select Type --
                </option>

                <option value="injection">
                  💉 Injection
                </option>

                <option value="diet">
                  🥗 Diet
                </option>

                <option value="health">
                  ❤️ Health
                </option>

              </select>

            </div>


            {/* ================= */}
            {/* Title */}
            {/* ================= */}

            <div className="form-group">

              <label>
                <strong>
                  Reminder Title
                </strong>
              </label>


              <input
                type="text"
                placeholder="Enter reminder title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ================= */}
            {/* Due Date */}
            {/* ================= */}

            <div className="form-group">

              <label>
                <strong>
                  Due Date
                </strong>
              </label>


              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ================= */}
            {/* Error */}
            {/* ================= */}

            {error && (

              <div className="page-error">

                ❌ {error}

              </div>

            )}


            {/* ================= */}
            {/* Success */}
            {/* ================= */}

            {success && (

              <div className="success-message">

                ✅ {success}

              </div>

            )}


            {/* ================= */}
            {/* Buttons */}
            {/* ================= */}

            <div className="form-buttons">

              <button
                type="submit"
                className="nav-button"
                disabled={loading}
              >

                {loading
                  ? "Creating..."
                  : "🔔 Create Reminder"}

              </button>


              <button
                type="button"
                className="back-button"
                onClick={goReminders}
              >

                Cancel

              </button>

            </div>


          </form>

        </div>

      </main>

    </div>

  );

}

export default AddReminder;