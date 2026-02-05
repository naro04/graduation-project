import { apiClient } from "./apiClient";

const BASE = "/locations";

/**
 * GET http://localhost:5000/api/v1/locations
 * قائمة المواقع
 */
export async function getLocations(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/locations
 * إنشاء موقع جديد
 */
export async function createLocation(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/locations/:id
 * موقع واحد بالمعرف
 */
export async function getLocationById(id) {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * PUT http://localhost:5000/api/v1/locations/:id
 * تحديث موقع
 */
export async function updateLocation(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/locations/:id
 * حذف موقع
 */
export async function deleteLocation(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/locations/:id/employees
 * موظفو الموقع
 */
export async function getLocationEmployees(id) {
  const res = await apiClient.get(`${BASE}/${id}/employees`);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * GET http://localhost:5000/api/v1/locations/:id/activities
 * أنشطة الموقع
 */
export async function getLocationActivities(id) {
  const res = await apiClient.get(`${BASE}/${id}/activities`);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}
