import { Router } from "express";
import {
  getMyProjects, createProject, updateProject, deleteProject,
} from "../controllers/portfolioController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validators/commonValidators.js";
import { createProjectRules, updateProjectRules } from "../validators/portfolioValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
router.use(protect, restrictTo(ROLES.FREELANCER));

router.get("/mine", getMyProjects);
router.post("/", createProjectRules, validate, createProject);
router.patch("/:id", idParam, updateProjectRules, validate, updateProject);
router.delete("/:id", idParam, validate, deleteProject);

export default router;