import axios from "axios";

// الباكند المرفوع على Railway
const baseURL = "https://graduation-project-production-b02b.up.railway.app/api/v1";
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
