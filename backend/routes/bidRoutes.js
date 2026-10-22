const express = require("express");
const { listBidsForProject, createBid, acceptBid } = require("../controllers/bidController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/project/:projectId", requireAuth, listBidsForProject);
router.post("/project/:projectId", requireAuth, requireRole("freelancer"), createBid);
router.post("/:bidId/accept", requireAuth, requireRole("client"), acceptBid);

module.exports = router;
