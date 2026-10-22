const Project = require("../models/Project");

async function listProjects(req, res) {
  try {
    const { status, skill, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (skill) filter.skills = skill;
    if (q) filter.title = { $regex: q, $options: "i" };

    const projects = await Project.find(filter)
      .populate("client", "name email company")
      .populate("selectedFreelancer", "name email")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Could not load projects.", error: err.message });
  }
}

async function getProject(req, res) {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email company")
      .populate("selectedFreelancer", "name email");
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: "Could not load the project.", error: err.message });
  }
}

async function createProject(req, res) {
  try {
    const { title, description, skills, budget, deadline } = req.body;
    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ message: "Title, description, budget, and deadline are required." });
    }
    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      skills: Array.isArray(skills) ? skills : [],
      budget,
      deadline,
    });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: "Could not post the project.", error: err.message });
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (String(project.client) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the project owner can edit this listing." });
    }
    if (project.status !== "open") {
      return res.status(400).json({ message: "Only open projects can be edited." });
    }

    const editable = ["title", "description", "skills", "budget", "deadline"];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });
    await project.save();
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: "Could not update the project.", error: err.message });
  }
}

module.exports = { listProjects, getProject, createProject, updateProject };
