import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/axios";

function EditReminder() {

  const navigate = useNavigate();

  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [animals, setAnimals] = useState([]);

  const [formData, setFormData] = useState({
    animalId: "",
    reminderType: "",
    title: "",
    dueDate: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {

    try {

      const response =
        await api.get("/animals");

      console.log(
        "Animals response:",
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

  function formatDate(date) {

    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

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
  // FETCH REMINDER
  // =====================================================

  async function fetchReminder() {

    try {

      setLoading(true);

      setError("");

      console.log(
        "Fetching reminder ID:",
        id
      );

      const response =
        await api.get(
          `/reminders/details/${id}`
        );

      console.log(
        "Reminder response:",
        response.data
      );

      const reminder =
        response.data?.reminder;

      if (!reminder) {

        setError(
          "Reminder not found."
        );

        return;
      }

      // =================================================
      // ANIMAL ID
      // =================================================

      let animalId = "";

      if (
        reminder.animalId &&
        typeof reminder.animalId ===
          "object"
      ) {

        animalId =
          reminder.animalId._id || "";

      } else {

        animalId =
          reminder.animalId || "";
      }

      // =================================================
      // SET FORM
      // =================================================

      setFormData({

        animalId,

        reminderType:
          reminder.reminderType || "",

        title:
          reminder.title || "",

        dueDate:
          formatDate(
            reminder.dueDate
          ),
      });

    } catch (error) {

      console.error(
        "Fetch reminder error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to load reminder."
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
        "Reminder ID is missing."
      );

      setLoading(false);

      return;
    }

    fetchAnimals();

    fetchReminder();

  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );

    setError("");

    setSuccess("");
  }

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  async function handleSubmit(e) {

    e.preventDefault();

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

    if (!formData.reminderType) {

      setError(
        "Please select a reminder type."
      );

      return;
    }

    if (!formData.title.trim()) {

      setError(
        "Reminder title is required."
      );

      return;
    }

    if (
      formData.title.trim().length < 2
    ) {

      setError(
        "Reminder title must contain at least 2 characters."
      );

      return;
    }

    if (!formData.dueDate) {

      setError(
        "Due date is required."
      );

      return;
    }

    // =================================================
    // UPDATE DATA
    // =================================================

    const updateData = {

      animalId:
        formData.animalId,

      reminderType:
        formData.reminderType,

      title:
        formData.title.trim(),

      dueDate:
        formData.dueDate,
    };

    try {

      setSaving(true);

      console.log(
        "Updating reminder:",
        updateData
      );

      const response =
        await api.put(
          `/reminders/${id}`,
          updateData
        );

      console.log(
        "Update response:",
        response.data
      );

      setSuccess(
        "Reminder updated successfully!"
      );

      // Redirect after success

      setTimeout(() => {

        navigate("/reminders");

      }, 1000);

    } catch (error) {

      console.error(
        "Update reminder error:",
        error.response?.data ||
        error.message
      );

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
          "Failed to update reminder."
        );
      }

    } finally {

      setSaving(false);
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function goReminders() {

    navigate("/reminders");
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
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <div className="loading-card">

          <div className="loading-icon">
            🔔
          </div>

          <h2>
            Loading Reminder...
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
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
            Edit Reminder
          </p>

        </div>

        <div className="header-buttons">

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
            onClick={goReminders}
          >
            🔔 Reminders
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
            ✏️ Edit Reminder
          </h2>

          <p>
            Update reminder information below.
          </p>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="page-error">
              ❌ {error}
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
            className="animal-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                ANIMAL
            ================================================= */}

            <div className="form-group">

              <label htmlFor="animalId">
                🐄 Select Animal
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
                REMINDER TYPE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="reminderType">
                🔔 Reminder Type
              </label>

              <select
                id="reminderType"
                name="reminderType"
                value={
                  formData.reminderType
                }
                onChange={
                  handleChange
                }
                required
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

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="title">
                📝 Reminder Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder="Enter reminder title"
                minLength="2"
                maxLength="100"
                required
              />

            </div>

            {/* =================================================
                DUE DATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="dueDate">
                📅 Due Date
              </label>

              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={
                  formData.dueDate
                }
                onChange={
                  handleChange
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
                  : "💾 Update Reminder"}

              </button>

              <button
                type="button"
                className="back-button"
                onClick={goReminders}
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

export default EditReminder;