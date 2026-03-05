import { apiClient } from "./apiClient";

// —— 🔔 Bell: list + mark read ——

/**
 * Get notifications list (for bell dropdown)
 * GET /api/v1/notifications
 * @returns {Promise<{ list: Array, unreadCount: number }>}
 */
export const getNotifications = async () => {
  const res = await apiClient.get("/notifications");
  const data = res.data?.data ?? res.data;
  const list = Array.isArray(data) ? data : data?.notifications ?? [];
  const unreadCount = res.data?.unreadCount ?? (list.filter((n) => !n.is_read)).length;
  return { list, unreadCount };
};

/**
 * Mark one notification as read
 * PATCH /api/v1/notifications/:id/read
 */
export const markNotificationRead = async (id) => {
  await apiClient.patch(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  await apiClient.patch("/notifications/read-all");
};

// —— ⚙️ Notification Settings (preferences page only) ——

/**
 * Get notification settings
 * GET /api/v1/notification-settings
 */
export const getNotificationSettings = async () => {
  const response = await apiClient.get("/notification-settings");
  return response.data?.data ?? response.data;
};

/**
 * Update notification settings
 * PATCH /api/v1/notification-settings
 */
export const updateNotificationSettings = async (settings) => {
  const response = await apiClient.patch("/notification-settings", settings);
  return response.data?.data ?? response.data;
};
