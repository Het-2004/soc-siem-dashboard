/**
 * getUserRole() — Decodes the JWT to read the role.
 * Reads from localStorage.userRole (fast) then falls back to JWT decode.
 */
export function getUserRole() {
  // Fast path: use the role stored on login
  const cached = localStorage.getItem("userRole");
  if (cached) return cached;

  // Fallback: decode from JWT
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

/**
 * getUserName() — Returns the display name from localStorage.
 */
export function getUserName() {
  return localStorage.getItem("userName") || "SOC Analyst";
}
