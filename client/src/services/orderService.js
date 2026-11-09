import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const createOrder = (body) => api.post("/orders", body);
export const list = (params) => api.get(`/orders${buildQuery(params)}`);
export const get = (id) => api.get(`/orders/${id}`);

export const accept = (id) => api.patch(`/orders/${id}/accept`);
export const reject = (id, reason) => api.patch(`/orders/${id}/reject`, { reason: reason || undefined });
export const cancel = (id, reason) => api.patch(`/orders/${id}/cancel`, { reason: reason || undefined });
export const deliver = (id, body) => api.patch(`/orders/${id}/deliver`, body);
export const requestRevision = (id, message) => api.patch(`/orders/${id}/request-revision`, { message });
export const complete = (id) => api.patch(`/orders/${id}/complete`);

export const completeMilestone = (id, milestoneId) => api.patch(`/orders/${id}/milestones/${milestoneId}/complete`);
export const releaseMilestone = (id, milestoneId) => api.patch(`/orders/${id}/milestones/${milestoneId}/release`);