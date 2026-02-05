// RBAC Service – يتوافق مع:
// GET/POST http://localhost:5000/api/v1/rbac/roles
// GET/PUT/DELETE http://localhost:5000/api/v1/rbac/roles/:id
// GET/POST http://localhost:5000/api/v1/rbac/permissions

import { apiClient } from "./apiClient";

const ROLES_BASE = "/rbac/roles";
const PERMISSIONS_BASE = "/rbac/permissions";

/**
 * GET /rbac/roles – جلب كل الأدوار
 */
export async function getRoles() {
  const res = await apiClient.get(ROLES_BASE);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST /rbac/roles – إنشاء دور جديد
 * @param {{ name: string, description?: string }} payload
 */
export async function createRole(payload) {
  const res = await apiClient.post(ROLES_BASE, payload);
  return res.data?.data ?? res.data;
}

/**
 * GET /rbac/roles/:id – جلب دور بالمعرف (مع الصلاحيات)
 */
export async function getRoleById(roleId) {
  const res = await apiClient.get(`${ROLES_BASE}/${roleId}`);
  return res.data?.data ?? res.data;
}

/**
 * PUT /rbac/roles/:id – تحديث دور (مثلاً الصلاحيات)
 * @param {string} roleId
 * @param {object} data – مثلاً { permissionIds: string[] } أو حقول الدور
 */
export async function updateRole(roleId, data) {
  const body = Array.isArray(data) ? { permissionIds: data } : (data?.permissionIds != null ? data : { ...data });
  const res = await apiClient.put(`${ROLES_BASE}/${roleId}`, body);
  return res.data?.data ?? res.data;
}

/**
 * DELETE /rbac/roles/:id – حذف دور
 */
export async function deleteRole(roleId) {
  const res = await apiClient.delete(`${ROLES_BASE}/${roleId}`);
  return res.data?.data ?? res.data;
}

/**
 * GET /rbac/permissions – جلب كل الصلاحيات
 */
export async function getPermissions() {
  const res = await apiClient.get(PERMISSIONS_BASE);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.records ?? [];
}

/**
 * POST /rbac/permissions – إنشاء صلاحية جديدة
 * @param {{ resource?: string, action?: string, permissionType?: string, slug?: string }} payload
 */
export async function createPermission(payload) {
  const res = await apiClient.post(PERMISSIONS_BASE, payload);
  return res.data?.data ?? res.data;
}
