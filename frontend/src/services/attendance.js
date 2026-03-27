import { apiClient } from "./apiClient";

const BASE = "/attendance";

/**
 * POST /attendance/check-in
 * تسجيل الحضور (check-in)
 * @param {Object} payload - { location_id?, latitude?, longitude?, ... }
 */
export async function checkIn(payload = {}) {
  const res = await apiClient.post(`${BASE}/check-in`, payload);
  return res.data?.data ?? res.data;
}

/**
 * POST /attendance/check-out
 * تسجيل الانصراف (check-out)
 * @param {Object} payload - optional body
 */
export async function checkOut(payload = {}) {
  const res = await apiClient.post(`${BASE}/check-out`, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET /attendance/my-attendance
 * سجل حضوري (للموظف الحالي)
 * @param {Object} params - { from?, to?, page?, limit? }
 */
export async function getMyAttendance(params = {}) {
  const res = await apiClient.get(`${BASE}/my-attendance`, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.attendance ?? [];
}

/**
 * GET /attendance/my-attendance
 * Full payload including todayStatus for check-in/out summary.
 * @param {Object} params
 * @returns {Promise<Object>} raw response shape
 */
export async function getMyAttendanceOverview(params = {}) {
  const res = await apiClient.get(`${BASE}/my-attendance`, { params });
  const body = res.data?.data ?? res.data;
  if (!body || Array.isArray(body)) {
    return { records: Array.isArray(body) ? body : [], todayStatus: { checkedIn: false } };
  }
  return body;
}

/**
 * GET /attendance/daily
 * الحضور اليومي (لـ HR)
 * @param {Object} params - { date? (YYYY-MM-DD) }
 */
export async function getDailyAttendance(params = {}) {
  const res = await apiClient.get(`${BASE}/daily`, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.attendance ?? [];
}

/**
 * GET /attendance/team
 * حضور الفريق (للمدير) – Team Attendance
 * @param {Object} params - { date?, from?, to?, ... }
 */
export async function getTeamAttendance(params = {}) {
  const res = await apiClient.get(`${BASE}/team`, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.attendance ?? [];
}

/**
 * GET /attendance/reports
 * تقارير الحضور
 * @param {Object} params - { from?, to?, location_id?, status?, page?, limit? }
 */
export async function getAttendanceReports(params = {}) {
  const res = await apiClient.get(`${BASE}/reports`, { params });
  const body = res.data;
  if (Array.isArray(body)) return body;
  const raw = body?.data ?? body;
  if (Array.isArray(raw)) return raw;
  return raw?.records ?? raw?.items ?? raw?.reports ?? raw?.attendance ?? [];
}

/**
 * GET /attendance/locations
 * المواقع المتاحة للتسجيل (check-in)
 */
export async function getAttendanceLocations() {
  const res = await apiClient.get(`${BASE}/locations`);
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.locations ?? [];
}

/**
 * DELETE /attendance/:id
 * حذف سجل حضور
 */
export async function deleteAttendance(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
