import React, { useState } from "react";
import api from "./api/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./styles/Reports.css";

const REPORTS = [
  {
    id: "farm-summary",
    title: "Farm Summary",
    description:
      "Overview of farms, animals, injections, diets and health records.",
    endpoint: "/reports/farm-summary",
    icon: "🏡",
  },
  {
    id: "animal-health",
    title: "Animal Health Report",
    description:
      "Latest health status and health records of animals.",
    endpoint: "/reports/animal-health",
    icon: "🐄",
  },
  {
    id: "injections",
    title: "Injection Report",
    description:
      "Injection history and upcoming or overdue injections.",
    endpoint: "/reports/injections",
    icon: "💉",
  },
  {
    id: "milk-production",
    title: "Milk Production Report",
    description:
      "Milk production summary and animal-wise production.",
    endpoint: "/reports/milk-production",
    icon: "🥛",
  },
  {
    id: "diet-plans",
    title: "Diet Plans Report",
    description:
      "Animal diet plans and feeding information.",
    endpoint: "/reports/diet-plans",
    icon: "🌾",
  },
  {
    id: "health-records",
    title: "Health Records Report",
    description:
      "Complete animal health record information.",
    endpoint: "/reports/health-records",
    icon: "🩺",
  },
];

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // VIEW REPORT
  // =====================================================

  const viewReport = async (report) => {
    setSelectedReport(report);
    setLoading(true);
    setError("");
    setData([]);
    setSummary(null);

    try {
      const response = await api.get(report.endpoint);

      const result = response.data;

      let reportData = [];

      if (Array.isArray(result)) {
        reportData = result;
      } else if (result?.data && Array.isArray(result.data)) {
        reportData = result.data;
      } else if (
        result?.records &&
        Array.isArray(result.records)
      ) {
        reportData = result.records;
      } else if (
        result?.farms &&
        Array.isArray(result.farms)
      ) {
        reportData = result.farms;
      }

      setData(reportData);
      setSummary(result);
    } catch (err) {
      console.error("Report error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLOSE REPORT
  // =====================================================

  const closeReport = () => {
    setSelectedReport(null);
    setData([]);
    setSummary(null);
    setError("");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN");
  };

  // =====================================================
  // SAFE VALUE
  // =====================================================

  const getValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (typeof value === "object") {
      if (value.name) return value.name;
      if (value.farmName) return value.farmName;
      if (value.animalTagId) return value.animalTagId;

      return JSON.stringify(value);
    }

    return String(value);
  };

  // =====================================================
  // CSV EXPORT
  // =====================================================

  const downloadCSV = () => {
    if (!data.length) {
      alert("Please open a report first.");
      return;
    }

    const rows = data.map((item) => {
      const row = {};

      Object.keys(item).forEach((key) => {
        const value = item[key];

        row[key] =
          value && typeof value === "object"
            ? getValue(value)
            : value;
      });

      return row;
    });

    const headers = Object.keys(rows[0]);

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";

            return `"${String(value).replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${
      selectedReport?.id || "report"
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const downloadExcel = () => {
    if (!data.length) {
      alert("Please open a report first.");
      return;
    }

    const rows = data.map((item) => {
      const row = {};

      Object.keys(item).forEach((key) => {
        const value = item[key];

        row[key] =
          value && typeof value === "object"
            ? getValue(value)
            : value;
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      selectedReport?.title?.substring(0, 31) ||
        "Report"
    );

    XLSX.writeFile(
      workbook,
      `${selectedReport?.id || "report"}.xlsx`
    );
  };

  // =====================================================
  // PDF EXPORT
  // =====================================================

  const downloadPDF = () => {
    if (!data.length) {
      alert("Please open a report first.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title =
      selectedReport?.title ||
      "DairyCare AI Report";

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text("DairyCare AI", 14, 15);

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");

    doc.text(title, 14, 23);

    doc.setFontSize(9);

    doc.text(
      `Generated on: ${new Date().toLocaleString(
        "en-IN"
      )}`,
      14,
      30
    );

    const rows = data.map((item) => {
      const row = {};

      Object.keys(item).forEach((key) => {
        const value = item[key];

        row[key] =
          value && typeof value === "object"
            ? getValue(value)
            : value;
      });

      return row;
    });

    const headers = Object.keys(rows[0]);

    const tableBody = rows.map((row) =>
      headers.map((header) => {
        const value = row[header];

        return value === null ||
          value === undefined
          ? "-"
          : String(value);
      })
    );

    autoTable(doc, {
      startY: 36,

      head: [headers],

      body: tableBody,

      theme: "grid",

      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },

      headStyles: {
        fontSize: 7,
        fontStyle: "bold",
      },

      bodyStyles: {
        fontSize: 7,
      },

      margin: {
        top: 36,
        left: 10,
        right: 10,
        bottom: 15,
      },

      didDrawPage: (pageData) => {
        const pageNumber =
          doc.internal.getNumberOfPages();

        doc.setFontSize(8);

        doc.text(
          `Page ${pageNumber}`,
          pageData.settings.margin.left,
          doc.internal.pageSize.height - 8
        );
      },
    });

    doc.save(
      `${selectedReport?.id || "dairycare-report"}.pdf`
    );
  };

  // =====================================================
  // FARM SUMMARY
  // =====================================================

  const renderFarmSummary = () => {
    if (!data.length) {
      return (
        <p className="no-data">
          No farm data available.
        </p>
      );
    }

    return (
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Farm</th>
              <th>Animals</th>
              <th>Injections</th>
              <th>Diet Plans</th>
              <th>Health Records</th>
              <th>Milk Production</th>
            </tr>
          </thead>

          <tbody>
            {data.map((farm, index) => (
              <tr key={farm._id || index}>
                <td>
                  {getValue(
                    farm.farmName ||
                      farm.name ||
                      farm.farm?.name ||
                      farm.farm
                  )}
                </td>

                <td>
                  {getValue(
                    farm.animalCount ??
                      farm.animals ??
                      farm.totalAnimals ??
                      0
                  )}
                </td>

                <td>
                  {getValue(
                    farm.injectionCount ??
                      farm.injections ??
                      farm.totalInjections ??
                      0
                  )}
                </td>

                <td>
                  {getValue(
                    farm.dietPlanCount ??
                      farm.dietPlans ??
                      farm.totalDietPlans ??
                      0
                  )}
                </td>

                <td>
                  {getValue(
                    farm.healthRecordCount ??
                      farm.healthRecords ??
                      farm.totalHealthRecords ??
                      0
                  )}
                </td>

                <td>
                  {getValue(
                    farm.totalMilkProduction ??
                      farm.milkProduction ??
                      farm.totalMilk ??
                      0
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // =====================================================
  // GENERIC TABLE
  // =====================================================

  const renderGenericTable = () => {
    if (!data.length) {
      return (
        <p className="no-data">
          No data available for this report.
        </p>
      );
    }

    const columns = Object.keys(data[0]).filter(
      (key) =>
        key !== "__v" &&
        key !== "createdAt" &&
        key !== "updatedAt"
    );

    return (
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  {column
                    .replace(
                      /([A-Z])/g,
                      " $1"
                    )
                    .replace(/^./, (str) =>
                      str.toUpperCase()
                    )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={row._id || index}>
                {columns.map((column) => (
                  <td key={column}>
                    {column
                      .toLowerCase()
                      .includes("date")
                      ? formatDate(row[column])
                      : getValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // =====================================================
  // REPORT CONTENT
  // =====================================================

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="report-loading">
          <div className="loading-spinner"></div>
          <p>Loading report...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="report-error">
          <span>⚠️</span>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={() =>
              viewReport(selectedReport)
            }
          >
            Try Again
          </button>
        </div>
      );
    }

    if (
      selectedReport?.id ===
      "farm-summary"
    ) {
      return renderFarmSummary();
    }

    return renderGenericTable();
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">
        <div>
          <h1>Reports & Data Export</h1>

          <p>
            Generate, view and export DairyCare AI
            farm management reports.
          </p>
        </div>
      </div>

      {/* REPORT CARDS */}

      <div className="reports-grid">
        {REPORTS.map((report) => (
          <div
            className="report-card"
            key={report.id}
          >
            <div className="report-icon">
              {report.icon}
            </div>

            <div className="report-card-content">
              <h3>{report.title}</h3>

              <p>
                {report.description}
              </p>

              <button
                className="report-button"
                onClick={() =>
                  viewReport(report)
                }
              >
                View Report →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EXPORT SECTION */}

      <div className="export-section">

        <div>
          <h2>Export Data</h2>

          <p>
            Select a report above to view and
            export your data.
          </p>
        </div>

        <div className="export-buttons">

          <button
            type="button"
            className="export-button csv"
            onClick={() => {
              if (!data.length) {
                alert(
                  "Please open a report first."
                );
                return;
              }

              downloadCSV();
            }}
          >
            📄 Export CSV
          </button>

          <button
            type="button"
            className="export-button excel"
            onClick={() => {
              if (!data.length) {
                alert(
                  "Please open a report first."
                );
                return;
              }

              downloadExcel();
            }}
          >
            📊 Export Excel
          </button>

          <button
            type="button"
            className="export-button pdf"
            onClick={() => {
              if (!data.length) {
                alert(
                  "Please open a report first."
                );
                return;
              }

              downloadPDF();
            }}
          >
            📕 Export PDF
          </button>

        </div>
      </div>

      {/* REPORT MODAL */}

      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={closeReport}
        >
          <div
            className="report-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="report-modal-header">

              <div>
                <h2>
                  {selectedReport.icon}{" "}
                  {selectedReport.title}
                </h2>

                {!loading && !error && (
                  <span className="record-count">
                    {data.length} record
                    {data.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </span>
                )}
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeReport}
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="report-modal-body">
              {renderReportContent()}
            </div>

            {/* MODAL FOOTER */}

            {!loading &&
              !error &&
              data.length > 0 && (
                <div className="report-modal-footer">

                  <button
                    type="button"
                    className="modal-export-button csv"
                    onClick={downloadCSV}
                  >
                    📄 CSV
                  </button>

                  <button
                    type="button"
                    className="modal-export-button excel"
                    onClick={downloadExcel}
                  >
                    📊 Excel
                  </button>

                  <button
                    type="button"
                    className="modal-export-button pdf"
                    onClick={downloadPDF}
                  >
                    📕 PDF
                  </button>

                </div>
              )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;