const express = require("express");
const { listMessages, createMessage } = require("../controllers/messageController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/project/:projectId", requireAuth, listMessages);
router.post("/project/:projectId", requireAuth, createMessage);

module.exports = router;
