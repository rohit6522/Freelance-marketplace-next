import asyncHandler from "../utils/asyncHandler.js";
import * as statsService from "../services/platformStatsService.js";

// GET /api/stats/public   (login/register ke side panels)
export const getPublicStats = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "public, max-age=30");
  res.json({ success: true, data: await statsService.getPublicStats() });
});