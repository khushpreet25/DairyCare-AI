import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getUserRole } from "../utils/auth";
import "./HealthRecords.css";

function HealthRecords() {

  const navigate = useNavigate();

  // ==============================
  // STATE
  // ==============================

  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);

  const [selectedAnimal, setSelectedAnimal] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [error, setError] = useState("");

  const role = getUserRole();


  // ==============================
  // LOAD ANIMALS
  // ==============================

  async function fetchAnimals() {

    try {

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
        "Animals fetch error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        "Failed to load animals."
      );

    }

  }


  // ==============================
  // FETCH HEALTH RECORDS
  // ==============================

  async function fetchHealthRecords(
    animalId
  ) {

    if (!animalId) {

      setRecords([]);

      return;

    }

    try {

      setFetching(true);
      setError("");

      const response =
        await api.get(
          `/health/${animalId}`
        );

      console.log(
        "Health records:",
        response.data
      );

      setRecords(
        response.data.healthRecords ||
        []
      );

    } catch (error) {

      console.error(
        "Health record fetch error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        "Failed to fetch health records."
      );

      setRecords([]);

    } finally {

      setFetching(false);

    }

  }


  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {

    async function loadPage() {

      setLoading(true);

      await fetchAnimals();

      setLoading(false);

    }

    loadPage();

  }, []);


  // ==============================
  // ANIMAL CHANGE
  // ==============================

  function handleAnimalChange(event) {

    const animalId =
      event.target.value;

    setSelectedAnimal(animalId);

    fetchHealthRecords(animalId);

  }


  // ==============================
  // ADD RECORD
  // ==============================

  function handleAddRecord() {

    if (!selectedAnimal) {

      alert(
        "Please select an animal first."
      );

      return;

    }

    navigate(
      `/health/add?animalId=${selectedAnimal}`
    );

  }


  // ==============================
  // EDIT RECORD
  // ==============================

  function handleEdit(recordId) {

    navigate(
      `/health/edit/${recordId}`
    );

  }


  // ==============================
  // DELETE RECORD
  // ==============================

  async function handleDelete(recordId) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this health record?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        `/health/${recordId}`
      );

      alert(
        "Health record deleted successfully."
      );

      // Refresh records

      await fetchHealthRecords(
        selectedAnimal
      );

    } catch (error) {

      console.error(
        "Delete health record error:",
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete health record."
      );

    }

  }


  // ==============================
  // FORMAT DATE
  // ==============================

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
        year: "numeric"
      }
    );

  }


  // ==============================
  // BACK TO DASHBOARD
  // ==============================

  function goToDashboard() {

    navigate("/");

  }


  // ==============================
  // LOADING
  // ==============================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <h2>
          🩺 Loading Health Records...
        </h2>

        <p>
          Fetching animal health information.
        </p>

      </div>

    );

  }


  // ==============================
  // UI
  // ==============================

  return (

    <div className="dashboard">


      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            🩺 Health Record Management
          </h1>

          <p>
            Veterinary health monitoring
            and medical history
          </p>

        </div>


        <div className="header-buttons">

          <button
            className="nav-button"
            onClick={goToDashboard}
          >
            🏠 Dashboard
          </button>

          <button
            className="logout-button"
            onClick={() => {

              localStorage.removeItem(
                "token"
              );

              navigate("/login");

            }}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <main>


        {/* ================================= */}
        {/* ROLE */}
        {/* ================================= */}

        <div className="dashboard-actions">

          <div>

            <h2>
              🧑‍⚕️ Veterinary Panel
            </h2>

            <p>
              Logged in as:
              {" "}
              <strong>
                {role}
              </strong>
            </p>

          </div>

        </div>


        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (

          <div className="page-error">

            ❌ {error}

          </div>

        )}


        {/* ================================= */}
        {/* SELECT ANIMAL */}
        {/* ================================= */}

        <div className="stat-card">

          <h2>
            🐄 Select Animal
          </h2>

          <p>
            Select an animal to view its
            complete health history.
          </p>


          <select
            value={selectedAnimal}
            onChange={handleAnimalChange}
            className="form-input"
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

        </div>


        {/* ================================= */}
        {/* ACTION BUTTON */}
        {/* ================================= */}

        {selectedAnimal && (

          <div className="dashboard-actions">

            <div>

              <h2>
                ❤️ Health History
              </h2>

              <p>
                Medical records for the
                selected animal.
              </p>

            </div>


            <button
              className="nav-button"
              onClick={handleAddRecord}
            >
              ➕ Add Health Record
            </button>

          </div>

        )}


        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {fetching && (

          <div className="empty-message">

            <h3>
              ⏳ Fetching health records...
            </h3>

          </div>

        )}


        {/* ================================= */}
        {/* NO RECORDS */}
        {/* ================================= */}

        {!fetching &&
          selectedAnimal &&
          records.length === 0 && (

          <div className="empty-message">

            <h3>
              🩺 No Health Records
            </h3>

            <p>
              No health records have been
              created for this animal yet.
            </p>

            <button
              className="nav-button"
              onClick={handleAddRecord}
            >
              ➕ Create First Record
            </button>

          </div>

        )}


        {/* ================================= */}
        {/* HEALTH RECORDS */}
        {/* ================================= */}

        {!fetching &&
          records.length > 0 && (

          <div className="reminders-grid">

            {records.map(
              (record) => (

                <div
                  className="reminder-card"
                  key={record._id}
                >

                  <h3>
                    ❤️ Health Check
                  </h3>


                  <p>
                    <strong>
                      Date:
                    </strong>{" "}
                    {formatDate(
                      record.createdAt
                    )}
                  </p>


                  <p>
                    <strong>
                      Temperature:
                    </strong>{" "}
                    {record.temperature ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Appetite:
                    </strong>{" "}
                    {record.appetite ||
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Activity:
                    </strong>{" "}
                    {record.activityLevel ||
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Milk Production:
                    </strong>{" "}
                    {record.milkProduction ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Symptoms:
                    </strong>{" "}
                    {record.symptoms ||
                      "None"}
                  </p>


                  <p>
                    <strong>
                      Notes:
                    </strong>{" "}
                    {record.notes ||
                      "No notes"}
                  </p>


                  {/* ACTIONS */}

                  <div
                    className="header-buttons"
                  >

                    <button
                      className="nav-button"
                      onClick={() =>
                        handleEdit(
                          record._id
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      className="logout-button"
                      onClick={() =>
                        handleDelete(
                          record._id
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

      </main>

    </div>

  );

}

export default HealthRecords;