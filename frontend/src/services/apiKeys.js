// API Keys Service
// GET /api-keys, POST /api-keys, PUT /api-keys/:id, DELETE /api-keys/:id
import { apiClient } from "./apiClient";

/**
 * Get all API keys
 * GET /api-keys
 */
export const getApiKeys = async () => {
  const response = await apiClient.get("/api-keys");
  return response.data?.data ?? response.data ?? [];
};

/**
 * Create a new API key
 * POST /api-keys
 * @param {Object} keyData - e.g. { name: "My Key" }
 */
export const createApiKey = async (keyData) => {
  const response = await apiClient.post("/api-keys", keyData);
  return response.data?.data ?? response.data;
};

/**
 * Update an API key
 * PUT /api-keys/:id
 * @param {string} id - API key id
 * @param {Object} data - e.g. { name: "New Name" }
 */
export const updateApiKey = async (id, data) => {
  const response = await apiClient.put(`/api-keys/${id}`, data);
  return response.data?.data ?? response.data;
};

/**
 * Regenerate/Rotate an API key
 * PUT /api-keys/:id/rotate
 */
export const regenerateApiKey = async (keyId) => {
  const response = await apiClient.put(`/api-keys/${keyId}/rotate`);
  return response.data?.data ?? response.data;
};

/**
 * Delete an API key
 * DELETE /api-keys/:id
 */
export const deleteApiKey = async (keyId) => {
  const response = await apiClient.delete(`/api-keys/${keyId}`);
  return response.data?.data ?? response.data;
};
