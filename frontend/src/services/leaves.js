import { apiClient } from "./apiClient";

const BASE = "/leaves";

/**
 * GET http://localhost:5000/api/v1/leaves
 * قائمة طلبات الإجازات (للإدارة/HR)
 */
export async function getLeaves(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/leaves
 * إنشاء طلب إجازة جديد
 * @param {Object|FormData} payload - leave_type, start_date, end_date, total_days?, reason, supporting_document? (File in FormData)
 */
export async function createLeave(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/leaves/:id
 * حذف طلب إجازة
 */
export async function deleteLeave(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/leaves/my
 * طلبات الإجازات الخاصة بالمستخدم الحالي
 */
export async function getMyLeaves(params = {}) {
  const res = await apiClient.get(`${BASE}/my`, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * GET http://localhost:5000/api/v1/leaves/my-stats
 * إحصائيات رصيد الإجازات للمستخدم الحالي
 */
export async function getMyLeaveStats() {
  const res = await apiClient.get(`${BASE}/my-stats`);
  const raw = res.data?.data ?? res.data;
  return raw && typeof raw === "object" ? raw : {};
}

/**
 * GET http://localhost:5000/api/v1/leaves/reports
 * تقارير الإجازات (للإدارة)
 */
export async function getLeaveReports(params = {}) {
  const res = await apiClient.get(`${BASE}/reports`, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.records ?? raw?.reports ?? [];
}

/**
 * PUT http://localhost:5000/api/v1/leaves/:id/status
 * تحديث حالة طلب الإجازة (موافقة/رفض)
 * الباكند يتوقع عادة: "approved" | "rejected" | "pending" (lowercase)
 */
export async function updateLeaveStatus(id, status, adminNotes = "") {
  const normalizedStatus =
    typeof status === "string"
      ? status.toLowerCase()
      : status;
  const res = await apiClient.put(`${BASE}/${id}/status`, {
    status: normalizedStatus,
    admin_notes: adminNotes || undefined,
  });
  return res.data?.data ?? res.data;
}
