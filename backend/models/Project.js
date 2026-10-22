const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    budget: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "delivered", "completed", "cancelled"],
      default: "open",
    },
    selectedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
