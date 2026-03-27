/**
 * Single source of truth for the API base URL (must include `/api/v1` as used by this app).
 * Set `VITE_API_URL` in `.env` — see `.env.example`.
 */
function normalizeBaseUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const t = url.trim();
  return t.replace(/\/+$/, "");
}

const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_URL);

/** @type {string} */
export const API_BASE_URL =
  fromEnv ||
  "https://graduation-project-production-b02b.up.railway.app/api/v1";
