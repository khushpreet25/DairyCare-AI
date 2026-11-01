import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./Reports";

// =====================================================
// FARM
// =====================================================

import Farms from "./pages/Farms";
import AddFarm from "./pages/AddFarm";

// =====================================================
// ANIMAL
// =====================================================

import Animals from "./pages/Animals";
import AddAnimal from "./pages/AddAnimal";
import EditAnimal from "./pages/EditAnimal";

// =====================================================
// DIET PLAN
// =====================================================

import DietPlans from "./pages/DietPlans";
import AddDietPlan from "./pages/AddDietPlan";
import EditDietPlan from "./pages/EditDietPlan";

// =====================================================
// HEALTH RECORD
// =====================================================

import HealthRecords from "./pages/HealthRecords";
import AddHealthRecord from "./pages/AddHealthRecord";
import EditHealthRecord from "./pages/EditHealthRecord";

// =====================================================
// REMINDER
// =====================================================

import Reminders from "./pages/Reminders";
import AddReminder from "./pages/AddReminder";
import EditReminder from "./pages/EditReminder";

// =====================================================
// INJECTION
// =====================================================

import Injections from "./pages/Injections";
import AddInjection from "./pages/AddInjection";
import EditInjection from "./pages/EditInjection";

// =====================================================
// AI
// =====================================================

import AIRecommendation from "./pages/AIRecommendation";
import AIHealthRisk from "./pages/AIHealthRisk";
import AIHealthTrend from "./pages/AIHealthTrend";
import Analytics from "./pages/Analytics";

// =====================================================
// SECURITY
// =====================================================

import SecurityAuditLogs from "./pages/SecurityAuditLogs";

// =====================================================
// COMPONENTS
// =====================================================

import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        {/* =================================================
            MAIN DASHBOARD
        ================================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FARMS
        ================================================= */}

        <Route
          path="/farms"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <Farms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farms/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <AddFarm />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ANIMALS
        ================================================= */}

        <Route
          path="/animals"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <Animals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/animals/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <AddAnimal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/animals/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <EditAnimal />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIET PLANS
        ================================================= */}

        <Route
          path="/diet-plans"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <DietPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diet-plans/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <AddDietPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diet-plans/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <EditDietPlan />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            HEALTH RECORDS
        ================================================= */}

        <Route
          path="/health"
          element={
            <ProtectedRoute
              allowedRoles={[
                "veterinarian",
                "admin",
              ]}
            >
              <HealthRecords />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "veterinarian",
                "admin",
              ]}
            >
              <AddHealthRecord />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "veterinarian",
                "admin",
              ]}
            >
              <EditHealthRecord />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REMINDERS
        ================================================= */}

        <Route
          path="/reminders"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <Reminders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-reminder"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <AddReminder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-reminder/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <EditReminder />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            INJECTIONS
        ================================================= */}

        <Route
          path="/injections"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <Injections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/injections/add"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <AddInjection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/injections/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "admin",
              ]}
            >
              <EditInjection />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            AI FEATURES
        ================================================= */}

        {/* -------------------------------------------------
            AI RECOMMENDATION
        ------------------------------------------------- */}

        <Route
          path="/ai/recommendation/:animalId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <AIRecommendation />
            </ProtectedRoute>
          }
        />

        {/* -------------------------------------------------
            AI HEALTH RISK
        ------------------------------------------------- */}

        <Route
          path="/ai/health-risk/:animalId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <AIHealthRisk />
            </ProtectedRoute>
          }
        />

        {/* -------------------------------------------------
            AI HEALTH HISTORY & RISK TREND
        ------------------------------------------------- */}

        <Route
          path="/ai/health-trend/:animalId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <AIHealthTrend />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REPORTS & DATA EXPORT
        ================================================= */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute
              allowedRoles={[
                "farmer",
                "veterinarian",
                "admin",
              ]}
            >
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SECURITY AUDIT LOGS
        ================================================= */}

        <Route
          path="/security/audit-logs"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "veterinarian",
              ]}
            >
              <SecurityAuditLogs />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;