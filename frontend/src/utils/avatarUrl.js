/**
 * تحويل رابط الصورة (مسار نسبي أو كامل) إلى رابط مطلق للعرض.
 * يدعم روابط كاملة (مثل Cloudinary) ومسارات الباكند.
 */
import { apiClient } from "../services/apiClient";

const API_ORIGIN = (apiClient.defaults.baseURL || "").replace(/\/api\/v1\/?$/, "");

export function toAbsoluteAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${API_ORIGIN}${path}`;
}
