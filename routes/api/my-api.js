const express = require("express");
const router = express.Router();
const User = require("../../models/user.model");
// @route   POST api/users
// @desc    Get users content

router.get("/all", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const user = await User.findOne({ apiKey }).select("projects blogs");

  res.json({ status: "success", user });
});

router.get("/projects", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const user = await User.findOne({ apiKey }).select("projects");

  res.json({ status: "success", user });
});

router.get("/blogs", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const user = await User.findOne({ apiKey }).select("blogs");

  res.json({ status: "success", user });
});

module.exports = router;
