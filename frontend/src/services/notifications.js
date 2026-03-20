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
 * Tries GET /api/v1/notifications/settings, then GET /api/v1/notification-settings on 404
 */
export const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get("/notifications/settings");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await apiClient.get("/notification-settings");
      return fallback.data?.data ?? fallback.data;
    }
    throw err;
  }
};

/**
 * Update notification settings
 * Tries PUT /api/v1/notifications/settings, then PUT /api/v1/notification-settings on 404
 */
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await apiClient.put("/notifications/settings", settings);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await apiClient.put("/notification-settings", settings);
      return fallback.data?.data ?? fallback.data;
    }
    throw err;
  }
};
