import { api } from "@/lib/api";

export const getIds = () => api.get("/favorites/ids");
export const add = (gigId) => api.post(`/favorites/${gigId}`);
export const remove = (gigId) => api.delete(`/favorites/${gigId}`);