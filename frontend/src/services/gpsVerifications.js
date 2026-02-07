import { apiClient } from "./apiClient";

const BASE = "/gps-verifications";

/**
 * GET http://localhost:5000/api/v1/gps-verifications
 * قائمة سجلات التحقق من GPS
 */
export async function getGPSVerifications() {
  const res = await apiClient.get(BASE);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * GET http://localhost:5000/api/v1/gps-verifications/stats
 * إحصائيات التحقق من GPS
 */
export async function getGPSVerificationsStats() {
  const res = await apiClient.get(`${BASE}/stats`);
  const raw = res.data?.data ?? res.data;
  return raw && typeof raw === "object" ? raw : {};
}

/**
 * POST http://localhost:5000/api/v1/gps-verifications/:id/verify
 * تأكيد/تحقق من سجل حضور (id = attendance_id أو سجل التحقق)
 */
export async function verifyGPSCheckIn(id) {
  const res = await apiClient.post(`${BASE}/${id}/verify`);
  return res.data?.data ?? res.data;
}

/**
 * PUT تحديث حالة التحقق (إن وُجد في الباكند)
 * gps_status: "verified" | "rejected" | "suspicious" | "not_verified" (أو القيمة التي يتوقعها الباكند)
 */
export async function updateGPSVerificationStatus(id, gps_status) {
  const value = typeof gps_status === "string" ? gps_status : String(gps_status);
  const res = await apiClient.put(`${BASE}/${id}/status`, { gps_status: value });
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/gps-verifications/:id
 * حذف سجل التحقق (إن وُجد في الباكند — إن لم يكن موجوداً نعتمد على PUT status Rejected)
 */
export async function deleteGPSVerification(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
