import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./Farm.css";

function Farms() {

  const navigate = useNavigate();

  // ==========================
  // STATE
  // ==========================

  const [farms, setFarms] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================
  // FETCH FARMS
  // ==========================

  async function fetchFarms() {

    try {

      setLoading(true);

      setError("");

      const response =
        await api.get("/farms");

      console.log(
        "Farms:",
        response.data
      );

      setFarms(
        response.data?.farms || []
      );

    } catch (error) {

      console.error(
        "Fetch farms error:",
        error.response?.data ||
        error.message
      );

      setError(
        error.response?.data?.message ||
        "Failed to load farms."
      );

    } finally {

      setLoading(false);

    }

  }


  // ==========================
  // LOAD FARMS
  // ==========================

  useEffect(() => {

    fetchFarms();

  }, []);


  // ==========================
  // DELETE FARM
  // ==========================

  async function handleDelete(
    farmId
  ) {

    if (!farmId) {

      return;

    }


    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this farm?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      await api.delete(
        `/farms/${farmId}`
      );


      alert(
        "Farm deleted successfully."
      );


      setFarms(
        (currentFarms) =>
          currentFarms.filter(
            (farm) =>
              farm._id !== farmId
          )
      );


    } catch (error) {

      console.error(
        "Delete farm error:",
        error.response?.data ||
        error.message
      );


      alert(
        error.response?.data?.message ||
        "Failed to delete farm."
      );

    }

  }


  // ==========================
  // NAVIGATION
  // ==========================

  function goToDashboard() {

    navigate("/");

  }


  function goToAddFarm() {

    // IMPORTANT:
    // App.jsx route is /farms/add

    navigate("/farms/add");

  }


  function handleEditFarm(
    farmId
  ) {

    if (!farmId) {

      return;

    }


    navigate(
      `/farms/edit/${farmId}`
    );

  }


  function handleLogout() {

    localStorage.removeItem(
      "token"
    );


    navigate(
      "/login",
      {
        replace: true
      }
    );

  }


  // ==========================
  // LOADING
  // ==========================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <h2>
          🌾 Loading farms...
        </h2>

      </div>

    );

  }


  // ==========================
  // UI
  // ==========================

  return (

    <div className="dashboard">


      {/* ==========================
          HEADER
      ========================== */}

      <header className="dashboard-header">

        <div>

          <h1>
            🌾 DairyCare AI
          </h1>

          <p>
            Farm Management
          </p>

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
            onClick={goToAddFarm}
          >
            ➕ Add Farm
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


      {/* ==========================
          MAIN
      ========================== */}

      <main>


        {/* PAGE HEADER */}

        <div className="page-title-row">

          <div>

            <h2 className="section-title">
              🌾 My Farms
            </h2>

            <p className="animal-count">
              Total Farms:{" "}
              {farms.length}
            </p>

          </div>


          <button
            type="button"
            className="refresh-button"
            onClick={fetchFarms}
          >
            🔄 Refresh
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="page-error">

            {error}

          </div>

        )}


        {/* ==========================
            NO FARMS
        ========================== */}

        {farms.length === 0 ? (

          <div className="empty-message">

            <h3>
              🌾 No farms found
            </h3>

            <p>
              Add your first farm
              to start managing
              your dairy farm.
            </p>


            <button
              type="button"
              className="submit-button"
              onClick={goToAddFarm}
            >
              ➕ Add Farm
            </button>

          </div>

        ) : (

          /* ==========================
             FARMS GRID
          ========================== */

          <div className="animals-grid">

            {farms.map(
              (farm) => (

                <div
                  className="animal-card"
                  key={farm._id}
                >


                  <h3>
                    🌾{" "}
                    {farm.farmName ||
                      "Unnamed Farm"}
                  </h3>


                  <p>

                    <strong>
                      Location:
                    </strong>{" "}

                    {farm.location ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      Address:
                    </strong>{" "}

                    {farm.address ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      Created:
                    </strong>{" "}

                    {farm.createdAt
                      ? new Date(
                          farm.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "N/A"}

                  </p>


                  {/* ACTION BUTTONS */}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px"
                    }}
                  >


                    {/* EDIT */}

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEditFarm(
                          farm._id
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          farm._id
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

export default Farms;