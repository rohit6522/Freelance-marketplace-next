import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const start = (body) => api.post("/conversations", body);
export const sendMessage = (id, body) => api.post(`/conversations/${id}/messages`, body);
export const getMessages = (id, params) => api.get(`/conversations/${id}/messages${buildQuery(params)}`);