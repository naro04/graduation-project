import { apiClient } from "./apiClient";

const BASE = "/location-assignments";

/**
 * GET http://localhost:5000/api/v1/location-assignments
 * قائمة تعيينات المواقع (موظف-موقع)
 */
export async function getLocationAssignments(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.assignments ?? [];
}

/**
 * POST http://localhost:5000/api/v1/location-assignments
 * تعيين موظف لموقع
 * @param {{ employee_id: string, location_id: string }} payload
 */
export async function createLocationAssignment(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/location-assignments/{employee_id}/{location_id}
 * إزالة موظف من موقع
 */
export async function deleteLocationAssignment(employeeId, locationId) {
  const res = await apiClient.delete(`${BASE}/${employeeId}/${locationId}`);
  return res.data?.data ?? res.data;
}
