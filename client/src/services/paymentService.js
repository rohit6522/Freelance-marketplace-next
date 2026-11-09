import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const getSummary = () => api.get("/payments/summary");
export const list = (params) => api.get(`/payments${buildQuery(params)}`);