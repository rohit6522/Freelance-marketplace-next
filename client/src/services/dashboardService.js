import { api } from "@/lib/api";

export const client = () => api.get("/dashboard/client");
export const freelancer = () => api.get("/dashboard/freelancer");