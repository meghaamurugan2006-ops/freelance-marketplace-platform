const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["held", "released"], default: "held" },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Escrow", escrowSchema);
