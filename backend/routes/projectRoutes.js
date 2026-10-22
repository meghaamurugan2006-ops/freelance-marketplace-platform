const express = require("express");
const { listProjects, getProject, createProject, updateProject } = require("../controllers/projectController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, requireRole("client"), createProject);
router.patch("/:id", requireAuth, requireRole("client"), updateProject);

module.exports = router;
