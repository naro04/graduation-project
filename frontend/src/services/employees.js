// Employees Service – يستخدم apiClient (نفس base URL والتوكن)
import { apiClient } from "./apiClient";

const BASE = "/employees";

/**
 * GET http://localhost:5000/api/v1/employees
 * قائمة كل الموظفين
 */
export async function getEmployees(params = {}) {
  const res = await apiClient.get(BASE, { params });
  const raw = res.data?.data ?? res.data;
  const list = Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
  return { data: list };
}

/**
 * POST http://localhost:5000/api/v1/employees
 * إنشاء موظف جديد
 */
export async function createEmployee(payload) {
  const res = await apiClient.post(BASE, payload);
  const data = res.data?.data ?? res.data;
  return data != null ? { data } : res.data;
}

/**
 * GET http://localhost:5000/api/v1/employees/team/members
 * أعضاء الفريق التابعين لي (للمدير)
 */
export async function getTeamMembers(params = {}) {
  const res = await apiClient.get(`${BASE}/team/members`, { params });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * GET http://localhost:5000/api/v1/employees/reports
 * تقارير HR
 */
export async function getHRReports(params = {}) {
  const res = await apiClient.get(`${BASE}/reports`, { params });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  return raw?.reports ?? raw?.items ?? raw?.records ?? [];
}

/**
 * POST http://localhost:5000/api/v1/employees/bulk-action
 * إجراء جماعي على موظفين
 * @param {{ action: string, ids: string[] }} payload
 */
export async function bulkActionEmployees(payload) {
  const res = await apiClient.post(`${BASE}/bulk-action`, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET http://localhost:5000/api/v1/employees/:id
 * موظف واحد بالمعرف
 */
export async function getEmployeeById(id) {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * PUT http://localhost:5000/api/v1/employees/:id
 * تحديث موظف (كامل)
 */
export async function updateEmployee(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * PATCH http://localhost:5000/api/v1/employees/:id
 * تحديث جزئي لموظف
 */
export async function patchEmployee(id, payload) {
  const res = await apiClient.patch(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
}

/**
 * DELETE http://localhost:5000/api/v1/employees/:id
 * حذف/تعطيل موظف
 */
export async function deleteEmployee(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
}
