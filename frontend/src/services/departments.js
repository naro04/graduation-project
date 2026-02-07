import { apiClient } from "./apiClient";

const BASE = "/departments";

/**
 * GET http://localhost:5000/api/v1/departments
 * قائمة الإدارات
 */
export async function getDepartments(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/departments
 * إنشاء إدارة جديدة
 * @param {{ name: string, status?: string, description?: string }} payload
 */
export async function createDepartment(payload) {
  const res = await apiClient.post(BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * POST http://localhost:5000/api/v1/departments/bulk-action
 * إجراء جماعي (حذف، مراجعة، إلخ)
 * @param {{ action: string, ids: string[] }} payload
 */
export async function bulkActionDepartments(payload) {
  const res = await apiClient.post(`${BASE}/bulk-action`, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/departments/:id
 * إدارة واحدة بالمعرف
 */
export async function getDepartmentById(id) {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * PUT http://localhost:5000/api/v1/departments/:id
 * تحديث إدارة
 * @param {{ name?: string, status?: string, description?: string }} payload
 */
export async function updateDepartment(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/departments/:id
 * حذف إدارة
 */
export async function deleteDepartment(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
