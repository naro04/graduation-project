/**
 * Client-side JWT helpers (payload read only — signature is verified by the API).
 * Used for session checks and expiry before calling protected routes.
 */

/**
 * @param {string} token
 * @returns {object|null} Decoded payload or null if not a readable JWT
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * @param {string} token
 * @returns {boolean} True if token is a JWT and exp is in the past
 */
export function isJwtExpired(token) {
  const payload = parseJwtPayload(token);
  // ليست JWT صالحة، أو بدون exp → لا نعتمدها كجلسة (كانت تُعتبر "غير منتهية" = ثغرة)
  if (!payload) return true;
  if (payload.exp == null) return true;
  const expMs = Number(payload.exp) * 1000;
  if (!Number.isFinite(expMs)) return true;
  return Date.now() >= expMs;
}
