import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../api/axios";

import "../styles/Injections.css";

import { getUserRole } from "../utils/auth";


function Injections() {

  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  // =========================================================
  // ROLE
  // =========================================================

  const role = getUserRole();

  const isAdmin =
    role === "admin";

  const isFarmer =
    role === "farmer";

  const isVeterinarian =
    role === "veterinarian";

  const canManageInjections =
    isAdmin ||
    isFarmer ||
    isVeterinarian;


  // =========================================================
  // URL FILTER
  // =========================================================

  const urlFilter =
    searchParams.get("filter") ||
    "history";


  // =========================================================
  // STATE
  // =========================================================

  const [injections, setInjections] =
    useState([]);

  const [animals, setAnimals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState(urlFilter);

  const [showForm, setShowForm] =
    useState(false);

  const [editingInjection, setEditingInjection] =
    useState(null);


  // =========================================================
  // FORM
  // =========================================================

  const emptyForm = {
    animalId: "",
    injectionName: "",
    dateGiven: "",
    nextDueDate: "",
    veterinarianName: "",
    dosage: "",
    notes: "",
  };


  const [formData, setFormData] =
    useState(emptyForm);


  // =========================================================
  // SYNC URL FILTER
  // =========================================================

  useEffect(() => {

    const allowedFilters = [
      "history",
      "upcoming",
      "overdue",
    ];

    const filter =
      allowedFilters.includes(urlFilter)
        ? urlFilter
        : "history";

    setSelectedFilter(filter);

  }, [urlFilter]);


  // =========================================================
  // DATE HELPERS
  // =========================================================

  function getToday() {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return today;
  }


  function normalizeDate(date) {

    if (!date) {
      return null;
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return null;
    }

    parsed.setHours(
      0,
      0,
      0,
      0
    );

    return parsed;
  }


  // =========================================================
  // CHECK UPCOMING
  // =========================================================

  function isUpcoming(injection) {

    if (
      injection?.completed === true
    ) {
      return false;
    }

    const dueDate =
      normalizeDate(
        injection?.nextDueDate
      );

    if (!dueDate) {
      return false;
    }

    const today =
      getToday();

    return dueDate >= today;
  }


  // =========================================================
  // CHECK OVERDUE
  // =========================================================

  function isOverdue(injection) {

    if (
      injection?.completed === true
    ) {
      return false;
    }

    const dueDate =
      normalizeDate(
        injection?.nextDueDate
      );

    if (!dueDate) {
      return false;
    }

    const today =
      getToday();

    return dueDate < today;
  }


  // =========================================================
  // CHECK HISTORY
  // =========================================================

  function isHistory(injection) {

    return (
      injection?.completed === true
    );
  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  function formatDate(date) {

    if (!date) {
      return "N/A";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "N/A";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  // =========================================================
  // LOAD ANIMALS
  // =========================================================

  const fetchAnimals =
    useCallback(
      async () => {

        try {

          const response =
            await api.get(
              "/animals"
            );

          const data =
            response.data;

          const animalData =
            Array.isArray(
              data?.animals
            )
              ? data.animals
              : Array.isArray(data)
                ? data
                : [];

          setAnimals(
            animalData
          );

        } catch (error) {

          console.error(
            "Fetch animals error:",
            error.response?.data ||
            error.message
          );

        }

      },
      []
    );


  // =========================================================
  // LOAD INJECTIONS
  // =========================================================

  const fetchInjections =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");

          const response =
            await api.get(
              "/injections"
            );

          const data =
            response.data;

          const injectionData =
            Array.isArray(
              data?.injections
            )
              ? data.injections
              : Array.isArray(data)
                ? data
                : [];

          setInjections(
            injectionData
          );

        } catch (error) {

          console.error(
            "Fetch injections error:",
            error.response?.data ||
            error.message
          );

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

          if (
            error.response?.status === 403
          ) {

            setError(
              "You do not have permission to manage injections."
            );

            return;
          }

          setError(
            error.response?.data?.message ||
            "Failed to fetch injections."
          );

        } finally {

          setLoading(false);

        }

      },
      [navigate]
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    if (
      !canManageInjections
    ) {
      return;
    }

    fetchInjections();

    fetchAnimals();

  }, [
    canManageInjections,
    fetchInjections,
    fetchAnimals,
  ]);


  // =========================================================
  // FILTERED INJECTIONS
  // =========================================================

  const filteredInjections =
    useMemo(() => {

      // -----------------------------------------------------
      // HISTORY
      // -----------------------------------------------------

      if (
        selectedFilter === "history"
      ) {

        return injections
          .filter(
            isHistory
          )
          .sort(
            (a, b) =>
              new Date(
                b.dateGiven ||
                b.injectionDate ||
                b.createdAt
              ) -
              new Date(
                a.dateGiven ||
                a.injectionDate ||
                a.createdAt
              )
          );
      }


      // -----------------------------------------------------
      // UPCOMING
      // -----------------------------------------------------

      if (
        selectedFilter === "upcoming"
      ) {

        return injections
          .filter(
            isUpcoming
          )
          .sort(
            (a, b) =>
              new Date(
                a.nextDueDate
              ) -
              new Date(
                b.nextDueDate
              )
          );
      }


      // -----------------------------------------------------
      // OVERDUE
      // -----------------------------------------------------

      if (
        selectedFilter === "overdue"
      ) {

        return injections
          .filter(
            isOverdue
          )
          .sort(
            (a, b) =>
              new Date(
                a.nextDueDate
              ) -
              new Date(
                b.nextDueDate
              )
          );
      }


      return [];

    }, [
      injections,
      selectedFilter,
    ]);


  // =========================================================
  // COUNTS
  // =========================================================

  const totalCount =
    injections.length;


  const historyCount =
    injections.filter(
      isHistory
    ).length;


  const upcomingCount =
    injections.filter(
      isUpcoming
    ).length;


  const overdueCount =
    injections.filter(
      isOverdue
    ).length;


  // =========================================================
  // FILTER CHANGE
  // =========================================================

  function changeFilter(filter) {

    setSelectedFilter(
      filter
    );

    if (
      filter === "history"
    ) {

      setSearchParams({});

    } else {

      setSearchParams({
        filter,
      });

    }

  }


  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleInputChange(event) {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  }


  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  function openAddForm() {

    setEditingInjection(null);

    setFormData({
      ...emptyForm,
    });

    setError("");

    setSuccess("");

    setShowForm(true);

  }


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  function openEditForm(injection) {

    setEditingInjection(
      injection
    );

    setFormData({

      animalId:
        injection.animalId?._id ||
        injection.animalId ||
        "",

      injectionName:
        injection.injectionName ||
        "",

      dateGiven:
        injection.dateGiven
          ? String(
              injection.dateGiven
            ).substring(0, 10)
          : "",

      nextDueDate:
        injection.nextDueDate
          ? String(
              injection.nextDueDate
            ).substring(0, 10)
          : "",

      veterinarianName:
        injection.veterinarianName ||
        "",

      dosage:
        injection.dosage ||
        "",

      notes:
        injection.notes ||
        "",

    });

    setError("");

    setSuccess("");

    setShowForm(true);

  }


  // =========================================================
  // CLOSE FORM
  // =========================================================

  function closeForm() {

    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingInjection(null);

    setFormData({
      ...emptyForm,
    });

  }


  // =========================================================
  // SAVE INJECTION
  // =========================================================

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    setSaving(true);

    try {

      if (
        !formData.animalId
      ) {

        setError(
          "Please select an animal."
        );

        return;
      }


      if (
        !formData.injectionName.trim()
      ) {

        setError(
          "Please enter injection name."
        );

        return;
      }


      if (
        !formData.dateGiven
      ) {

        setError(
          "Please select the date given."
        );

        return;
      }


      if (
        !formData.nextDueDate
      ) {

        setError(
          "Please select the next due date."
        );

        return;
      }


      // -----------------------------------------------------
      // PAYLOAD
      // -----------------------------------------------------

      const payload = {

        animalId:
          formData.animalId,

        injectionName:
          formData.injectionName.trim(),

        dateGiven:
          formData.dateGiven,

        nextDueDate:
          formData.nextDueDate,

        veterinarianName:
          formData.veterinarianName.trim(),

        dosage:
          formData.dosage.trim(),

        notes:
          formData.notes.trim(),

      };


      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      if (
        editingInjection
      ) {

        await api.put(
          `/injections/${editingInjection._id}`,
          payload
        );

        setSuccess(
          "Injection updated successfully."
        );

      }

      // -----------------------------------------------------
      // CREATE
      // -----------------------------------------------------

      else {

        await api.post(
          "/injections",
          payload
        );

        setSuccess(
          "Injection added successfully."
        );

      }


      await fetchInjections();


      setShowForm(false);

      setEditingInjection(null);

      setFormData({
        ...emptyForm,
      });

    } catch (error) {

      console.error(
        "Save injection error:",
        error.response?.data ||
        error.message
      );

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
        "Failed to save injection."
      );

    } finally {

      setSaving(false);

    }

  }


  // =========================================================
  // MARK INJECTION COMPLETED
  // =========================================================

  async function handleMarkCompleted(
    injectionId
  ) {

    if (!injectionId) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to mark this injection as completed?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");

      setSuccess("");

      await api.patch(
        `/injections/${injectionId}/complete`
      );


      setSuccess(
        "Injection marked as completed successfully."
      );


      await fetchInjections();


      // Move automatically to History

      changeFilter(
        "history"
      );

    } catch (error) {

      console.error(
        "Mark completed error:",
        error.response?.data ||
        error.message
      );


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
        "Failed to mark injection as completed."
      );

    }

  }


  // =========================================================
  // DELETE INJECTION
  // =========================================================

  async function handleDelete(
    injectionId
  ) {

    if (!injectionId) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this injection record?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");

      setSuccess("");

      await api.delete(
        `/injections/${injectionId}`
      );


      setSuccess(
        "Injection deleted successfully."
      );


      await fetchInjections();

    } catch (error) {

      console.error(
        "Delete injection error:",
        error.response?.data ||
        error.message
      );


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
        "Failed to delete injection."
      );

    }

  }


  // =========================================================
  // STATUS
  // =========================================================

  function getStatus(injection) {

    if (
      injection.completed === true
    ) {

      return "Completed";

    }


    if (
      isOverdue(injection)
    ) {

      return "Overdue";

    }


    if (
      isUpcoming(injection)
    ) {

      return "Upcoming";

    }


    return "Unknown";

  }


  // =========================================================
  // STATUS CLASS
  // =========================================================

  function getStatusClass(injection) {

    const status =
      getStatus(injection);


    if (
      status === "Completed"
    ) {

      return "status-completed";

    }


    if (
      status === "Overdue"
    ) {

      return "status-overdue";

    }


    if (
      status === "Upcoming"
    ) {

      return "status-pending";

    }


    return "status-default";

  }


  // =========================================================
  // ROLE ACCESS
  // =========================================================

  if (
    !canManageInjections
  ) {

    return (

      <div className="injections-page">

        <div className="page-error">

          <h2>
            🔐 Access Denied
          </h2>

          <p>
            You do not have permission
            to access injection management.
          </p>

          <button
            type="button"
            className="nav-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="injections-page">

        <div className="empty-message">

          <div className="empty-icon">
            💉
          </div>

          <h2>
            Loading injections...
          </h2>

          <p>
            Fetching injection records.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="injections-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="injections-header">

        <div>

          <h1>
            💉 Injection Management
          </h1>

          <p>
            Manage vaccination and
            injection schedules.
          </p>

        </div>


        <div className="section-actions">

          <button
            type="button"
            className="nav-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>


          <button
            type="button"
            className="nav-button"
            onClick={openAddForm}
          >
            ➕ Add Injection
          </button>

        </div>

      </header>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (

        <div className="page-error">

          <strong>
            ⚠️ Error
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {success && (

        <div className="success-message">

          ✅ {success}

        </div>

      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="stats-grid">

        {/* TOTAL */}

        <div
          className="stat-card clickable-card"
          onClick={() =>
            changeFilter("history")
          }
        >

          <div className="stat-icon">
            💉
          </div>

          <div>

            <h3>
              Total Injections
            </h3>

            <p>
              {totalCount}
            </p>

            <small>
              {historyCount} completed
            </small>

          </div>

        </div>


        {/* UPCOMING */}

        <div
          className="stat-card clickable-card"
          onClick={() =>
            changeFilter("upcoming")
          }
        >

          <div className="stat-icon">
            📅
          </div>

          <div>

            <h3>
              Upcoming
            </h3>

            <p>
              {upcomingCount}
            </p>

            <small>
              View upcoming →
            </small>

          </div>

        </div>


        {/* OVERDUE */}

        <div
          className="stat-card clickable-card"
          onClick={() =>
            changeFilter("overdue")
          }
        >

          <div className="stat-icon">
            ⚠️
          </div>

          <div>

            <h3>
              Overdue
            </h3>

            <p>
              {overdueCount}
            </p>

            <small>
              View overdue →
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <section className="dashboard-section">

        <div className="section-header-row">

          <div>

            <h2 className="section-title">

              {selectedFilter === "upcoming"
                ? "📅 Upcoming Injections"
                : selectedFilter === "overdue"
                  ? "⚠️ Overdue Injections"
                  : "🕒 Injection History"}

            </h2>


            <p>

              {selectedFilter === "upcoming"
                ? "Incomplete injections due today or in the future."
                : selectedFilter === "overdue"
                  ? "Incomplete injections whose due date has passed."
                  : "Completed injection records."}

            </p>

          </div>


          <div className="section-actions">

            {/* HISTORY */}

            <button
              type="button"
              className={
                selectedFilter === "history"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() =>
                changeFilter("history")
              }
            >
              🕒 History
            </button>


            {/* UPCOMING */}

            <button
              type="button"
              className={
                selectedFilter === "upcoming"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() =>
                changeFilter("upcoming")
              }
            >
              📅 Upcoming
            </button>


            {/* OVERDUE */}

            <button
              type="button"
              className={
                selectedFilter === "overdue"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() =>
                changeFilter("overdue")
              }
            >
              ⚠️ Overdue
            </button>

          </div>

        </div>


        {/* ===================================================
            NO RECORDS
        =================================================== */}

        {filteredInjections.length === 0 ? (

          <div className="empty-message">

            <div className="empty-icon">

              {selectedFilter === "upcoming"
                ? "📅"
                : selectedFilter === "overdue"
                  ? "✅"
                  : "💉"}

            </div>


            <h3>

              {selectedFilter === "upcoming"
                ? "No upcoming injections"
                : selectedFilter === "overdue"
                  ? "No overdue injections"
                  : "No injection history"}

            </h3>


            <p>

              {selectedFilter === "upcoming"
                ? "There are no incomplete injections due today or in the future."
                : selectedFilter === "overdue"
                  ? "Great! There are no incomplete overdue injections."
                  : "Completed injection records will appear here."}

            </p>


            {selectedFilter === "history" && (

              <button
                type="button"
                className="nav-button"
                onClick={openAddForm}
              >
                ➕ Add Injection
              </button>

            )}

          </div>

        ) : (

          /* =================================================
             INJECTION CARDS
          ================================================= */

          <div className="reminders-grid">

            {filteredInjections.map(
              (injection) => (

                <div
                  className="reminder-card"
                  key={injection._id}
                >

                  {/* HEADER */}

                  <div className="section-header-row">

                    <h3>
                      💉{" "}
                      {injection.injectionName ||
                        "Injection"}
                    </h3>


                    <span
                      className={
                        getStatusClass(
                          injection
                        )
                      }
                    >
                      {getStatus(
                        injection
                      )}
                    </span>

                  </div>


                  {/* ANIMAL */}

                  <p>

                    <strong>
                      Animal:
                    </strong>{" "}

                    {injection.animalId?.name ||
                      injection.animal?.name ||
                      "Animal not found"}

                  </p>


                  {/* TAG */}

                  <p>

                    <strong>
                      Tag:
                    </strong>{" "}

                    {injection.animalId?.animalTagId ||
                      injection.animal?.animalTagId ||
                      "N/A"}

                  </p>


                  {/* DATE GIVEN */}

                  <p>

                    <strong>
                      Date Given:
                    </strong>{" "}

                    {formatDate(
                      injection.dateGiven ||
                      injection.injectionDate ||
                      injection.date
                    )}

                  </p>


                  {/* NEXT DUE */}

                  <p>

                    <strong>
                      Next Due:
                    </strong>{" "}

                    {formatDate(
                      injection.nextDueDate
                    )}

                  </p>


                  {/* VETERINARIAN */}

                  {injection.veterinarianName && (

                    <p>

                      <strong>
                        Veterinarian:
                      </strong>{" "}

                      {injection.veterinarianName}

                    </p>

                  )}


                  {/* DOSAGE */}

                  {injection.dosage && (

                    <p>

                      <strong>
                        Dosage:
                      </strong>{" "}

                      {injection.dosage}

                    </p>

                  )}


                  {/* NOTES */}

                  {injection.notes && (

                    <p>

                      <strong>
                        Notes:
                      </strong>{" "}

                      {injection.notes}

                    </p>

                  )}


                  {/* ACTIONS */}

                  <div className="section-actions">

                    {/* MARK COMPLETED */}

                    {injection.completed !== true && (

                      <button
                        type="button"
                        className="nav-button"
                        onClick={() =>
                          handleMarkCompleted(
                            injection._id
                          )
                        }
                      >
                        ✅ Mark Completed
                      </button>

                    )}


                    {/* EDIT */}

                    <button
                      type="button"
                      className="nav-button"
                      onClick={() =>
                        openEditForm(
                          injection
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      className="nav-button"
                      onClick={() =>
                        handleDelete(
                          injection._id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="section-header-row">

              <div>

                <h2>

                  {editingInjection
                    ? "✏️ Edit Injection"
                    : "➕ Add Injection"}

                </h2>

                <p>
                  Enter injection details below.
                </p>

              </div>


              <button
                type="button"
                className="nav-button"
                onClick={closeForm}
                disabled={saving}
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              {/* ANIMAL */}

              <div className="form-group">

                <label>
                  Animal *
                </label>

                <select
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleInputChange}
                  required
                >

                  <option value="">
                    Select Animal
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

              </div>


              {/* INJECTION NAME */}

              <div className="form-group">

                <label>
                  Injection Name *
                </label>

                <input
                  type="text"
                  name="injectionName"
                  value={
                    formData.injectionName
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. FMD Vaccine"
                  required
                />

              </div>


              {/* DATE GIVEN */}

              <div className="form-group">

                <label>
                  Date Given *
                </label>

                <input
                  type="date"
                  name="dateGiven"
                  value={
                    formData.dateGiven
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                />

              </div>


              {/* NEXT DUE */}

              <div className="form-group">

                <label>
                  Next Due Date *
                </label>

                <input
                  type="date"
                  name="nextDueDate"
                  value={
                    formData.nextDueDate
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                />

              </div>


              {/* VETERINARIAN */}

              <div className="form-group">

                <label>
                  Veterinarian Name
                </label>

                <input
                  type="text"
                  name="veterinarianName"
                  value={
                    formData.veterinarianName
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Veterinarian name"
                />

              </div>


              {/* DOSAGE */}

              <div className="form-group">

                <label>
                  Dosage
                </label>

                <input
                  type="text"
                  name="dosage"
                  value={
                    formData.dosage
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. 5 ml"
                />

              </div>


              {/* NOTES */}

              <div className="form-group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Additional notes"
                  rows="4"
                />

              </div>


              {/* FORM ACTIONS */}

              <div className="section-actions">

                <button
                  type="button"
                  className="nav-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="nav-button"
                  disabled={saving}
                >

                  {saving
                    ? "⏳ Saving..."
                    : editingInjection
                      ? "💾 Update Injection"
                      : "💾 Save Injection"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Injections;