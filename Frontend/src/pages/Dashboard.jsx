import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "../styles/Dashboard.css";

import { getUserRole } from "../utils/auth";
import NotificationBell from "../components/NotificationBell";


function Dashboard() {

  const navigate = useNavigate();

  // =========================================================
  // USER ROLE
  // =========================================================

  const role = getUserRole();

  const isAdmin = role === "admin";
  const isFarmer = role === "farmer";
  const isVeterinarian = role === "veterinarian";


  // =========================================================
  // PERMISSIONS
  // =========================================================

  const canManageFarms =
    isAdmin || isFarmer;

  const canManageAnimals =
    isAdmin || isFarmer;

  const canManageDiet =
    isAdmin || isFarmer;

  const canManageHealth =
    isAdmin || isVeterinarian;

  const canManageInjections =
    isAdmin ||
    isFarmer ||
    isVeterinarian;

  const canManageReminders =
    isAdmin || isFarmer;

  const canAddReminder =
    isAdmin || isFarmer;

  // NEW: SECURITY AUDIT LOG PERMISSION
  const canViewAuditLogs =
    isAdmin || isVeterinarian;


  // =========================================================
  // DEFAULT STATS
  // =========================================================

  const defaultStats = {
    totalFarms: 0,
    totalAnimals: 0,
    totalDietPlans: 0,
    totalHealthRecords: 0,

    totalInjections: 0,
    upcomingInjections: 0,
    overdueInjections: 0,

    totalReminders: 0,
    pendingReminders: 0,
    completedReminders: 0,
  };


  // =========================================================
  // STATE
  // =========================================================

  const [stats, setStats] =
    useState(defaultStats);

  const [animals, setAnimals] =
    useState([]);

  const [reminders, setReminders] =
    useState([]);

  const [recentInjections, setRecentInjections] =
    useState([]);

  const [upcomingInjections, setUpcomingInjections] =
    useState([]);

  const [overdueInjections, setOverdueInjections] =
    useState([]);

  const [aiAnalyses, setAiAnalyses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [injectionLoading, setInjectionLoading] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    completingReminderId,
    setCompletingReminderId,
  ] = useState(null);


  // =========================================================
  // ROLE LABEL
  // =========================================================

  function getRoleLabel() {

    switch (role) {

      case "admin":
        return "Administrator";

      case "farmer":
        return "Farmer";

      case "veterinarian":
        return "Veterinarian";

      default:
        return "User";
    }
  }


  // =========================================================
  // TODAY
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


  // =========================================================
  // UPCOMING INJECTION
  // TODAY -> NEXT 30 DAYS
  // =========================================================

  function isUpcomingInjection(injection) {

    if (!injection?.nextDueDate) {
      return false;
    }

    const dueDate =
      new Date(
        injection.nextDueDate
      );

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return false;
    }

    dueDate.setHours(
      0,
      0,
      0,
      0
    );

    const today =
      getToday();

    const next30Days =
      new Date(today);

    next30Days.setDate(
      next30Days.getDate() + 30
    );

    return (
      dueDate >= today &&
      dueDate <= next30Days
    );
  }


  // =========================================================
  // OVERDUE INJECTION
  // =========================================================

  function isOverdueInjection(injection) {

    if (!injection?.nextDueDate) {
      return false;
    }

    const dueDate =
      new Date(
        injection.nextDueDate
      );

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return false;
    }

    dueDate.setHours(
      0,
      0,
      0,
      0
    );

    const today =
      getToday();

    return dueDate < today;
  }


  // =========================================================
  // FETCH INJECTIONS
  // =========================================================

  const fetchInjections =
    useCallback(
      async () => {

        if (!canManageInjections) {
          return;
        }

        try {

          setInjectionLoading(true);

          const [
            recentResult,
            upcomingResult,
            overdueResult,
          ] =
            await Promise.allSettled([

              api.get(
                "/dashboard/recent-injections"
              ),

              api.get(
                "/dashboard/upcoming-injections"
              ),

              api.get(
                "/dashboard/overdue-injections"
              ),

            ]);


          // =================================================
          // RECENT
          // =================================================

          if (
            recentResult.status ===
            "fulfilled"
          ) {

            const data =
              recentResult.value.data;

            const injectionData =
              Array.isArray(
                data?.injections
              )
                ? data.injections
                : [];

            setRecentInjections(
              injectionData
            );

          } else {

            console.error(
              "Recent injections error:",
              recentResult.reason?.response?.data ||
              recentResult.reason?.message
            );

            setRecentInjections([]);
          }


          // =================================================
          // UPCOMING
          // =================================================

          if (
            upcomingResult.status ===
            "fulfilled"
          ) {

            const data =
              upcomingResult.value.data;

            const injectionData =
              Array.isArray(
                data?.injections
              )
                ? data.injections
                : [];

            const upcomingOnly =
              injectionData.filter(
                (injection) =>
                  isUpcomingInjection(
                    injection
                  )
              );

            setUpcomingInjections(
              upcomingOnly
            );

          } else {

            console.error(
              "Upcoming injections error:",
              upcomingResult.reason?.response?.data ||
              upcomingResult.reason?.message
            );

            setUpcomingInjections([]);
          }


          // =================================================
          // OVERDUE
          // =================================================

          if (
            overdueResult.status ===
            "fulfilled"
          ) {

            const data =
              overdueResult.value.data;

            const injectionData =
              Array.isArray(
                data?.injections
              )
                ? data.injections
                : [];

            const overdueOnly =
              injectionData.filter(
                (injection) =>
                  isOverdueInjection(
                    injection
                  )
              );

            setOverdueInjections(
              overdueOnly
            );

          } else {

            console.error(
              "Overdue injections error:",
              overdueResult.reason?.response?.data ||
              overdueResult.reason?.message
            );

            setOverdueInjections([]);
          }


          // =================================================
          // AUTH CHECK
          // =================================================

          const unauthorized =
            [
              recentResult,
              upcomingResult,
              overdueResult,
            ].some(
              (result) =>
                result.status ===
                  "rejected" &&
                result.reason?.response?.status ===
                  401
            );


          if (unauthorized) {

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

        } catch (error) {

          console.error(
            "Injection dashboard error:",
            error.response?.data ||
            error.message
          );

        } finally {

          setInjectionLoading(false);
        }

      },
      [
        canManageInjections,
        navigate,
      ]
    );


  // =========================================================
  // FETCH AI HEALTH RISK
  // =========================================================

  const fetchAIAnalyses =
    useCallback(
      async (animalList) => {

        if (
          !Array.isArray(
            animalList
          ) ||
          animalList.length === 0
        ) {

          setAiAnalyses([]);

          return;
        }

        try {

          setAiLoading(true);

          const animalsForAnalysis =
            animalList.slice(0, 6);

          const results =
            await Promise.allSettled(

              animalsForAnalysis.map(
                async (animal) => {

                  if (!animal?._id) {
                    return null;
                  }

                  try {

                    const response =
                      await api.get(
                        `/ai/health-risk/${animal._id}`
                      );

                    if (
                      response.data?.success
                    ) {

                      return response.data.data;

                    }

                    return null;

                  } catch (error) {

                    console.error(
                      `AI analysis failed for animal ${animal._id}:`,
                      error.response?.data ||
                      error.message
                    );

                    return null;
                  }

                }
              )
            );

          const successfulResults =
            results
              .filter(
                (result) =>
                  result.status ===
                    "fulfilled" &&
                  result.value
              )
              .map(
                (result) =>
                  result.value
              );

          setAiAnalyses(
            successfulResults
          );

        } catch (error) {

          console.error(
            "Dashboard AI error:",
            error.response?.data ||
            error.message
          );

          setAiAnalyses([]);

        } finally {

          setAiLoading(false);
        }

      },
      []
    );


  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboardData =
    useCallback(
      async (
        isRefresh = false
      ) => {

        try {

          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const [
            statsResult,
            animalsResult,
            remindersResult,
          ] =
            await Promise.allSettled([

              api.get(
                "/dashboard/stats"
              ),

              api.get(
                "/dashboard/recent-animals"
              ),

              api.get(
                "/dashboard/upcoming-reminders"
              ),

            ]);


          // =================================================
          // STATS
          // =================================================

          let receivedStats = {};

          if (
            statsResult.status ===
            "fulfilled"
          ) {

            receivedStats =
              statsResult.value.data?.stats ||
              {};

          } else {

            console.error(
              "Stats API error:",
              statsResult.reason?.response?.data ||
              statsResult.reason?.message
            );
          }


          // =================================================
          // ANIMALS
          // =================================================

          let validAnimals = [];

          if (
            animalsResult.status ===
            "fulfilled"
          ) {

            const animalData =
              animalsResult.value.data?.animals ||
              [];

            validAnimals =
              Array.isArray(
                animalData
              )
                ? animalData
                : [];

          } else {

            console.error(
              "Animals API error:",
              animalsResult.reason?.response?.data ||
              animalsResult.reason?.message
            );
          }


          // =================================================
          // REMINDERS
          // =================================================

          let validReminders = [];

          if (
            remindersResult.status ===
            "fulfilled"
          ) {

            const reminderData =
              remindersResult.value.data?.reminders ||
              [];

            validReminders =
              Array.isArray(
                reminderData
              )
                ? reminderData
                : [];

          } else {

            console.error(
              "Reminders API error:",
              remindersResult.reason?.response?.data ||
              remindersResult.reason?.message
            );
          }


          setStats({
            ...defaultStats,
            ...receivedStats,
          });

          setAnimals(
            validAnimals
          );

          setReminders(
            validReminders
          );


          await fetchAIAnalyses(
            validAnimals
          );

          await fetchInjections();


          // =================================================
          // AUTH
          // =================================================

          const unauthorized =
            [
              statsResult,
              animalsResult,
              remindersResult,
            ].some(
              (result) =>
                result.status ===
                  "rejected" &&
                result.reason?.response?.status ===
                  401
            );


          if (unauthorized) {

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

        } catch (error) {

          console.error(
            "Dashboard error:",
            error.response?.data ||
            error.message
          );

          if (
            error.response?.status ===
            401
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
            error.response?.status ===
            403
          ) {

            setError(
              "You do not have permission to access this dashboard."
            );

            return;
          }

          setError(
            error.response?.data?.message ||
            "Unable to load dashboard data."
          );

        } finally {

          setLoading(false);
          setRefreshing(false);
        }

      },
      [
        fetchAIAnalyses,
        fetchInjections,
        navigate,
      ]
    );


  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {

    fetchDashboardData();

  }, [
    fetchDashboardData,
  ]);


  // =========================================================
  // COMPLETE REMINDER
  // =========================================================

  async function handleCompleteReminder(
    reminderId
  ) {

    if (!reminderId) {
      return;
    }

    if (completingReminderId) {
      return;
    }

    try {

      setCompletingReminderId(
        reminderId
      );

      setError("");

      await api.patch(
        `/reminders/${reminderId}/complete`
      );

      await fetchDashboardData(
        true
      );

    } catch (error) {

      console.error(
        "Complete reminder error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        "Failed to complete reminder."
      );

    } finally {

      setCompletingReminderId(
        null
      );
    }
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {

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


  // =========================================================
  // NAVIGATION
  // =========================================================

  function goToAnimals() {
    navigate("/animals");
  }

  function goToFarms() {
    navigate("/farms");
  }

  function goToDietPlans() {
    navigate("/diet-plans");
  }

  function goToHealthRecords() {
    navigate("/health");
  }

  function goToReminders() {
    navigate("/reminders");
  }

  function goToAnalytics() {
    navigate("/analytics");
  }

  function goToReports() {
    navigate("/reports");
  }

  // =========================================================
  // SECURITY AUDIT LOGS
  // =========================================================

  function goToAuditLogs() {

    navigate(
      "/security/audit-logs"
    );
  }


  // =========================================================
  // AI HEALTH TREND
  // =========================================================

  function goToHealthTrend(animalId) {

    if (!animalId) {
      return;
    }

    navigate(
      `/ai/health-trend/${animalId}`
    );
  }


  // =========================================================
  // AI HEALTH RISK
  // =========================================================

  function goToHealthRisk(animalId) {

    if (!animalId) {
      return;
    }

    navigate(
      `/ai/health-risk/${animalId}`
    );
  }


  // =========================================================
  // AI RECOMMENDATION
  // =========================================================

  function goToRecommendation(animalId) {

    if (!animalId) {
      return;
    }

    navigate(
      `/ai/recommendation/${animalId}`
    );
  }


  // =========================================================
  // INJECTION NAVIGATION
  // =========================================================

  function goToInjections() {

    navigate(
      "/injections"
    );
  }


  function goToUpcomingInjections() {

    navigate(
      "/injections?filter=upcoming"
    );
  }


  function goToOverdueInjections() {

    navigate(
      "/injections?filter=overdue"
    );
  }


  function goToAddReminder() {
    navigate("/add-reminder");
  }


  function goToAddInjection() {
    navigate("/injections");
  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  function formatDate(date) {

    if (!date) {
      return "N/A";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  // =========================================================
  // REMINDER STATUS
  // =========================================================

  function getReminderStatusClass(
    status
  ) {

    switch (
      status?.toLowerCase()
    ) {

      case "completed":
        return "status-completed";

      case "pending":
        return "status-pending";

      case "overdue":
        return "status-overdue";

      default:
        return "status-default";
    }
  }


  // =========================================================
  // INJECTION DATE
  // =========================================================

  function getInjectionDate(
    injection
  ) {

    return (
      injection?.dateGiven ||
      injection?.injectionDate ||
      injection?.date ||
      injection?.createdAt
    );
  }


  // =========================================================
  // RISK CLASS
  // =========================================================

  function getRiskClass(
    riskLevel
  ) {

    switch (
      riskLevel?.toUpperCase()
    ) {

      case "HIGH":
        return "ai-risk-high";

      case "MEDIUM":
        return "ai-risk-medium";

      case "LOW":
        return "ai-risk-low";

      default:
        return "ai-risk-default";
    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <div className="loading-card">

          <div className="loading-icon">
            🐄
          </div>

          <h2>
            Loading DairyCare AI
          </h2>

          <p>
            Fetching your farm
            information...
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // MAIN
  // =========================================================

  return (

    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div className="brand-section">

          <h1>
            🐄 DairyCare AI
          </h1>

          <p>
            Smart Dairy Farm Management
          </p>

          <span className="role-badge">

            Logged in as{" "}

            <strong>
              {getRoleLabel()}
            </strong>

          </span>

        </div>


        <nav className="header-buttons">

          {canManageAnimals && (

            <button
              type="button"
              className="nav-button"
              onClick={goToAnimals}
            >
              🐄 Animals
            </button>

          )}


          {canManageFarms && (

            <button
              type="button"
              className="nav-button"
              onClick={goToFarms}
            >
              🌾 Farms
            </button>

          )}


          {canManageDiet && (

            <button
              type="button"
              className="nav-button"
              onClick={goToDietPlans}
            >
              🥗 Diet Plans
            </button>

          )}


          {canManageHealth && (

            <button
              type="button"
              className="nav-button"
              onClick={goToHealthRecords}
            >
              ❤️ Health
            </button>

          )}


          {canManageInjections && (

            <button
              type="button"
              className="nav-button"
              onClick={goToInjections}
            >
              💉 Injections
            </button>

          )}


          <button
            type="button"
            className="nav-button"
            onClick={goToReminders}
          >
            🔔 Reminders
          </button>


          <button
            type="button"
            className="nav-button"
            onClick={goToAnalytics}
          >
            📊 Analytics
          </button>


          <button
            type="button"
            className="nav-button"
            onClick={goToReports}
          >
            📄 Reports
          </button>


          {/* =================================================
              SECURITY AUDIT LOGS
          ================================================= */}

          {canViewAuditLogs && (

            <button
              type="button"
              className="nav-button"
              onClick={goToAuditLogs}
            >
              🔐 Security Logs
            </button>

          )}


          <NotificationBell />


          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </nav>

      </header>


      <main className="dashboard-main">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="dashboard-actions">

          <div>

            <h2>
              📊 Farm Overview
            </h2>

            <p>
              Monitor your dairy farm
              activities from one place.
            </p>

          </div>


          <button
            type="button"
            className="nav-button"
            onClick={() =>
              fetchDashboardData(true)
            }
            disabled={refreshing}
          >

            {refreshing
              ? "⏳ Refreshing..."
              : "🔄 Refresh"}

          </button>

        </section>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="page-error">

            <div>

              <strong>
                ⚠️ Something went wrong
              </strong>

              <p>
                {error}
              </p>

            </div>


            <button
              type="button"
              className="nav-button"
              onClick={() =>
                fetchDashboardData(true)
              }
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="stats-grid">

          {canManageFarms && (

            <div
              className="stat-card clickable-card"
              onClick={goToFarms}
            >

              <div className="stat-icon">
                🌾
              </div>

              <div>

                <h3>
                  Total Farms
                </h3>

                <p>
                  {stats.totalFarms}
                </p>

                <small>
                  Manage farms →
                </small>

              </div>

            </div>

          )}


          <div
            className="stat-card clickable-card"
            onClick={goToAnimals}
          >

            <div className="stat-icon">
              🐄
            </div>

            <div>

              <h3>
                Total Animals
              </h3>

              <p>
                {stats.totalAnimals}
              </p>

              <small>
                View animals →
              </small>

            </div>

          </div>


          {canManageDiet && (

            <div
              className="stat-card clickable-card"
              onClick={goToDietPlans}
            >

              <div className="stat-icon">
                🥗
              </div>

              <div>

                <h3>
                  Diet Plans
                </h3>

                <p>
                  {stats.totalDietPlans}
                </p>

                <small>
                  Manage diet →
                </small>

              </div>

            </div>

          )}


          {canManageHealth && (

            <div
              className="stat-card clickable-card"
              onClick={goToHealthRecords}
            >

              <div className="stat-icon">
                ❤️
              </div>

              <div>

                <h3>
                  Health Records
                </h3>

                <p>
                  {stats.totalHealthRecords}
                </p>

                <small>
                  View health →
                </small>

              </div>

            </div>

          )}


          {canManageInjections && (

            <div
              className="stat-card clickable-card"
              onClick={goToInjections}
            >

              <div className="stat-icon">
                💉
              </div>

              <div>

                <h3>
                  Total Injections
                </h3>

                <p>
                  {stats.totalInjections}
                </p>

                <small>
                  View injection history →
                </small>

              </div>

            </div>

          )}


          {canManageInjections && (

            <div
              className="stat-card clickable-card"
              onClick={goToUpcomingInjections}
            >

              <div className="stat-icon">
                📅
              </div>

              <div>

                <h3>
                  Upcoming Injections
                </h3>

                <p>
                  {upcomingInjections.length}
                </p>

                <small>
                  View upcoming injections →
                </small>

              </div>

            </div>

          )}


          {canManageInjections && (

            <div
              className="stat-card clickable-card"
              onClick={goToOverdueInjections}
            >

              <div className="stat-icon">
                ⚠️
              </div>

              <div>

                <h3>
                  Overdue Injections
                </h3>

                <p>
                  {overdueInjections.length}
                </p>

                <small>
                  View overdue injections →
                </small>

              </div>

            </div>

          )}


          <div
            className="stat-card clickable-card"
            onClick={goToReminders}
          >

            <div className="stat-icon">
              🔔
            </div>

            <div>

              <h3>
                Pending Reminders
              </h3>

              <p>
                {stats.pendingReminders}
              </p>

              <small>
                Manage reminders →
              </small>

            </div>

          </div>


          <div
            className="stat-card clickable-card"
            onClick={goToReminders}
          >

            <div className="stat-icon">
              ✅
            </div>

            <div>

              <h3>
                Completed
              </h3>

              <p>
                {stats.completedReminders}
              </p>

              <small>
                View reminders →
              </small>

            </div>

          </div>

        </section>


        {/* ===================================================
            RECENT ANIMALS
        =================================================== */}

        <section className="dashboard-section">

          <div className="section-header-row">

            <div>

              <h2 className="section-title">
                🐄 Recent Animals
              </h2>

              <p>
                Recently added animals
                in your farms.
              </p>

            </div>


            <button
              type="button"
              className="nav-button"
              onClick={goToAnimals}
            >
              View All →
            </button>

          </div>


          {animals.length === 0 ? (

            <div className="empty-message">

              <div className="empty-icon">
                🐄
              </div>

              <h3>
                No animals found
              </h3>

              <p>
                Add an animal to see
                it on your dashboard.
              </p>

            </div>

          ) : (

            <div className="animals-grid">

              {animals.map(
                (animal) => (

                  <div
                    className="animal-card"
                    key={animal._id}
                  >

                    <h3>
                      🐄{" "}
                      {animal.name ||
                        "Unnamed Animal"}
                    </h3>

                    <p>
                      <strong>
                        Tag:
                      </strong>{" "}
                      {animal.animalTagId ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>
                        Breed:
                      </strong>{" "}
                      {animal.breed ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>
                        Gender:
                      </strong>{" "}
                      {animal.gender ||
                        "N/A"}
                    </p>

                    {animal.milkProduction !==
                      undefined && (

                      <p>
                        <strong>
                          Milk:
                        </strong>{" "}
                        {animal.milkProduction} L
                      </p>

                    )}


                    {/* =================================================
                        AI HEALTH FEATURES
                    ================================================= */}

                    <div
                      className="section-actions"
                      style={{
                        marginTop: "15px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >

                      <button
                        type="button"
                        className="nav-button"
                        onClick={() =>
                          goToRecommendation(
                            animal._id
                          )
                        }
                      >
                        🤖 AI Recommendation
                      </button>


                      <button
                        type="button"
                        className="nav-button"
                        onClick={() =>
                          goToHealthRisk(
                            animal._id
                          )
                        }
                      >
                        ⚕️ AI Health Risk
                      </button>


                      <button
                        type="button"
                        className="nav-button"
                        onClick={() =>
                          goToHealthTrend(
                            animal._id
                          )
                        }
                      >
                        📈 AI Health Trend
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ===================================================
            INJECTION MANAGEMENT
        =================================================== */}

        {canManageInjections && (

          <section className="dashboard-section">

            <div className="section-header-row">

              <div>

                <h2 className="section-title">
                  💉 Injection Management
                </h2>

                <p>
                  Monitor vaccination and
                  injection records.
                </p>

              </div>


              <div className="section-actions">

                <button
                  type="button"
                  className="nav-button"
                  onClick={goToInjections}
                >
                  View Injection History →
                </button>


                <button
                  type="button"
                  className="nav-button"
                  onClick={goToAddInjection}
                >
                  ➕ Manage Injections
                </button>

              </div>

            </div>


            {injectionLoading ? (

              <div className="empty-message">

                <div className="empty-icon">
                  💉
                </div>

                <h3>
                  Loading injections...
                </h3>

                <p>
                  Fetching injection records.
                </p>

              </div>

            ) : (

              <>

                {/* UPCOMING */}

                <div className="section-header-row">

                  <div>

                    <h3 className="section-title">
                      📅 Upcoming Injections
                    </h3>

                    <p>
                      Injections due today or
                      within the next 30 days.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="nav-button"
                    onClick={
                      goToUpcomingInjections
                    }
                  >
                    View Upcoming →
                  </button>

                </div>


                {upcomingInjections.length === 0 ? (

                  <div className="empty-message">

                    <div className="empty-icon">
                      📅
                    </div>

                    <h3>
                      No upcoming injections
                    </h3>

                    <p>
                      There are no injections
                      due within the next 30 days.
                    </p>

                  </div>

                ) : (

                  <div className="reminders-grid">

                    {upcomingInjections
                      .slice(0, 6)
                      .map(
                        (injection) => (

                          <div
                            className="reminder-card clickable-card"
                            key={
                              injection._id
                            }
                            onClick={
                              goToUpcomingInjections
                            }
                          >

                            <h3>
                              💉{" "}
                              {injection.injectionName ||
                                "Injection"}
                            </h3>


                            <p>
                              <strong>
                                Animal:
                              </strong>{" "}

                              {injection.animalId?.name ||
                                "Animal"}
                            </p>


                            <p>
                              <strong>
                                Tag:
                              </strong>{" "}

                              {injection.animalId
                                ?.animalTagId ||
                                "N/A"}
                            </p>


                            <p>
                              <strong>
                                Date Given:
                              </strong>{" "}

                              {formatDate(
                                getInjectionDate(
                                  injection
                                )
                              )}
                            </p>


                            <p>
                              <strong>
                                Next Due:
                              </strong>{" "}

                              {formatDate(
                                injection.nextDueDate
                              )}
                            </p>


                            <p>
                              <strong>
                                Status:
                              </strong>{" "}

                              <span className="status-pending">
                                Upcoming
                              </span>
                            </p>


                            {injection.veterinarianName && (

                              <p>
                                <strong>
                                  Veterinarian:
                                </strong>{" "}

                                {
                                  injection.veterinarianName
                                }
                              </p>

                            )}

                          </div>

                        )
                      )}

                  </div>

                )}


                {/* OVERDUE */}

                <div
                  className="section-header-row"
                  style={{
                    marginTop: "30px",
                  }}
                >

                  <div>

                    <h3 className="section-title">
                      ⚠️ Overdue Injections
                    </h3>

                    <p>
                      Injections whose due date
                      has already passed.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="nav-button"
                    onClick={
                      goToOverdueInjections
                    }
                  >
                    View Overdue →
                  </button>

                </div>


                {overdueInjections.length === 0 ? (

                  <div className="empty-message">

                    <div className="empty-icon">
                      ✅
                    </div>

                    <h3>
                      No overdue injections
                    </h3>

                    <p>
                      Great! All injection
                      schedules are up to date.
                    </p>

                  </div>

                ) : (

                  <div className="reminders-grid">

                    {overdueInjections
                      .slice(0, 6)
                      .map(
                        (injection) => (

                          <div
                            className="reminder-card clickable-card"
                            key={
                              injection._id
                            }
                            onClick={
                              goToOverdueInjections
                            }
                          >

                            <h3>
                              💉{" "}
                              {injection.injectionName ||
                                "Injection"}
                            </h3>


                            <p>
                              <strong>
                                Animal:
                              </strong>{" "}

                              {injection.animalId?.name ||
                                "Animal"}
                            </p>


                            <p>
                              <strong>
                                Tag:
                              </strong>{" "}

                              {injection.animalId
                                ?.animalTagId ||
                                "N/A"}
                            </p>


                            <p>
                              <strong>
                                Date Given:
                              </strong>{" "}

                              {formatDate(
                                getInjectionDate(
                                  injection
                                )
                              )}
                            </p>


                            <p>
                              <strong>
                                Due Date:
                              </strong>{" "}

                              {formatDate(
                                injection.nextDueDate
                              )}
                            </p>


                            <p>
                              <strong>
                                Status:
                              </strong>{" "}

                              <span className="status-overdue">
                                ⚠️ Overdue
                              </span>

                            </p>


                            {injection.veterinarianName && (

                              <p>
                                <strong>
                                  Veterinarian:
                                </strong>{" "}

                                {
                                  injection.veterinarianName
                                }
                              </p>

                            )}


                            {injection.notes && (

                              <p>
                                <strong>
                                  Notes:
                                </strong>{" "}

                                {injection.notes}
                              </p>

                            )}

                          </div>

                        )
                      )}

                  </div>

                )}


                {/* RECENT */}

                <div
                  className="section-header-row"
                  style={{
                    marginTop: "30px",
                  }}
                >

                  <div>

                    <h3 className="section-title">
                      🕒 Recent Injections
                    </h3>

                    <p>
                      Recently recorded injection
                      history.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="nav-button"
                    onClick={goToInjections}
                  >
                    View History →
                  </button>

                </div>


                {recentInjections.length === 0 ? (

                  <div className="empty-message">

                    <div className="empty-icon">
                      💉
                    </div>

                    <h3>
                      No recent injections
                    </h3>

                    <p>
                      No injection history is
                      available.
                    </p>

                  </div>

                ) : (

                  <div className="reminders-grid">

                    {recentInjections
                      .slice(0, 6)
                      .map(
                        (injection) => (

                          <div
                            className="reminder-card"
                            key={
                              injection._id
                            }
                          >

                            <h3>
                              💉{" "}
                              {injection.injectionName ||
                                "Injection"}
                            </h3>


                            <p>
                              <strong>
                                Animal:
                              </strong>{" "}

                              {injection.animalId?.name ||
                                "Animal"}
                            </p>


                            <p>
                              <strong>
                                Tag:
                              </strong>{" "}

                              {injection.animalId
                                ?.animalTagId ||
                                "N/A"}
                            </p>


                            <p>
                              <strong>
                                Date Given:
                              </strong>{" "}

                              {formatDate(
                                getInjectionDate(
                                  injection
                                )
                              )}
                            </p>


                            <p>
                              <strong>
                                Next Due:
                              </strong>{" "}

                              {formatDate(
                                injection.nextDueDate
                              )}
                            </p>

                          </div>

                        )
                      )}

                  </div>

                )}

              </>

            )}

          </section>

        )}


        {/* ===================================================
            AI HEALTH
        =================================================== */}

        <section className="dashboard-section">

          <div className="section-header-row">

            <div>

              <h2 className="section-title">
                🤖 AI Health Insights
              </h2>

              <p>
                AI-powered health risk
                screening for your animals.
              </p>

            </div>


            <button
              type="button"
              className="nav-button"
              onClick={() =>
                fetchDashboardData(true)
              }
              disabled={
                refreshing ||
                aiLoading
              }
            >

              {aiLoading
                ? "🤖 Analyzing..."
                : "🔄 Refresh Analysis"}

            </button>

          </div>


          {aiLoading ? (

            <div className="empty-message">

              <div className="empty-icon">
                🤖
              </div>

              <h3>
                Analyzing animal health...
              </h3>

              <p>
                DairyCare AI is reviewing
                available health data.
              </p>

            </div>

          ) : aiAnalyses.length === 0 ? (

            <div className="empty-message">

              <div className="empty-icon">
                🤖
              </div>

              <h3>
                No AI health analysis available
              </h3>

              <p>
                Add health records or other
                animal data to generate
                AI health insights.
              </p>

            </div>

          ) : (

            <div className="ai-dashboard-grid">

              {aiAnalyses.map(
                (aiResult) => {

                  const analysis =
                    aiResult?.analysis ||
                    {};

                  const riskLevel =
                    analysis.riskLevel ||
                    "UNKNOWN";

                  const riskScore =
                    analysis.riskScore ??
                    0;

                  const riskFactors =
                    Array.isArray(
                      analysis.riskFactors
                    )
                      ? analysis.riskFactors
                      : [];

                  const recommendations =
                    Array.isArray(
                      analysis.recommendations
                    )
                      ? analysis.recommendations
                      : [];

                  const animalId =
                    aiResult?.animal?.id ||
                    aiResult?.animal?._id ||
                    "unknown";


                  return (

                    <div
                      className="ai-dashboard-card"
                      key={animalId}
                    >

                      <div
                        className="ai-dashboard-header"
                      >

                        <div>

                          <h3>
                            🐄{" "}
                            {aiResult?.animal?.name ||
                              "Unnamed Animal"}
                          </h3>

                          <p>
                            Tag:{" "}
                            {aiResult?.animal?.tagId ||
                              aiResult?.animal?.animalTagId ||
                              "N/A"}
                          </p>

                        </div>


                        <span
                          className={`ai-risk-badge ${getRiskClass(
                            riskLevel
                          )}`}
                        >
                          {riskLevel}
                        </span>

                      </div>


                      <div
                        className="ai-score-box"
                      >

                        <span>
                          Risk Score
                        </span>

                        <strong>
                          {riskScore}
                        </strong>

                      </div>


                      <div
                        className="ai-dashboard-section"
                      >

                        <h4>
                          ⚠️ Risk Factors
                        </h4>


                        {riskFactors.length > 0 ? (

                          <ul>

                            {riskFactors.map(
                              (
                                factor,
                                index
                              ) => (

                                <li
                                  key={index}
                                >
                                  {factor}
                                </li>

                              )
                            )}

                          </ul>

                        ) : (

                          <p>
                            ✅ No significant
                            risk factors detected.
                          </p>

                        )}

                      </div>


                      <div
                        className="ai-dashboard-section"
                      >

                        <h4>
                          💡 AI Recommendations
                        </h4>


                        {recommendations.length > 0 ? (

                          <ul>

                            {recommendations.map(
                              (
                                recommendation,
                                index
                              ) => (

                                <li
                                  key={index}
                                >
                                  {recommendation}
                                </li>

                              )
                            )}

                          </ul>

                        ) : (

                          <p>
                            No additional
                            recommendations.
                          </p>

                        )}

                      </div>


                      <div
                        className="ai-dashboard-data"
                      >

                        <h4>
                          📊 Data Used
                        </h4>

                        <p>
                          Health Records:{" "}
                          <strong>
                            {aiResult?.dataSummary
                              ?.healthRecords ??
                              0}
                          </strong>
                        </p>

                        <p>
                          Injections:{" "}
                          <strong>
                            {aiResult?.dataSummary
                              ?.injections ??
                              0}
                          </strong>
                        </p>

                        <p>
                          Reminders:{" "}
                          <strong>
                            {aiResult?.dataSummary
                              ?.reminders ??
                              0}
                          </strong>
                        </p>

                      </div>


                      <div
                        className="section-actions"
                        style={{
                          marginTop: "15px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >

                        {animalId !== "unknown" && (

                          <>

                            <button
                              type="button"
                              className="nav-button"
                              onClick={() =>
                                goToHealthRisk(
                                  animalId
                                )
                              }
                            >
                              ⚕️ View Health Risk
                            </button>


                            <button
                              type="button"
                              className="nav-button"
                              onClick={() =>
                                goToHealthTrend(
                                  animalId
                                )
                              }
                            >
                              📈 View Health Trend
                            </button>


                            <button
                              type="button"
                              className="nav-button"
                              onClick={() =>
                                goToRecommendation(
                                  animalId
                                )
                              }
                            >
                              🤖 AI Recommendation
                            </button>

                          </>

                        )}

                      </div>


                      <p
                        className="ai-disclaimer"
                      >
                        ℹ️ AI-assisted screening
                        based on available farm
                        data. It is not a veterinary
                        diagnosis.
                      </p>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ===================================================
            REMINDERS
        =================================================== */}

        <section className="dashboard-section">

          <div className="section-header-row">

            <div>

              <h2 className="section-title">
                🔔 Upcoming Reminders
              </h2>

              <p>
                Important activities
                that need attention.
              </p>

            </div>


            <div className="section-actions">

              {canAddReminder && (

                <button
                  type="button"
                  className="nav-button"
                  onClick={goToAddReminder}
                >
                  ➕ Add Reminder
                </button>

              )}


              <button
                type="button"
                className="nav-button"
                onClick={goToReminders}
              >
                View All →
              </button>

            </div>

          </div>


          {reminders.length === 0 ? (

            <div className="empty-message">

              <div className="empty-icon">
                🔔
              </div>

              <h3>
                No upcoming reminders
              </h3>

              <p>
                {canAddReminder
                  ? "Create a reminder for an animal."
                  : "There are currently no upcoming reminders."}
              </p>


              {canAddReminder && (

                <button
                  type="button"
                  className="nav-button"
                  onClick={goToAddReminder}
                >
                  ➕ Create Reminder
                </button>

              )}

            </div>

          ) : (

            <div className="reminders-grid">

              {reminders.map(
                (reminder) => {

                  const isCompleting =
                    completingReminderId ===
                    reminder._id;


                  return (

                    <div
                      className="reminder-card"
                      key={
                        reminder._id
                      }
                    >

                      <h3>
                        🔔{" "}
                        {reminder.title ||
                          "Untitled Reminder"}
                      </h3>


                      <p>
                        <strong>
                          Type:
                        </strong>{" "}

                        {reminder.reminderType ||
                          "N/A"}
                      </p>


                      <p>
                        <strong>
                          Animal:
                        </strong>{" "}

                        {reminder.animalId?.name ||
                          reminder.animal?.name ||
                          "Animal not found"}
                      </p>


                      <p>
                        <strong>
                          Due:
                        </strong>{" "}

                        {formatDate(
                          reminder.dueDate
                        )}
                      </p>


                      <p>
                        <strong>
                          Status:
                        </strong>{" "}

                        <span
                          className={
                            getReminderStatusClass(
                              reminder.status
                            )
                          }
                        >
                          {reminder.status ||
                            "pending"}
                        </span>

                      </p>


                      {reminder.status?.toLowerCase() !==
                        "completed" && (

                        <button
                          type="button"
                          className="complete-button"
                          onClick={() =>
                            handleCompleteReminder(
                              reminder._id
                            )
                          }
                          disabled={
                            isCompleting
                          }
                        >

                          {isCompleting
                            ? "⏳ Completing..."
                            : "✅ Mark Completed"}

                        </button>
                      )}


                      <button
                        type="button"
                        className="nav-button"
                        onClick={goToReminders}
                      >
                        🔔 Manage Reminder
                      </button>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* ===================================================
            QUICK MANAGEMENT
        =================================================== */}

        <section className="dashboard-section">

          <h2 className="section-title">
            ⚡ Quick Management
          </h2>


          <div className="quick-actions">

            {canManageFarms && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToFarms}
              >

                <span>
                  🌾
                </span>

                <div>

                  <h3>
                    Manage Farms
                  </h3>

                  <p>
                    Add and manage farms
                  </p>

                </div>

              </button>
            )}


            {canManageAnimals && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToAnimals}
              >

                <span>
                  🐄
                </span>

                <div>

                  <h3>
                    Manage Animals
                  </h3>

                  <p>
                    View and manage animals
                  </p>

                </div>

              </button>
            )}


            {canManageDiet && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToDietPlans}
              >

                <span>
                  🥗
                </span>

                <div>

                  <h3>
                    Diet Management
                  </h3>

                  <p>
                    Manage animal diet plans
                  </p>

                </div>

              </button>
            )}


            {canManageHealth && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToHealthRecords}
              >

                <span>
                  ❤️
                </span>

                <div>

                  <h3>
                    Health Records
                  </h3>

                  <p>
                    Monitor animal health
                  </p>

                </div>

              </button>
            )}


            {canManageInjections && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToInjections}
              >

                <span>
                  💉
                </span>

                <div>

                  <h3>
                    Injection Management
                  </h3>

                  <p>
                    Track vaccination and
                    injection records
                  </p>

                </div>

              </button>
            )}


            <button
              type="button"
              className="quick-action-card"
              onClick={goToReminders}
            >

              <span>
                🔔
              </span>

              <div>

                <h3>
                  Reminder Management
                </h3>

                <p>
                  Track important reminders
                </p>

              </div>

            </button>


            {/* =================================================
                AI HEALTH TREND QUICK ACTION
            ================================================= */}

            {animals.length > 0 && (

              <button
                type="button"
                className="quick-action-card"
                onClick={() =>
                  goToHealthTrend(
                    animals[0]?._id
                  )
                }
              >

                <span>
                  📈
                </span>

                <div>

                  <h3>
                    AI Health Trend
                  </h3>

                  <p>
                    Analyze historical animal
                    health trends
                  </p>

                </div>

              </button>
            )}


            {/* =================================================
                SECURITY AUDIT LOGS QUICK ACTION
            ================================================= */}

            {canViewAuditLogs && (

              <button
                type="button"
                className="quick-action-card"
                onClick={goToAuditLogs}
              >

                <span>
                  🔐
                </span>

                <div>

                  <h3>
                    Security Audit Logs
                  </h3>

                  <p>
                    Monitor system security
                    activity
                  </p>

                </div>

              </button>
            )}

          </div>

        </section>


        {/* ===================================================
            ACCESS LEVEL
        =================================================== */}

        <section className="role-info-card">

          <h2>
            🔐 Access Level
          </h2>

          <p>

            Logged in as{" "}

            <strong>
              {getRoleLabel()}
            </strong>

          </p>


          <ul>

            {isAdmin && (
              <>

                <li>
                  ✅ Full system access
                </li>

                <li>
                  ✅ Manage farms
                </li>

                <li>
                  ✅ Manage animals
                </li>

                <li>
                  ✅ Manage diet plans
                </li>

                <li>
                  ✅ Manage health records
                </li>

                <li>
                  ✅ Manage injections
                </li>

                <li>
                  ✅ Manage reminders
                </li>

                <li>
                  🤖 Access AI health analysis
                </li>

                <li>
                  🔐 Access security audit logs
                </li>

              </>
            )}


            {isFarmer && (
              <>

                <li>
                  ✅ Manage farms
                </li>

                <li>
                  ✅ Manage animals
                </li>

                <li>
                  ✅ Manage diet plans
                </li>

                <li>
                  ✅ Manage injections
                </li>

                <li>
                  ✅ Manage reminders
                </li>

                <li>
                  👁️ Health records are
                  veterinarian-managed
                </li>

                <li>
                  🤖 Access AI health analysis
                </li>

              </>
            )}


            {isVeterinarian && (
              <>

                <li>
                  👁️ View animals
                </li>

                <li>
                  ✅ Manage health records
                </li>

                <li>
                  ✅ Manage injections
                </li>

                <li>
                  👁️ View reminders
                </li>

                <li>
                  🤖 Access AI health analysis
                </li>

                <li>
                  🔐 Access security audit logs
                </li>

                <li>
                  ℹ️ Farm management is restricted
                </li>

              </>
            )}

          </ul>

        </section>

      </main>

    </div>
  );
}


export default Dashboard;