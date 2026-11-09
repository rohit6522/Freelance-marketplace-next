import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const getIds = () => api.get("/favorites/ids");
export const list = (params) => api.get(`/favorites${buildQuery(params)}`);
export const add = (gigId) => api.post(`/favorites/${gigId}`);
export const remove = (gigId) => api.delete(`/favorites/${gigId}`);