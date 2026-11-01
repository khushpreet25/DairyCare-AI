export function getUserRole() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.error("Invalid JWT token");
      return null;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    const role = payload.role;

    console.log("JWT payload:", payload);
    console.log("User role:", role);

    return role
      ? role.toString().trim().toLowerCase()
      : null;

  } catch (error) {
    console.error(
      "Failed to decode token:",
      error
    );

    return null;
  }
}