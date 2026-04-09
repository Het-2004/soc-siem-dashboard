import api from "../api/api";

/**
 * logout() — Calls the backend to invalidate the refresh token,
 * then clears all local storage and redirects to login.
 */
export async function logout() {
  try {
    // Tell backend to clear the refresh token from DB (non-blocking)
    await api.post("/auth/logout");
  } catch (_) {
    // Ignore errors — we still want to clear local state
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }
}
