const express = require("express");
const { createReview, listReviewsForUser } = require("../controllers/reviewController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/project/:projectId", requireAuth, createReview);
router.get("/user/:userId", listReviewsForUser);

module.exports = router;
