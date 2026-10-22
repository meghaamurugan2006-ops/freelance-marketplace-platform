const express = require("express");
const { markDelivered, releaseEscrow, listMyEscrow } = require("../controllers/escrowController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listMyEscrow);
router.post("/project/:projectId/deliver", requireAuth, requireRole("freelancer"), markDelivered);
router.post("/project/:projectId/release", requireAuth, requireRole("client"), releaseEscrow);

module.exports = router;
