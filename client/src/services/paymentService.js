import { api } from "@/lib/api";

export const getSummary = () => api.get("/payments/summary");