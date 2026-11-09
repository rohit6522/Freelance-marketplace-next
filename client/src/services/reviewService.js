import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const list = (params) => api.get(`/reviews${buildQuery(params)}`);
export const mine = (params) => api.get(`/reviews/mine${buildQuery(params)}`);
export const pending = () => api.get("/reviews/pending");
export const create = (body) => api.post("/reviews", body);
export const respond = (id, message) => api.patch(`/reviews/${id}/response`, { message });
export const report = (id, reason) => api.post(`/reviews/${id}/report`, { reason });