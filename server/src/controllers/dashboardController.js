import asyncHandler from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboardService.js";

export const getClientDashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await dashboardService.getClientDashboard(req.user) });
});

export const getFreelancerDashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await dashboardService.getFreelancerDashboard(req.user) });
});