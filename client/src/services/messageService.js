import { api } from "@/lib/api";

export const getUnreadCount = () => api.get("/conversations/unread-count");