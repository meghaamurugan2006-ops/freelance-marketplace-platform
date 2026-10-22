const Project = require("../models/Project");
const Bid = require("../models/Bid");
const Escrow = require("../models/Escrow");
const Message = require("../models/Message");

async function listBidsForProject(req, res) {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate("freelancer", "name email skills")
      .sort({ createdAt: -1 });
    res.json({ bids });
  } catch (err) {
    res.status(500).json({ message: "Could not load proposals.", error: err.message });
  }
}

async function createBid(req, res) {
  try {
    const { amount, message } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.status !== "open") return res.status(400).json({ message: "This project is no longer accepting proposals." });
    if (!amount) return res.status(400).json({ message: "A bid amount is required." });

    const existing = await Bid.findOne({ project: project._id, freelancer: req.user._id });
    if (existing) return res.status(409).json({ message: "You've already sent a proposal for this project." });

    const bid = await Bid.create({
      project: project._id,
      freelancer: req.user._id,
      amount,
      message: message || "",
    });
    res.status(201).json({ bid });
  } catch (err) {
    res.status(500).json({ message: "Could not send the proposal.", error: err.message });
  }
}

async function acceptBid(req, res) {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: "Proposal not found." });

    const project = await Project.findById(bid.project);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (String(project.client) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the project owner can accept a proposal." });
    }
    if (project.status !== "open") {
      return res.status(400).json({ message: "This project has already been assigned." });
    }

    bid.status = "accepted";
    await bid.save();
    await Bid.updateMany({ project: project._id, _id: { $ne: bid._id } }, { status: "rejected" });

    project.status = "in_progress";
    project.selectedFreelancer = bid.freelancer;
    await project.save();

    const escrow = await Escrow.create({
      project: project._id,
      amount: bid.amount,
      status: "held",
    });

    await Message.create({
      project: project._id,
      sender: req.user._id,
      text: "Looking forward to working together on this — let me know if you need anything to get started.",
    });

    res.json({ project, bid, escrow });
  } catch (err) {
    res.status(500).json({ message: "Could not accept the proposal.", error: err.message });
  }
}

module.exports = { listBidsForProject, createBid, acceptBid };
