import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./Reminder.css";

function Reminders() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH REMINDERS
  // =====================================================

  async function fetchReminders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reminders");

      console.log("Reminders response:", response.data);

      setReminders(response.data?.reminders || []);
    } catch (error) {
      console.error(
        "Reminder fetch error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load reminders."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD REMINDERS
  // =====================================================

  useEffect(() => {
    fetchReminders();
  }, []);

  // =====================================================
  // COMPLETE REMINDER
  // =====================================================

  async function completeReminder(reminderId) {
    try {
      await api.patch(
        `/reminders/${reminderId}/complete`
      );

      alert("Reminder marked as completed.");

      fetchReminders();
    } catch (error) {
      console.error(
        "Complete reminder error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete reminder."
      );
    }
  }

  // =====================================================
  // DELETE REMINDER
  // =====================================================

  async function deleteReminder(reminderId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(
        `/reminders/${reminderId}`
      );

      alert("Reminder deleted successfully.");

      fetchReminders();
    } catch (error) {
      console.error(
        "Delete reminder error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete reminder."
      );
    }
  }

  // =====================================================
  // EDIT REMINDER
  // =====================================================

  function editReminder(reminderId) {
    if (!reminderId) {
      console.error(
        "Reminder ID is missing."
      );

      return;
    }

    console.log(
      "Opening edit reminder:",
      reminderId
    );

    navigate(
      `/edit-reminder/${reminderId}`
    );
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function goDashboard() {
    navigate("/");
  }

  function goAddReminder() {
    navigate("/add-reminder");
  }

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
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
            Loading Reminders...
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

        <div>
          <h1>
            🔔 DairyCare AI
          </h1>

          <p>
            Reminder Management
          </p>
        </div>

        <div className="header-buttons">

          {/* Dashboard */}

          <button
            type="button"
            className="nav-button"
            onClick={goDashboard}
          >
            ← Dashboard
          </button>

          {/* Add Reminder */}

          <button
            type="button"
            className="nav-button"
            onClick={goAddReminder}
          >
            ➕ Add Reminder
          </button>

          {/* Logout */}

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

        <h2 className="section-title">
          🔔 Reminders
        </h2>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="page-error">
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            NO REMINDERS
        ================================================= */}

        {!error && reminders.length === 0 && (
          <div className="empty-message">

            <h3>
              No reminders found
            </h3>

            <p>
              Create a reminder for an animal.
            </p>

            <button
              type="button"
              className="nav-button"
              onClick={goAddReminder}
            >
              ➕ Add Reminder
            </button>

          </div>
        )}

        {/* =================================================
            REMINDER CARDS
        ================================================= */}

        {!error && reminders.length > 0 && (
          <div className="reminders-grid">

            {reminders.map((reminder) => (

              <div
                className="reminder-card"
                key={reminder._id}
              >

                {/* =================================================
                    TITLE
                ================================================= */}

                <h3>
                  🔔{" "}
                  {reminder.title ||
                    "Untitled Reminder"}
                </h3>

                {/* =================================================
                    TYPE
                ================================================= */}

                <p>
                  <strong>
                    Type:
                  </strong>{" "}
                  {reminder.reminderType ||
                    "N/A"}
                </p>

                {/* =================================================
                    ANIMAL
                ================================================= */}

                <p>
                  <strong>
                    Animal:
                  </strong>{" "}
                  {reminder.animalId?.name ||
                    "Animal not found"}
                </p>

                {/* =================================================
                    TAG ID
                ================================================= */}

                <p>
                  <strong>
                    Tag ID:
                  </strong>{" "}
                  {reminder.animalId
                    ?.animalTagId ||
                    "N/A"}
                </p>

                {/* =================================================
                    DUE DATE
                ================================================= */}

                <p>
                  <strong>
                    Due Date:
                  </strong>{" "}

                  {reminder.dueDate
                    ? new Date(
                        reminder.dueDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

                {/* =================================================
                    STATUS
                ================================================= */}

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  <span
                    className={
                      reminder.status ===
                      "completed"
                        ? "status-completed"
                        : "status-pending"
                    }
                  >
                    {reminder.status ||
                      "pending"}
                  </span>
                </p>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="card-buttons">

                  {/* COMPLETE */}

                  {reminder.status !==
                    "completed" && (
                    <button
                      type="button"
                      className="complete-button"
                      onClick={() =>
                        completeReminder(
                          reminder._id
                        )
                      }
                    >
                      ✅ Complete
                    </button>
                  )}

                  {/* EDIT */}

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      editReminder(
                        reminder._id
                      )
                    }
                  >
                    ✏ Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      deleteReminder(
                        reminder._id
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default Reminders;