import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const mine = (params) => api.get(`/gigs/mine${buildQuery(params)}`);
export const get = (idOrSlug) => api.get(`/gigs/${idOrSlug}`);
export const create = (body) => api.post("/gigs", body);
export const update = (id, body) => api.patch(`/gigs/${id}`, body);
export const setStatus = (id, status) => api.patch(`/gigs/${id}/status`, { status });
export const remove = (id) => api.delete(`/gigs/${id}`);