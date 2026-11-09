import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const list = (params) => api.get(`/conversations${buildQuery(params)}`);
export const start = (body) => api.post("/conversations", body);
export const getMessages = (id, params) => api.get(`/conversations/${id}/messages${buildQuery(params)}`);
export const sendMessage = (id, body) => api.post(`/conversations/${id}/messages`, body);