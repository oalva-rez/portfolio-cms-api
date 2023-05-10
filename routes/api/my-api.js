const express = require("express");
const router = express.Router();
const User = require("../../models/user.model");
const { getAllProjects } = require("../../controllers/projectsController");
const { getAllBlogs } = require("../../controllers/blogsController");
const { getBlogBySlug } = require("../../controllers/blogsController");

// @route   GET api/users
// @desc    Get users content

router.get("/all", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const user = await User.findOne({ apiKey }).select("projects blogs");
  res.json({ status: "success", user });
});

router.get("/projects", getAllProjects);

router.get("/blogs", getAllBlogs);

router.get("/blogs/:slug", getBlogBySlug);

module.exports = router;
