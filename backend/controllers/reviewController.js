const Project = require("../models/Project");
const Review = require("../models/Review");

async function createReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.status !== "completed") {
      return res.status(400).json({ message: "Reviews can only be left once a project is completed." });
    }

    const isClient = String(project.client) === String(req.user._id);
    const isFreelancer = String(project.selectedFreelancer) === String(req.user._id);
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: "Only the client or freelancer on this project can leave a review." });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const toUser = isClient ? project.selectedFreelancer : project.client;
    const existing = await Review.findOne({ project: project._id, from: req.user._id });
    if (existing) return res.status(409).json({ message: "You've already reviewed this project." });

    const review = await Review.create({
      project: project._id,
      from: req.user._id,
      to: toUser,
      rating,
      comment: comment || "",
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: "Could not post the review.", error: err.message });
  }
}

async function listReviewsForUser(req, res) {
  try {
    const reviews = await Review.find({ to: req.params.userId }).populate("from", "name");
    const average = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : null;
    res.json({ reviews, average });
  } catch (err) {
    res.status(500).json({ message: "Could not load reviews.", error: err.message });
  }
}

module.exports = { createReview, listReviewsForUser };
