import PortfolioProject from "../models/PortfolioProject.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";

const FIELDS = [
  "title", "description", "images", "externalLink", "category",
  "highlightMetric", "deliverables", "duration", "displayOrder",
];
const MAX_PROJECTS = 20;

const findOwned = async (id, userId) => {
  // Dusre ka project ho to bhi 404 (exist karta hai ye bhi nahi batate)
  const project = await PortfolioProject.findOne({ _id: id, freelancer: userId });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
};

// GET /api/portfolio/mine
export const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await PortfolioProject.find({ freelancer: req.user._id }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
  res.json({ success: true, data: { projects } });
});

// POST /api/portfolio
export const createProject = asyncHandler(async (req, res) => {
  const count = await PortfolioProject.countDocuments({ freelancer: req.user._id });
  if (count >= MAX_PROJECTS) {
    throw new ApiError(400, `You can add at most ${MAX_PROJECTS} portfolio projects`);
  }

  const project = await PortfolioProject.create({
    ...pick(req.body, FIELDS),
    freelancer: req.user._id,
  });
  res.status(201).json({ success: true, message: "Project added", data: { project } });
});

// PATCH /api/portfolio/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await findOwned(req.params.id, req.user._id);
  project.set(pick(req.body, FIELDS));
  await project.save();
  res.json({ success: true, message: "Project updated", data: { project } });
});

// DELETE /api/portfolio/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwned(req.params.id, req.user._id);
  await project.deleteOne();
  res.json({ success: true, message: "Project deleted" });
});