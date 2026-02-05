import { apiClient } from "./apiClient";

const BASE = "/location-types";

/**
 * GET http://localhost:5000/api/v1/location-types
 * جلب كل أنواع المواقع
 */
export async function getLocationTypes(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/location-types
 * إنشاء نوع موقع جديد
 */
export async function createLocationType(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * PUT http://localhost:5000/api/v1/location-types/:id
 * تحديث نوع موقع
 */
export async function updateLocationType(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/location-types/:id
 * حذف نوع موقع
 */
export async function deleteLocationType(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
