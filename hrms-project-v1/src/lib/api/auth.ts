import api from "../api";

export const authApi = {
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  getMyPermissions: async () => {
    const res = await api.get("/auth/me/permissions");
    return res.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (data: any) => {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  },

  setPassword: async (data: any) => {
    const res = await api.post("/auth/set-password", data);
    return res.data;
  },

  sendRegistrationOtp: async (email: string) => {
    const res = await api.post("/auth/send-registration-otp", { email });
    return res.data;
  },

  verifyRegistrationOtp: async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-registration-otp", { email, otp });
    return res.data;
  },
};

