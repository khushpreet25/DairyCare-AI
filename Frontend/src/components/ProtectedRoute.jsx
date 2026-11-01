import { Navigate, useLocation } from "react-router-dom";
import { getUserRole } from "../utils/auth";

function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const location = useLocation();

  // =====================================================
  // CHECK TOKEN
  // =====================================================

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // =====================================================
  // GET USER ROLE
  // =====================================================

  const userRole = getUserRole();

  // Convert role to lowercase to avoid
  // Farmer vs farmer problems
  const role = userRole
    ? userRole.toString().trim().toLowerCase()
    : "";

  // =====================================================
  // DEBUG
  // =====================================================

  console.log("ProtectedRoute");
  console.log("Current path:", location.pathname);
  console.log("User role:", role);
  console.log("Allowed roles:", allowedRoles);

  // =====================================================
  // NO ROLE RESTRICTION
  // =====================================================

  if (allowedRoles.length === 0) {
    return children;
  }

  // =====================================================
  // CHECK ROLE
  // =====================================================

  const normalizedAllowedRoles =
    allowedRoles.map((allowedRole) =>
      allowedRole.toString().trim().toLowerCase()
    );

  // =====================================================
  // ROLE NOT ALLOWED
  // =====================================================

  if (!normalizedAllowedRoles.includes(role)) {

    console.warn(
      "Access denied",
      {
        path: location.pathname,
        role,
        allowedRoles: normalizedAllowedRoles
      }
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // =====================================================
  // ACCESS GRANTED
  // =====================================================

  return children;
}

export default ProtectedRoute;