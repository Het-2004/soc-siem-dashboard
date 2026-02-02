export async function checkBackendHealth() {
  const res = await fetch("http://localhost:5000/health");
  return res.json();
}
