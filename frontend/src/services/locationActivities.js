import { apiClient } from "./apiClient";

const BASE = "/location-activities";

/**
 * GET http://localhost:5000/api/v1/location-activities
 * قائمة أنشطة المواقع (يمكن تمرير location_id في params)
 */
export async function getLocationActivities(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.activities ?? [];
}

/**
 * POST http://localhost:5000/api/v1/location-activities
 * إنشاء نشاط موقع جديد
 */
export async function createLocationActivity(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/location-activities/reports
 * تقارير أنشطة المواقع (from, to, type, status, search)
 * Returns { records, stats: { completionTrend, participantsByType } } for table + charts
 */
export async function getLocationActivityReports(params = {}) {
  const res = await apiClient.get(`${BASE}/reports`, { params });
  const data = res.data;
  if (!data) return { records: [], stats: { completionTrend: [], participantsByType: [] } };
  if (Array.isArray(data)) return { records: data, stats: { completionTrend: [], participantsByType: [] } };
  const raw = data.data ?? data;
  const records = Array.isArray(raw)
    ? raw
    : (raw?.records ?? raw?.items ?? raw?.reports ?? []);
  const stats = raw?.stats ?? data?.stats ?? {};
  const completionTrend = Array.isArray(stats.completionTrend) ? stats.completionTrend : [];
  const participantsByType = Array.isArray(stats.participantsByType) ? stats.participantsByType : [];
  return {
    records: Array.isArray(records) ? records : [],
    stats: { completionTrend, participantsByType },
  };
}

/**
 * GET http://localhost:5000/api/v1/location-activities/:id
 * نشاط واحد بالمعرف
 */
export async function getLocationActivityById(id) {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/location-activities/:id/employees
 * موظفو نشاط معين
 */
export async function getActivityEmployees(activityId) {
  const res = await apiClient.get(`${BASE}/${activityId}/employees`);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * PUT http://localhost:5000/api/v1/location-activities/:id
 * تحديث نشاط موقع
 */
export async function updateLocationActivity(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/location-activities/:id
 * حذف نشاط موقع
 */
export async function deleteLocationActivity(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * PATCH http://localhost:5000/api/v1/location-activities/:id/approve
 * الموافقة على نشاط
 */
export async function approveLocationActivity(id) {
  const res = await apiClient.patch(`${BASE}/${id}/approve`);
  return res.data?.data ?? res.data;
}

/**
 * PATCH http://localhost:5000/api/v1/location-activities/:id/reject
 * رفض نشاط
 */
export async function rejectLocationActivity(id) {
  const res = await apiClient.patch(`${BASE}/${id}/reject`);
  return res.data?.data ?? res.data;
}

/**
 * POST http://localhost:5000/api/v1/location-activities/:id/assign
 * تعيين الفريق لنشاط (للمدير) – Team Activities assign
 * @param {string|number} activityId
 * @param {{ employee_ids: number[] }} payload
 */
export async function assignTeamToActivity(activityId, payload) {
  const res = await apiClient.post(`${BASE}/${activityId}/assign`, payload);
  return res.data?.data ?? res.data;
}
