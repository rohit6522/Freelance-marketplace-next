import User from "../models/User.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import PortfolioProject from "../models/PortfolioProject.js";
import Gig from "../models/Gig.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { GIG_STATUS, ROLES } from "../utils/constants.js";
import { getFreelancerStats } from "../services/freelancerStatsService.js";

const PROFILE_FIELDS = [
  "title", "bio", "skills", "languages", "experienceYears", "location",
  "timezone", "hourlyRate", "weeklyHours", "availability",
  "accreditations", "workHistory",
];

// GET /api/freelancers/:id   (public profile page)
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, role: ROLES.FREELANCER, isActive: true });
  if (!user) throw new ApiError(404, "Freelancer not found");

  const [profile, portfolio, gigs, stats] = await Promise.all([
    FreelancerProfile.findOne({ user: id }),
    PortfolioProject.find({ freelancer: id }).sort({ displayOrder: 1, createdAt: -1 }),
    Gig.find({ freelancer: id, status: GIG_STATUS.PUBLISHED })
      .select("-description -faqs -deliverables")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(12),
    getFreelancerStats(id),
  ]);

  res.json({
    success: true,
    data: {
      // email jaisi private cheezein jaan-boojhkar nahi bheji
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        country: user.country,
        memberSince: user.createdAt,
      },
      profile,
      portfolio,
      gigs,
      stats,
    },
  });
});

// PUT /api/freelancers/me   (freelancer apni profile edit kare)
export const updateMyProfile = asyncHandler(async (req, res) => {
  let profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) profile = new FreelancerProfile({ user: req.user._id });

  profile.set(pick(req.body, PROFILE_FIELDS));
  await profile.save();

  res.json({ success: true, message: "Profile updated", data: { profile } });
});