import { apiRequest } from "./api";

export const backend = {
  auth: {
    signup: (data) => apiRequest("/auth/signup", { method: "POST", data }),
    sendOtp: (data) => apiRequest("/auth/send-otp", { method: "POST", data }),
    verifyOtp: (data) => apiRequest("/auth/verify-otp", { method: "POST", data }),
    forgotPassword: (data) => apiRequest("/auth/forgot-password", { method: "POST", data }),
    changePassword: (token, data) =>
      apiRequest("/auth/change-password", { method: "POST", token, data }),
  },
  user: {
    me: (token) => apiRequest("/user/me", { token }),
  },
  chatroom: {
    list: (token) => apiRequest("/chatroom", { token }),
    create: (token, data) => apiRequest("/chatroom", { method: "POST", token, data }),
    getById: (token, id) => apiRequest(`/chatroom/${id}`, { token }),
    sendMessage: (token, id, data) =>
      apiRequest(`/chatroom/${id}/message`, { method: "POST", token, data }),
  },
  subscription: {
    status: (token) => apiRequest("/subscription/status", { token }),
    checkoutPro: (token) => apiRequest("/subscribe/pro", { method: "POST", token }),
  },
};
