import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
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
