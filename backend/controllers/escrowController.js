const Project = require("../models/Project");
const Escrow = require("../models/Escrow");

async function markDelivered(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (String(project.selectedFreelancer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned freelancer can mark this as delivered." });
    }
    if (project.status !== "in_progress") {
      return res.status(400).json({ message: "Only an in-progress project can be marked delivered." });
    }
    project.status = "delivered";
    await project.save();
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: "Could not update the project.", error: err.message });
  }
}

async function releaseEscrow(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (String(project.client) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the client can release escrow funds." });
    }
    if (project.status !== "delivered") {
      return res.status(400).json({ message: "The project must be marked delivered before funds can be released." });
    }

    const escrow = await Escrow.findOne({ project: project._id });
    if (!escrow || escrow.status === "released") {
      return res.status(400).json({ message: "There are no held funds to release for this project." });
    }

    escrow.status = "released";
    escrow.releasedAt = new Date();
    await escrow.save();

    project.status = "completed";
    await project.save();

    res.json({ project, escrow });
  } catch (err) {
    res.status(500).json({ message: "Could not release the funds.", error: err.message });
  }
}

async function listMyEscrow(req, res) {
  try {
    const projects = await Project.find(
      req.user.role === "client" ? { client: req.user._id } : { selectedFreelancer: req.user._id }
    );
    const projectIds = projects.map((p) => p._id);
    const escrow = await Escrow.find({ project: { $in: projectIds } }).populate("project");
    res.json({ escrow });
  } catch (err) {
    res.status(500).json({ message: "Could not load escrow records.", error: err.message });
  }
}

module.exports = { markDelivered, releaseEscrow, listMyEscrow };
