import { apiClient } from "./apiClient";

const BASE = "/positions";

/**
 * GET http://localhost:5000/api/v1/positions
 * جلب كل المناصب
 */
export async function getPositions(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/positions
 * إنشاء منصب جديد
 */
export async function createPosition(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/positions/:id
 * منصب واحد بالمعرف
 */
export async function getPositionById(id) {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * PUT http://localhost:5000/api/v1/positions/:id
 * تحديث منصب
 */
export async function updatePosition(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/positions/:id
 * حذف منصب
 */
export async function deletePosition(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
