import axios from "axios";

const RAILWAY_API = "https://graduation-project-production-0a21.up.railway.app/api/v1";
const baseURL = import.meta.env.VITE_API_BASE_URL || RAILWAY_API;
// للتأكد: افتح Console في المتصفح وشوف لون الطلبات يروح على وين
if (import.meta.env.DEV) {
  console.log("[API] الطلبات تروح على:", baseURL);
}
export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// لو في توكن:
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // تغيير من "token" إلى "authToken" ليتوافق مع api.js
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // عند إرسال FormData لا نستخدم application/json حتى يضيف المتصفح multipart/form-data مع boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});
