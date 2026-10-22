const Project = require("../models/Project");
const Message = require("../models/Message");

function isParticipant(project, userId) {
  return String(project.client) === String(userId) || String(project.selectedFreelancer) === String(userId);
}

async function listMessages(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isParticipant(project, req.user._id)) {
      return res.status(403).json({ message: "You're not part of this project's conversation." });
    }
    const messages = await Message.find({ project: project._id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Could not load messages.", error: err.message });
  }
}

async function createMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Message text is required." });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isParticipant(project, req.user._id)) {
      return res.status(403).json({ message: "You're not part of this project's conversation." });
    }

    const message = await Message.create({ project: project._id, sender: req.user._id, text: text.trim() });

    const io = req.app.get("io");
    if (io) io.to(String(project._id)).emit("message:new", message);

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: "Could not send the message.", error: err.message });
  }
}

module.exports = { listMessages, createMessage };
