import { api } from "@/lib/api";

export const register = (body) => api.post("/auth/register", body);
export const login = (body) => api.post("/auth/login", body);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");
export const updateMe = (body) => api.patch("/auth/me", body);
export const changePassword = (body) => api.patch("/auth/change-password", body);
export const forgotPassword = (body) => api.post("/auth/forgot-password", body);
export const resetPassword = (token, body) => api.patch(`/auth/reset-password/${token}`, body);