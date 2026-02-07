import { apiClient } from "./apiClient";

/**
 * Get notification settings
 * GET /notifications/settings
 * @returns {Promise<object>} - Notification settings (e.g. attendance_*, leave_*, etc.)
 */
export const getNotificationSettings = async () => {
  const response = await apiClient.get("/notifications/settings");
  return response.data?.data ?? response.data;
};

/**
 * Update notification settings
 * PUT /notifications/settings
 * @param {Object} settings - Notification preferences (e.g. attendance_check_in_out_email, leave_new_request_email)
 * @returns {Promise<object>} - Updated settings
 */
export const updateNotificationSettings = async (settings) => {
  const response = await apiClient.put("/notifications/settings", settings);
  return response.data?.data ?? response.data;
};
