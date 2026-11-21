import axios from "axios";

// Dedicated Axios instance for SaaS Platform Administration APIs
const platformApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
});

// Strictly isolated token storage: platform_token (never conflated with tenant hrms_token)
platformApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("platform_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle unauthorized responses by redirecting specifically to platform login
platformApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("platform_token");
      localStorage.removeItem("platform_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { platformApi };
export default platformApi;

