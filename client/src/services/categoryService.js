import { api } from "@/lib/api";

export const list = () => api.get("/categories");