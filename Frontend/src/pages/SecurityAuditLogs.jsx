import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./SecurityAuditLogs.css";


function SecurityAuditLogs() {

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // FILTER STATE
  // =========================================================

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("ALL");

  const [moduleFilter, setModuleFilter] =
    useState("ALL");

  const [roleFilter, setRoleFilter] =
    useState("ALL");


  // =========================================================
  // FETCH AUDIT LOGS
  // =========================================================

  useEffect(() => {

    fetchAuditLogs();

  }, []);


  async function fetchAuditLogs() {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get(
          "/audit-logs"
        );


      const auditLogs =
        Array.isArray(
          response.data?.logs
        )
          ? response.data.logs
          : [];


      setLogs(
        auditLogs
      );

    } catch (err) {

      console.error(
        "Failed to fetch audit logs:",
        err
      );


      // =====================================================
      // UNAUTHORIZED
      // =====================================================

      if (
        err.response?.status ===
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


      // =====================================================
      // FORBIDDEN
      // =====================================================

      if (
        err.response?.status ===
        403
      ) {

        setError(
          "You do not have permission to access security audit logs."
        );

        return;
      }


      // =====================================================
      // OTHER ERROR
      // =====================================================

      setError(
        err.response?.data?.message ||
        "Failed to load security audit logs."
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================================
  // ACTION OPTIONS
  // =========================================================

  const actions = useMemo(() => {

    const values =
      logs
        .map(
          (log) =>
            log.action
        )
        .filter(Boolean);


    return [
      "ALL",
      ...new Set(values),
    ];

  }, [logs]);


  // =========================================================
  // MODULE OPTIONS
  // =========================================================

  const modules = useMemo(() => {

    const values =
      logs
        .map(
          (log) =>
            log.module
        )
        .filter(Boolean);


    return [
      "ALL",
      ...new Set(values),
    ];

  }, [logs]);


  // =========================================================
  // ROLE OPTIONS
  // =========================================================

  const roles = useMemo(() => {

    const values =
      logs
        .map(
          (log) =>
            log.userId?.role
        )
        .filter(Boolean);


    return [
      "ALL",
      ...new Set(values),
    ];

  }, [logs]);


  // =========================================================
  // FILTERED LOGS
  // =========================================================

  const filteredLogs = useMemo(() => {

    const searchValue =
      search
        .toLowerCase()
        .trim();


    return logs.filter(
      (log) => {

        const userName =
          log.userId?.name ||
          "System";


        const email =
          log.userId?.email ||
          "";


        const role =
          log.userId?.role ||
          "System";


        const searchableText = `
          ${userName}
          ${email}
          ${role}
          ${log.action || ""}
          ${log.module || ""}
          ${log.description || ""}
          ${log.ipAddress || ""}
        `.toLowerCase();


        const matchesSearch =
          !searchValue ||
          searchableText.includes(
            searchValue
          );


        const matchesAction =
          actionFilter === "ALL" ||
          log.action ===
            actionFilter;


        const matchesModule =
          moduleFilter === "ALL" ||
          log.module ===
            moduleFilter;


        const matchesRole =
          roleFilter === "ALL" ||
          role === roleFilter;


        return (
          matchesSearch &&
          matchesAction &&
          matchesModule &&
          matchesRole
        );

      }
    );

  }, [
    logs,
    search,
    actionFilter,
    moduleFilter,
    roleFilter,
  ]);


  // =========================================================
  // FORMAT DATE
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


    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  }


  // =========================================================
  // ACTION CLASS
  // =========================================================

  function getActionClass(action) {

    if (!action) {
      return "action-default";
    }


    switch (
      action.toUpperCase()
    ) {

      case "LOGIN":
        return "action-login";


      case "FAILED_LOGIN":
        return "action-failed";


      case "CREATE":
        return "action-create";


      case "UPDATE":
        return "action-update";


      case "DELETE":
        return "action-delete";


      case "VIEW":
        return "action-view";


      case "LOGOUT":
        return "action-logout";


      default:
        return "action-default";
    }

  }


  // =========================================================
  // MODULE CLASS
  // =========================================================

  function getModuleClass(module) {

    if (!module) {
      return "module-default";
    }


    return `module-${module
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  function clearFilters() {

    setSearch("");

    setActionFilter(
      "ALL"
    );

    setModuleFilter(
      "ALL"
    );

    setRoleFilter(
      "ALL"
    );

  }


  // =========================================================
  // FAILED LOGINS
  // =========================================================

  const failedLoginCount =
    logs.filter(
      (log) =>
        log.action ===
        "FAILED_LOGIN"
    ).length;


  // =========================================================
  // SECURITY EVENTS
  // =========================================================

  const securityEventCount =
    logs.filter(
      (log) =>
        log.action ===
          "FAILED_LOGIN" ||
        log.action ===
          "DELETE" ||
        log.action ===
          "UPDATE"
    ).length;


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="security-audit-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="security-header">

        <div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/")
            }
          >
            ← Back to Dashboard
          </button>


          <div className="security-title-row">

            <div className="security-icon">
              🛡️
            </div>


            <div>

              <h1>
                Security Audit Logs
              </h1>


              <p>
                Monitor and review
                security-sensitive
                activities across
                DairyCare AI.
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          className="refresh-button"
          onClick={
            fetchAuditLogs
          }
          disabled={loading}
        >

          {loading
            ? "⏳ Loading..."
            : "↻ Refresh"}

        </button>

      </header>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="audit-summary">


        {/* TOTAL LOGS */}

        <div className="audit-summary-card">

          <div className="summary-icon">
            📋
          </div>


          <div>

            <span>
              Total Logs
            </span>

            <strong>
              {logs.length}
            </strong>

          </div>

        </div>


        {/* FILTERED LOGS */}

        <div className="audit-summary-card">

          <div className="summary-icon">
            🔎
          </div>


          <div>

            <span>
              Filtered Logs
            </span>

            <strong>
              {filteredLogs.length}
            </strong>

          </div>

        </div>


        {/* FAILED LOGINS */}

        <div className="audit-summary-card">

          <div className="summary-icon">
            ⚠️
          </div>


          <div>

            <span>
              Failed Logins
            </span>

            <strong>
              {failedLoginCount}
            </strong>

          </div>

        </div>


        {/* SECURITY EVENTS */}

        <div className="audit-summary-card">

          <div className="summary-icon">
            🔐
          </div>


          <div>

            <span>
              Security Events
            </span>

            <strong>
              {securityEventCount}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="audit-filters">


        {/* SEARCH */}

        <div className="search-container">

          <span>
            🔍
          </span>


          <input
            type="text"
            placeholder="Search user, action, module, IP..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {/* ACTION */}

        <select
          value={actionFilter}
          onChange={(e) =>
            setActionFilter(
              e.target.value
            )
          }
        >

          {actions.map(
            (action) => (

              <option
                key={action}
                value={action}
              >

                {action ===
                "ALL"
                  ? "All Actions"
                  : action}

              </option>

            )
          )}

        </select>


        {/* MODULE */}

        <select
          value={moduleFilter}
          onChange={(e) =>
            setModuleFilter(
              e.target.value
            )
          }
        >

          {modules.map(
            (module) => (

              <option
                key={module}
                value={module}
              >

                {module ===
                "ALL"
                  ? "All Modules"
                  : module}

              </option>

            )
          )}

        </select>


        {/* ROLE */}

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(
              e.target.value
            )
          }
        >

          {roles.map(
            (role) => (

              <option
                key={role}
                value={role}
              >

                {role ===
                "ALL"
                  ? "All Roles"
                  : role}

              </option>

            )
          )}

        </select>


        {/* CLEAR */}

        <button
          type="button"
          className="clear-filter-button"
          onClick={
            clearFilters
          }
        >
          Clear
        </button>

      </section>


      {/* =====================================================
          ACTIVE FILTER INFORMATION
      ===================================================== */}

      {(search ||
        actionFilter !== "ALL" ||
        moduleFilter !== "ALL" ||
        roleFilter !== "ALL") && (

        <div className="active-filter-info">

          <span>
            Showing{" "}
            <strong>
              {filteredLogs.length}
            </strong>{" "}
            of{" "}
            <strong>
              {logs.length}
            </strong>{" "}
            logs
          </span>


          <button
            type="button"
            onClick={
              clearFilters
            }
          >
            Reset filters
          </button>

        </div>

      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="audit-table-section">


        {/* LOADING */}

        {loading ? (

          <div className="audit-state">

            <div className="loading-spinner"></div>

            <p>
              Loading security audit logs...
            </p>

          </div>


        ) : error ? (

          /* ERROR */

          <div className="audit-state error-state">

            <div className="state-icon">
              ⚠️
            </div>


            <h3>
              Access Error
            </h3>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={
                fetchAuditLogs
              }
              className="retry-button"
            >
              Try Again
            </button>

          </div>


        ) : filteredLogs.length ===
          0 ? (

          /* NO DATA */

          <div className="audit-state">

            <div className="state-icon">
              🔍
            </div>


            <h3>
              No Logs Found
            </h3>


            <p>
              No audit logs match
              the selected filters.
            </p>


            <button
              type="button"
              className="retry-button"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>


        ) : (

          /* TABLE */

          <div className="table-wrapper">

            <table className="audit-table">

              <thead>

                <tr>

                  <th>
                    Time
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Action
                  </th>

                  <th>
                    Module
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    IP Address
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredLogs.map(
                  (log) => {

                    const userName =
                      log.userId?.name ||
                      "System";


                    const userEmail =
                      log.userId?.email ||
                      "";


                    const role =
                      log.userId?.role ||
                      "System";


                    return (

                      <tr
                        key={
                          log._id
                        }
                      >


                        {/* TIME */}

                        <td className="time-cell">

                          {formatDate(
                            log.createdAt
                          )}

                        </td>


                        {/* USER */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">

                              {userName
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {userName}
                              </strong>


                              {userEmail && (

                                <small>
                                  {userEmail}
                                </small>

                              )}

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}

                        <td>

                          <span className="role-badge">

                            {role}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <span
                            className={`action-badge ${getActionClass(
                              log.action
                            )}`}
                          >

                            {log.action ||
                              "UNKNOWN"}

                          </span>

                        </td>


                        {/* MODULE */}

                        <td>

                          <span
                            className={`module-badge ${getModuleClass(
                              log.module
                            )}`}
                          >

                            {log.module ||
                              "UNKNOWN"}

                          </span>

                        </td>


                        {/* DESCRIPTION */}

                        <td className="description-cell">

                          {log.description ||
                            "No description"}

                        </td>


                        {/* IP */}

                        <td>

                          <code className="ip-address">

                            {log.ipAddress ||
                              "N/A"}

                          </code>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          SECURITY INFORMATION
      ===================================================== */}

      <section className="security-info">

        <div className="security-info-icon">
          🔒
        </div>


        <div>

          <h3>
            Security Monitoring
          </h3>


          <p>
            Audit logs provide a
            traceable record of
            authentication,
            data access,
            modifications,
            deletions, and other
            security-sensitive
            activities within
            DairyCare AI.
          </p>

        </div>

      </section>

    </div>

  );
}


export default SecurityAuditLogs;