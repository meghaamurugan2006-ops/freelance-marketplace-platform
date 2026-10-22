const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res) {
  try {
    const { name, email, password, role, skills } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (!["client", "freelancer"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'client' or 'freelancer'." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with that email already exists." });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      skills: Array.isArray(skills) ? skills : [],
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not create the account.", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Incorrect email or password." });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Incorrect email or password." });

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not log in.", error: err.message });
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

module.exports = { signup, login, me };
