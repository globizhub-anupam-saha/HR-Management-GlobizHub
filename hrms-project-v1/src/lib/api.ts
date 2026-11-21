import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isPlatform = window.location.pathname.startsWith("/platform-admin");
    const token = isPlatform
      ? localStorage.getItem("platform_token") || localStorage.getItem("hrms_token") || localStorage.getItem("token")
      : localStorage.getItem("hrms_token") || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Automatically handle 401 Unauthorized (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isPlatform = window.location.pathname.startsWith("/platform-admin");
      // Do not wipe platform administration session from workspace API failures
      if (!isPlatform) {
        localStorage.removeItem("hrms_token");
        localStorage.removeItem("token");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Re-export domain modules
export { documentsApi } from "./api/documents";
export { employeesApi } from "./api/employees";
export { attendanceApi } from "./api/attendance";
export { leavesApi } from "./api/leaves";
export { payrollApi } from "./api/payroll";
export { recruitmentApi } from "./api/recruitment";
export { authApi } from "./api/auth";
export { designationsApi } from "./api/designations";
export { settingsApi } from "./api/settings";
export { organizationApi } from "./api/organization";
export { auditApi } from "./api/audit";

export default api;
