import { api } from "@/lib/api";

export const mine = () => api.get("/portfolio/mine");
export const create = (body) => api.post("/portfolio", body);
export const update = (id, body) => api.patch(`/portfolio/${id}`, body);
export const remove = (id) => api.delete(`/portfolio/${id}`);