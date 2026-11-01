import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./DietPlan.css";

function DietPlans() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [dietPlans, setDietPlans] = useState([]);
  const [animals, setAnimals] = useState([]);

  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [selectedAnimalData, setSelectedAnimalData] = useState(null);

  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadingDietPlans, setLoadingDietPlans] = useState(false);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH ANIMALS
  // =====================================================

  async function fetchAnimals() {
    try {
      setLoadingAnimals(true);
      setError("");

      const response = await api.get("/animals");

      console.log("Animals API response:", response.data);

      const animalList = response.data?.animals || [];

      setAnimals(animalList);

      // Keep selected animal information after refresh
      if (selectedAnimal) {
        const selected = animalList.find(
          (animal) => animal._id === selectedAnimal
        );

        setSelectedAnimalData(selected || null);
      }
    } catch (error) {
      console.error(
        "Fetch animals error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load animals."
      );
    } finally {
      setLoadingAnimals(false);
    }
  }

  // =====================================================
  // FETCH DIET PLANS
  // =====================================================

  async function fetchDietPlans(animalId) {
    if (!animalId) {
      setDietPlans([]);
      return;
    }

    try {
      setLoadingDietPlans(true);
      setError("");

      const response = await api.get(
        `/diet-plans/${animalId}`
      );

      console.log(
        "Diet plans API response:",
        response.data
      );

      setDietPlans(
        response.data?.dietPlans || []
      );
    } catch (error) {
      console.error(
        "Fetch diet plans error:",
        error.response?.data || error.message
      );

      setDietPlans([]);

      setError(
        error.response?.data?.message ||
          "Failed to load diet plans."
      );
    } finally {
      setLoadingDietPlans(false);
    }
  }

  // =====================================================
  // LOAD ANIMALS
  // =====================================================

  useEffect(() => {
    fetchAnimals();
  }, []);

  // =====================================================
  // LOAD DIET PLANS WHEN ANIMAL CHANGES
  // =====================================================

  useEffect(() => {
    if (selectedAnimal) {
      fetchDietPlans(selectedAnimal);
    } else {
      setDietPlans([]);
      setSelectedAnimalData(null);
    }
  }, [selectedAnimal]);

  // =====================================================
  // HANDLE ANIMAL SELECTION
  // =====================================================

  function handleAnimalChange(e) {
    const animalId = e.target.value;

    setSelectedAnimal(animalId);

    if (!animalId) {
      setSelectedAnimalData(null);
      return;
    }

    const animal = animals.find(
      (item) => item._id === animalId
    );

    setSelectedAnimalData(animal || null);
  }

  // =====================================================
  // DELETE DIET PLAN
  // =====================================================

  async function deleteDiet(dietId) {
    if (!dietId) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this diet plan?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(dietId);
      setError("");

      await api.delete(
        `/diet-plans/${dietId}`
      );

      alert(
        "Diet plan deleted successfully."
      );

      await fetchDietPlans(selectedAnimal);
    } catch (error) {
      console.error(
        "Delete diet plan error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete diet plan."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // EDIT DIET PLAN
  // =====================================================

  function editDiet(dietId) {
    if (!dietId) {
      console.error(
        "Diet plan ID is missing"
      );

      return;
    }

    navigate(
      `/diet-plans/edit/${dietId}`
    );
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function goDashboard() {
    navigate("/");
  }

  function goAddDiet() {
    navigate("/diet-plans/add");
  }

  function goAnimals() {
    navigate("/animals");
  }

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================================
  // CALCULATE AGE
  // =====================================================

  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) {
      return "N/A";
    }

    const birthDate = new Date(dateOfBirth);

    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {
      return "N/A";
    }

    const today = new Date();

    let years =
      today.getFullYear() -
      birthDate.getFullYear();

    let months =
      today.getMonth() -
      birthDate.getMonth();

    if (
      months < 0 ||
      (
        months === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      years--;
    }

    if (years < 1) {
      const totalMonths =
        (today.getFullYear() -
          birthDate.getFullYear()) *
          12 +
        (
          today.getMonth() -
          birthDate.getMonth()
        );

      return `${Math.max(
        0,
        totalMonths
      )} month${
        totalMonths === 1
          ? ""
          : "s"
      }`;
    }

    return `${years} year${
      years === 1
        ? ""
        : "s"
    }`;
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

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

  // =====================================================
  // FORMAT GENDER
  // =====================================================

  function formatGender(gender) {
    if (!gender) {
      return "N/A";
    }

    return (
      gender.charAt(0).toUpperCase() +
      gender.slice(1)
    );
  }

  // =====================================================
  // FORMAT PREGNANCY STATUS
  // =====================================================

  function formatPregnancyStatus(status) {
    if (status === true) {
      return "Pregnant";
    }

    if (status === false) {
      return "Not Pregnant";
    }

    return "N/A";
  }

  // =====================================================
  // LOADING ANIMALS
  // =====================================================

  if (loadingAnimals) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">

          <div className="loading-icon">
            🥗
          </div>

          <h2>
            Loading Diet Management...
          </h2>

          <p>
            Loading your animals...
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

        <div className="brand-section">

          <h1>
            🐄 DairyCare AI
          </h1>

          <p>
            Diet Plan Management
          </p>

        </div>

        <div className="header-buttons">

          {/* DASHBOARD */}

          <button
            type="button"
            className="back-button"
            onClick={goDashboard}
          >
            ← Dashboard
          </button>

          {/* ADD DIET */}

          <button
            type="button"
            className="animals-button"
            onClick={goAddDiet}
          >
            ➕ Add Diet Plan
          </button>

          {/* ANIMALS */}

          <button
            type="button"
            className="nav-button"
            onClick={goAnimals}
          >
            🐄 Animals
          </button>

          {/* LOGOUT */}

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

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="dashboard-actions">

          <div>

            <h2 className="section-title">
              🥗 Diet Plans
            </h2>

            <p>
              Manage feeding and nutrition
              plans for your animals.
            </p>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            className="refresh-button"
            onClick={async () => {

              await fetchAnimals();

              if (selectedAnimal) {
                await fetchDietPlans(
                  selectedAnimal
                );
              }

            }}
          >
            🔄 Refresh
          </button>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

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
              onClick={async () => {

                setError("");

                await fetchAnimals();

                if (selectedAnimal) {
                  await fetchDietPlans(
                    selectedAnimal
                  );
                }

              }}
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            SELECT ANIMAL
        ================================================= */}

        <section className="form-card">

          <div className="form-group">

            <label htmlFor="animal">

              <strong>
                🐄 Select Animal
              </strong>

            </label>

            <select
              id="animal"
              value={selectedAnimal}
              onChange={handleAnimalChange}
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

                    {animal.animalTagId
                      ? ` (${animal.animalTagId})`
                      : ""}

                  </option>

                )
              )}

            </select>

          </div>

        </section>


        {/* =================================================
            SELECTED ANIMAL INFORMATION
        ================================================= */}

        {selectedAnimal &&
          selectedAnimalData && (

            <section className="dashboard-section">

              <div className="section-header-row">

                <div>

                  <h2 className="section-title">
                    🐄 Selected Animal
                  </h2>

                  <p>
                    Animal information used for
                    diet management.
                  </p>

                </div>

              </div>


              <div className="animal-card">

                {/* NAME */}

                <h3>
                  🐄{" "}
                  {selectedAnimalData.name ||
                    "Unnamed Animal"}
                </h3>


                {/* TAG */}

                <p>
                  <strong>
                    Animal Tag:
                  </strong>{" "}

                  {selectedAnimalData.animalTagId ||
                    "N/A"}
                </p>


                {/* BREED */}

                <p>
                  <strong>
                    Breed:
                  </strong>{" "}

                  {selectedAnimalData.breed ||
                    "N/A"}
                </p>


                {/* GENDER */}

                <p>
                  <strong>
                    Gender:
                  </strong>{" "}

                  {formatGender(
                    selectedAnimalData.gender
                  )}
                </p>


                {/* DATE OF BIRTH */}

                <p>
                  <strong>
                    Date of Birth:
                  </strong>{" "}

                  {formatDate(
                    selectedAnimalData.dateOfBirth
                  )}
                </p>


                {/* AGE */}

                <p>
                  <strong>
                    Age:
                  </strong>{" "}

                  {calculateAge(
                    selectedAnimalData.dateOfBirth
                  )}
                </p>


                {/* WEIGHT */}

                <p>
                  <strong>
                    Weight:
                  </strong>{" "}

                  {selectedAnimalData.weight !==
                    undefined &&
                  selectedAnimalData.weight !==
                    null
                    ? `${selectedAnimalData.weight} kg`
                    : "N/A"}
                </p>


                {/* MILK PRODUCTION */}

                <p>
                  <strong>
                    Milk Production:
                  </strong>{" "}

                  {selectedAnimalData.milkProduction !==
                    undefined &&
                  selectedAnimalData.milkProduction !==
                    null
                    ? `${selectedAnimalData.milkProduction} L`
                    : "N/A"}
                </p>


                {/* PREGNANCY STATUS */}

                <p>
                  <strong>
                    Pregnancy Status:
                  </strong>{" "}

                  {formatPregnancyStatus(
                    selectedAnimalData.pregnancyStatus
                  )}
                </p>

              </div>

            </section>

          )}


        {/* =================================================
            NO ANIMALS
        ================================================= */}

        {animals.length === 0 && (

          <section className="empty-message">

            <div className="empty-icon">
              🐄
            </div>

            <h3>
              No animals found
            </h3>

            <p>
              You need to add an animal
              before creating a diet plan.
            </p>

            <button
              type="button"
              className="submit-button"
              onClick={goAnimals}
            >
              ➕ Add Animal
            </button>

          </section>

        )}


        {/* =================================================
            NO ANIMAL SELECTED
        ================================================= */}

        {animals.length > 0 &&
          !selectedAnimal && (

            <section className="empty-message">

              <div className="empty-icon">
                🥗
              </div>

              <h3>
                Select an animal
              </h3>

              <p>
                Select an animal above to
                view its diet plans.
              </p>

              <button
                type="button"
                className="submit-button"
                onClick={goAddDiet}
              >
                ➕ Create Diet Plan
              </button>

            </section>

          )}


        {/* =================================================
            LOADING DIET PLANS
        ================================================= */}

        {selectedAnimal &&
          loadingDietPlans && (

            <div className="dashboard-loading">

              <h3>
                Loading diet plans...
              </h3>

            </div>

          )}


        {/* =================================================
            NO DIET PLANS
        ================================================= */}

        {selectedAnimal &&
          !loadingDietPlans &&
          dietPlans.length === 0 && (

            <section className="empty-message">

              <div className="empty-icon">
                🥗
              </div>

              <h3>
                No Diet Plans Found
              </h3>

              <p>
                This animal does not have
                any diet plans yet.
              </p>

              <button
                type="button"
                className="submit-button"
                onClick={goAddDiet}
              >
                ➕ Add Diet Plan
              </button>

            </section>

          )}


        {/* =================================================
            DIET PLANS
        ================================================= */}

        {selectedAnimal &&
          !loadingDietPlans &&
          dietPlans.length > 0 && (

            <section className="dashboard-section">

              {/* SECTION HEADER */}

              <div className="section-header-row">

                <div>

                  <h2 className="section-title">
                    🥗 Animal Diet Plans
                  </h2>

                  <p>
                    {dietPlans.length} diet plan
                    {dietPlans.length !== 1
                      ? "s"
                      : ""}{" "}
                    found.
                  </p>

                </div>

                <button
                  type="button"
                  className="nav-button"
                  onClick={goAddDiet}
                >
                  ➕ Add Another
                </button>

              </div>


              {/* =================================================
                  DIET CARDS
              ================================================= */}

              <div className="animals-grid">

                {dietPlans.map(
                  (diet) => (

                    <div
                      className="animal-card"
                      key={diet._id}
                    >

                      {/* FEED NAME */}

                      <h3>
                        🥗{" "}
                        {diet.feedName ||
                          "Unnamed Feed"}
                      </h3>


                      {/* QUANTITY */}

                      <p>

                        <strong>
                          Quantity:
                        </strong>{" "}

                        {diet.quantity !==
                          undefined &&
                        diet.quantity !==
                          null
                          ? `${diet.quantity} kg`
                          : "N/A"}

                      </p>


                      {/* FEEDING TIME */}

                      <p>

                        <strong>
                          Feeding Time:
                        </strong>{" "}

                        {diet.feedingTime ||
                          "N/A"}

                      </p>


                      {/* START DATE */}

                      <p>

                        <strong>
                          Start Date:
                        </strong>{" "}

                        {formatDate(
                          diet.startDate
                        )}

                      </p>


                      {/* END DATE */}

                      <p>

                        <strong>
                          End Date:
                        </strong>{" "}

                        {formatDate(
                          diet.endDate
                        )}

                      </p>


                      {/* NUTRITIONAL NOTES */}

                      <p>

                        <strong>
                          Nutritional Notes:
                        </strong>{" "}

                        {diet.nutritionalNotes ||
                          "No notes"}

                      </p>


                      {/* ACTION BUTTONS */}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                          flexWrap: "wrap",
                        }}
                      >

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button"
                          disabled={
                            deletingId ===
                            diet._id
                          }
                          onClick={() =>
                            editDiet(
                              diet._id
                            )
                          }
                        >
                          ✏ Edit
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button"
                          disabled={
                            deletingId ===
                            diet._id
                          }
                          onClick={() =>
                            deleteDiet(
                              diet._id
                            )
                          }
                        >
                          {deletingId ===
                          diet._id
                            ? "Deleting..."
                            : "🗑 Delete"}
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          )}

      </main>

    </div>
  );
}

export default DietPlans;