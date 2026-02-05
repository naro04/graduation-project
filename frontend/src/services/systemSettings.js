import { apiClient } from "./apiClient";

const BASE = "/system-settings";
const STORAGE_KEY = "hr_system_settings";

function getFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    if (data != null && typeof data === "object") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (_) {}
}

/** Returns true if the object looks like real settings (not empty/stale API response) */
function hasRealSettings(data) {
  if (!data || typeof data !== "object") return false;
  const keys = Object.keys(data);
  if (keys.length === 0) return false;
  const hasNested = data.attendance || data.leave || data.location_gps || data.activity_rules || data.general;
  const hasFlat = keys.some((k) => k.startsWith("attendance_") || k.startsWith("leave_") || k.startsWith("location_gps_") || k.startsWith("activity_rules_") || k.startsWith("general_"));
  return !!(hasNested || hasFlat);
}

/**
 * Get system settings. Prefer localStorage when it has data so refresh always shows saved values.
 * GET http://localhost:5000/api/v1/system-settings
 * @returns {Promise<object>} - System settings (attendance, leave, location_gps, activity_rules, general)
 */
export const getSystemSettings = async () => {
  const stored = getFromStorage();
  if (hasRealSettings(stored)) return stored;
  try {
    const response = await apiClient.get(BASE);
    const data = response.data?.data ?? response.data;
    if (hasRealSettings(data)) {
      saveToStorage(data);
      return data;
    }
  } catch (_) {}
  return stored;
};

/**
 * Update system settings (API + localStorage so data persists on refresh)
 * PUT http://localhost:5000/api/v1/system-settings
 * @param {Object} settings - Full or partial settings (nested or flat keys)
 * @returns {Promise<object>} - Updated settings
 */
export const updateSystemSettings = async (settings) => {
  saveToStorage(settings);
  try {
    const response = await apiClient.put(BASE, settings);
    return response.data?.data ?? response.data ?? settings;
  } catch (_) {
    return settings;
  }
};

/**
 * Get system settings change history
 * GET http://localhost:5000/api/v1/system-settings/history
 * @returns {Promise<Array>} - Change history
 */
export const getSystemSettingsHistory = async () => {
  try {
    const response = await apiClient.get(`${BASE}/history`);
    return response.data?.data ?? response.data ?? [];
  } catch (_) {
    return [];
  }
};
